package com.gradexa.backend.controller;

import com.gradexa.backend.dto.StudentEnrollmentResponse;
import com.gradexa.backend.dto.StudentResponse;
import com.gradexa.backend.entity.Student;
import com.gradexa.backend.entity.StudentEnrollment;
import com.gradexa.backend.service.StudentService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(
            StudentService studentService
    ) {
        this.studentService = studentService;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL')")
    @PostMapping
    public ResponseEntity<StudentResponse> createStudent(
            @RequestParam Long userId,
            @RequestParam String studentNumber,
            @RequestParam String firstName,
            @RequestParam String lastName
    ) {

        Student student =
                studentService.createStudent(
                        userId,
                        studentNumber,
                        firstName,
                        lastName
                );

        return ResponseEntity.ok(
                toStudentResponse(student)
        );
    }

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

    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    @GetMapping("/{studentId}/enrollments")
    public ResponseEntity<List<StudentEnrollmentResponse>> getStudentEnrollments(
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

    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    @GetMapping("/class/{classId}")
    public ResponseEntity<List<StudentEnrollmentResponse>> getStudentsByClass(
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