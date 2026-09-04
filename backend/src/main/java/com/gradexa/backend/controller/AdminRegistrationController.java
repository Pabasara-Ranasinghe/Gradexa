package com.gradexa.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gradexa.backend.dto.RegistrationRequestResponse;
import com.gradexa.backend.entity.RegistrationStatus;
import com.gradexa.backend.entity.Role;
import com.gradexa.backend.entity.Student;
import com.gradexa.backend.entity.Teacher;
import com.gradexa.backend.entity.User;
import com.gradexa.backend.repository.StudentRepository;
import com.gradexa.backend.repository.TeacherRepository;
import com.gradexa.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/admin/registrations")
public class AdminRegistrationController {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;

    public AdminRegistrationController(
            UserRepository userRepository,
            StudentRepository studentRepository,
            TeacherRepository teacherRepository
    ) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
    }

    // ===============================
    // GET PENDING REGISTRATION REQUESTS
    // ADMIN ONLY
    // ===============================

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/pending")
    public ResponseEntity<List<RegistrationRequestResponse>>
    getPendingRegistrations() {

        List<RegistrationRequestResponse> pendingUsers =
                userRepository
                        .findByRegistrationStatus(
                                RegistrationStatus.PENDING
                        )
                        .stream()
                        .map(this::toRegistrationResponse)
                        .toList();

        return ResponseEntity.ok(pendingUsers);
    }

    // ===============================
    // APPROVE REGISTRATION
    // ADMIN ONLY
    // ===============================

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveRegistration(
            @PathVariable Long id
    ) {

        return userRepository.findById(id)
                .map(user -> {

                    if (user.getRegistrationStatus()
                            != RegistrationStatus.PENDING) {

                        return ResponseEntity
                                .badRequest()
                                .body(
                                        "Registration is not pending"
                                );
                    }

                    user.setRegistrationStatus(
                            RegistrationStatus.APPROVED
                    );

                    user.setActive(true);

                    userRepository.save(user);

                    return ResponseEntity.ok(
                            "Registration approved successfully"
                    );
                })
                .orElseGet(() ->
                        ResponseEntity
                                .notFound()
                                .build()
                );
    }

    // ===============================
    // CONVERT USER TO REGISTRATION RESPONSE
    // ===============================

    private RegistrationRequestResponse
    toRegistrationResponse(User user) {

        String firstName = null;
        String lastName = null;

        String studentId = null;
        java.time.LocalDate dateOfBirth = null;

        com.gradexa.backend.entity.SchoolSection requestedSection = null;
        Integer requestedGrade = null;

        String teacherId = null;
        com.gradexa.backend.entity.SchoolSection teacherSection = null;
        String subject = null;

        // ===============================
        // STUDENT DETAILS
        // ===============================

        if (user.getRole() == Role.STUDENT) {

            Student student =
                    studentRepository
                            .findByUser(user)
                            .orElse(null);

            if (student != null) {

                firstName = student.getFirstName();
                lastName = student.getLastName();

                studentId =
                        student.getStudentNumber();

                dateOfBirth =
                        student.getDateOfBirth();

                requestedSection =
                        student.getRequestedSection();

                requestedGrade =
                        student.getRequestedGrade();
            }
        }

        // ===============================
        // TEACHER DETAILS
        // ===============================

        if (user.getRole() == Role.TEACHER) {

            Teacher teacher =
                    teacherRepository
                            .findByUser(user)
                            .orElse(null);

            if (teacher != null) {

                firstName = teacher.getFirstName();
                lastName = teacher.getLastName();

                teacherId =
                        teacher.getTeacherNumber();

                teacherSection =
                        teacher.getSchoolSection();

                subject =
                        teacher.getSubject();
            }
        }

        return new RegistrationRequestResponse(
                user.getId(),
                user.getUsername(),
                user.getRole(),
                user.isActive(),
                user.getRegistrationStatus(),

                firstName,
                lastName,

                studentId,
                dateOfBirth,
                requestedSection,
                requestedGrade,

                teacherId,
                teacherSection,
                subject,

                user.getCreatedAt()
        );
    }
}