package com.gradexa.backend.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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


    // ==========================================================
    // CREATE STUDENT
    // ==========================================================

    /*
     * Existing Admin / Principal student creation.
     *
     * This version creates a Student record linked to an
     * existing STUDENT User account.
     */
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


    // ==========================================================
    // CREATE STUDENT - TEACHER
    // ==========================================================

    /*
     * Teachers create the academic student record.
     *
     * The student does NOT need a User account yet.
     *
     * Required:
     * - studentNumber
     * - firstName
     * - lastName
     * - dateOfBirth (optional)
     * - classId
     *
     * The student is automatically enrolled into the
     * selected class.
     */
    @PreAuthorize("hasRole('TEACHER')")
    @PostMapping("/teacher")
    public ResponseEntity<StudentEnrollmentResponse>
    createStudentForTeacher(
            @RequestParam String studentNumber,
            @RequestParam String firstName,
            @RequestParam String lastName,
            @RequestParam(required = false) LocalDate dateOfBirth,
            @RequestParam Long classId
    ) {

        StudentEnrollment enrollment =
                studentService.createStudentForTeacher(
                        studentNumber,
                        firstName,
                        lastName,
                        dateOfBirth,
                        classId
                );

        return ResponseEntity.ok(
                toEnrollmentResponse(enrollment)
        );
    }


    // ==========================================================
    // ENROLL STUDENT
    // ==========================================================

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


    // ==========================================================
    // UPDATE STUDENT - TEACHER
    // ==========================================================

    /*
     * Teachers can edit students who belong to one of their
     * assigned active classes.
     *
     * The User account is not changed here.
     */
    @PreAuthorize("hasRole('TEACHER')")
    @PutMapping("/{studentId}/teacher")
    public ResponseEntity<StudentResponse>
    updateStudentForTeacher(
            @PathVariable Long studentId,
            @RequestParam String studentNumber,
            @RequestParam String firstName,
            @RequestParam String lastName,
            @RequestParam(required = false) LocalDate dateOfBirth
    ) {

        Student student =
                studentService.updateStudentForTeacher(
                        studentId,
                        studentNumber,
                        firstName,
                        lastName,
                        dateOfBirth
                );

        return ResponseEntity.ok(
                toStudentResponse(student)
        );
    }


    // ==========================================================
    // DEACTIVATE STUDENT IN CLASS - TEACHER
    // ==========================================================

    /*
     * Deactivation applies to the student's enrollment in the
     * selected class.
     *
     * It does NOT delete the Student record.
     */
    @PreAuthorize("hasRole('TEACHER')")
    @PatchMapping("/{studentId}/deactivate")
    public ResponseEntity<StudentEnrollmentResponse>
    deactivateStudentForTeacher(
            @PathVariable Long studentId,
            @RequestParam Long classId
    ) {

        StudentEnrollment enrollment =
                studentService.deactivateStudentForTeacher(
                        studentId,
                        classId
                );

        return ResponseEntity.ok(
                toEnrollmentResponse(enrollment)
        );
    }


    // ==========================================================
    // REACTIVATE STUDENT IN CLASS - TEACHER
    // ==========================================================

    @PreAuthorize("hasRole('TEACHER')")
    @PatchMapping("/{studentId}/reactivate")
    public ResponseEntity<StudentEnrollmentResponse>
    reactivateStudentForTeacher(
            @PathVariable Long studentId,
            @RequestParam Long classId
    ) {

        StudentEnrollment enrollment =
                studentService.reactivateStudentForTeacher(
                        studentId,
                        classId
                );

        return ResponseEntity.ok(
                toEnrollmentResponse(enrollment)
        );
    }


    // ==========================================================
    // GET CURRENT LOGGED-IN STUDENT
    // ==========================================================

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/me")
    public ResponseEntity<StudentResponse> getCurrentStudent() {

        Student student =
                studentService.getCurrentStudent();

        return ResponseEntity.ok(
                toStudentResponse(student)
        );
    }


    // ==========================================================
    // GET CURRENT STUDENT ENROLLMENT
    // ==========================================================

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


    // ==========================================================
    // GET MY ENROLLMENTS
    // ==========================================================

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/me/enrollments")
    public ResponseEntity<List<StudentEnrollmentResponse>>
    getMyEnrollments() {

        Student student =
                studentService.getCurrentStudent();

        List<StudentEnrollmentResponse> enrollments =
                studentService
                        .getStudentEnrollments(
                                student.getId()
                        )
                        .stream()
                        .map(this::toEnrollmentResponse)
                        .toList();

        return ResponseEntity.ok(
                enrollments
        );
    }


    // ==========================================================
    // GET STUDENT BY ID
    // ==========================================================

    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    @GetMapping("/{id}")
    public ResponseEntity<StudentResponse> getStudent(
            @PathVariable Long id
    ) {

        Student student =
                studentService.getStudentById(
                        id
                );

        return ResponseEntity.ok(
                toStudentResponse(student)
        );
    }


    // ==========================================================
    // GET STUDENT ENROLLMENTS
    // ==========================================================

    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    @GetMapping("/{studentId}/enrollments")
    public ResponseEntity<List<StudentEnrollmentResponse>>
    getStudentEnrollments(
            @PathVariable Long studentId
    ) {

        List<StudentEnrollmentResponse> enrollments =
                studentService
                        .getStudentEnrollments(
                                studentId
                        )
                        .stream()
                        .map(this::toEnrollmentResponse)
                        .toList();

        return ResponseEntity.ok(
                enrollments
        );
    }


    // ==========================================================
    // GET STUDENTS BY CLASS
    // ==========================================================

    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    @GetMapping("/class/{classId}")
    public ResponseEntity<List<StudentEnrollmentResponse>>
    getStudentsByClass(
            @PathVariable Long classId
    ) {

        List<StudentEnrollmentResponse> students =
                studentService
                        .getStudentsByClass(
                                classId
                        )
                        .stream()
                        .map(this::toEnrollmentResponse)
                        .toList();

        return ResponseEntity.ok(
                students
        );
    }


    // ==========================================================
    // STUDENT RESPONSE
    // ==========================================================

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


    // ==========================================================
    // ENROLLMENT RESPONSE
    // ==========================================================

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