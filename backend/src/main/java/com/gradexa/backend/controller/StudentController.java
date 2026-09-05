package com.gradexa.backend.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gradexa.backend.dto.StudentEnrollmentResponse;
import com.gradexa.backend.dto.StudentResponse;
import com.gradexa.backend.entity.Student;
import com.gradexa.backend.entity.StudentEnrollment;
import com.gradexa.backend.service.StudentService;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(
            StudentService studentService
    ) {
        this.studentService = studentService;
    }

    // ===============================
    // CREATE STUDENT
    // ===============================

    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL')")
    @PostMapping
    public ResponseEntity<StudentResponse> createStudent(
            @RequestParam Long userId,
            @RequestParam String studentNumber,
            @RequestParam String firstName,
            @RequestParam String lastName,
            @RequestParam(required = false) LocalDate dateOfBirth
    ) {

        Student student =
                studentService.createStudent(
                        userId,
                        studentNumber,
                        firstName,
                        lastName,
                        dateOfBirth
                );

        return ResponseEntity.ok(
                toStudentResponse(student)
        );
    }

    // ===============================
    // ENROLL STUDENT
    // ===============================

    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    @PostMapping("/{studentId}/enroll")
    public ResponseEntity<StudentEnrollmentResponse> enrollStudent(
            @PathVariable Long studentId,
            @RequestParam Long classId
    ) {

        StudentEnrollment enrollment =
                studentService.enrollStudent(
                        studentId,
                        classId
                );

        return ResponseEntity.ok(
                toEnrollmentResponse(enrollment)
        );
    }

    // ===============================
    // GET CURRENT LOGGED-IN STUDENT
    // ===============================

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/me")
    public ResponseEntity<StudentResponse> getCurrentStudent() {

        Student student =
                studentService.getCurrentStudent();

        return ResponseEntity.ok(
                toStudentResponse(student)
        );
    }

    // ===============================
    // GET CURRENT STUDENT ENROLLMENT
    // ===============================

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/me/enrollment")
    public ResponseEntity<StudentEnrollmentResponse>
    getCurrentStudentEnrollment() {

        StudentEnrollment enrollment =
                studentService
                        .getCurrentStudentEnrollment();

        return ResponseEntity.ok(
                toEnrollmentResponse(enrollment)
        );
    }

    // ===============================
    // GET MY ENROLLMENTS
    // ===============================

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/me/enrollments")
    public ResponseEntity<List<StudentEnrollmentResponse>>
    getMyEnrollments() {

        Student student =
                studentService.getCurrentStudent();

        List<StudentEnrollmentResponse> enrollments =
                studentService
                        .getStudentEnrollments(student.getId())
                        .stream()
                        .map(this::toEnrollmentResponse)
                        .toList();

        return ResponseEntity.ok(enrollments);
    }

    // ===============================
    // GET STUDENT BY ID
    // ===============================

    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    @GetMapping("/{id}")
    public ResponseEntity<StudentResponse> getStudent(
            @PathVariable Long id
    ) {

        Student student =
                studentService.getStudentById(id);

        return ResponseEntity.ok(
                toStudentResponse(student)
        );
    }

    // ===============================
    // GET STUDENT ENROLLMENTS
    // ===============================

    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    @GetMapping("/{studentId}/enrollments")
    public ResponseEntity<List<StudentEnrollmentResponse>>
    getStudentEnrollments(
            @PathVariable Long studentId
    ) {

        List<StudentEnrollmentResponse> enrollments =
                studentService
                        .getStudentEnrollments(studentId)
                        .stream()
                        .map(this::toEnrollmentResponse)
                        .toList();

        return ResponseEntity.ok(enrollments);
    }

    // ===============================
    // GET STUDENTS BY CLASS
    // ===============================

    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    @GetMapping("/class/{classId}")
    public ResponseEntity<List<StudentEnrollmentResponse>>
    getStudentsByClass(
            @PathVariable Long classId
    ) {

        List<StudentEnrollmentResponse> students =
                studentService
                        .getStudentsByClass(classId)
                        .stream()
                        .map(this::toEnrollmentResponse)
                        .toList();

        return ResponseEntity.ok(students);
    }

    // ===============================
    // STUDENT RESPONSE
    // ===============================

    private StudentResponse toStudentResponse(
            Student student
    ) {

        return new StudentResponse(
                student.getId(),
                student.getStudentNumber(),
                student.getFirstName(),
                student.getLastName(),
                student.getDateOfBirth(),
                student.isActive()
        );
    }

    // ===============================
    // ENROLLMENT RESPONSE
    // ===============================

    private StudentEnrollmentResponse toEnrollmentResponse(
            StudentEnrollment enrollment
    ) {

        Student student =
                enrollment.getStudent();

        return new StudentEnrollmentResponse(
                enrollment.getId(),
                student.getId(),
                student.getStudentNumber(),
                student.getFirstName(),
                student.getLastName(),
                enrollment.getAcademicClass().getId(),
                enrollment.getAcademicClass().getGrade(),
                enrollment.getAcademicClass().getSectionName(),
                enrollment.getAcademicYear(),
                enrollment.isActive()
        );
    }
}