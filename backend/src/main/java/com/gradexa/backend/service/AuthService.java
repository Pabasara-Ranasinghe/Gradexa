package com.gradexa.backend.service;

import java.time.LocalDate;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gradexa.backend.entity.Role;
import com.gradexa.backend.entity.SchoolSection;
import com.gradexa.backend.entity.Student;
import com.gradexa.backend.entity.Teacher;
import com.gradexa.backend.entity.User;
import com.gradexa.backend.repository.StudentRepository;
import com.gradexa.backend.repository.TeacherRepository;
import com.gradexa.backend.repository.UserRepository;
import com.gradexa.backend.security.JwtService;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            StudentRepository studentRepository,
            TeacherRepository teacherRepository
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
    }

    // ===============================
    // REGISTER
    // ===============================

    @Transactional
    public User register(
            String username,
            String password,
            Role role,
            String firstName,
            String lastName,
            String studentId,
            String teacherId,
            LocalDate dateOfBirth,
            SchoolSection section,
            Integer grade,
            String subject
    ) {

        if (username == null ||
                username.trim().isEmpty()) {

            throw new RuntimeException(
                    "Username is required"
            );
        }

        if (password == null ||
                password.trim().isEmpty()) {

            throw new RuntimeException(
                    "Password is required"
            );
        }

        if (role == null) {

            throw new RuntimeException(
                    "Registration role is required"
            );
        }

        // Public registration is allowed only
        // for Student and Teacher accounts
        if (role != Role.STUDENT &&
                role != Role.TEACHER) {

            throw new RuntimeException(
                    "Only Student and Teacher accounts can be registered"
            );
        }

        String cleanUsername =
                username.trim();

        if (userRepository.existsByUsername(
                cleanUsername
        )) {

            throw new RuntimeException(
                    "Username already exists"
            );
        }

        if (firstName == null ||
                firstName.trim().isEmpty()) {

            throw new RuntimeException(
                    "First name is required"
            );
        }

        if (lastName == null ||
                lastName.trim().isEmpty()) {

            throw new RuntimeException(
                    "Last name is required"
            );
        }

        // ===============================
        // CREATE USER ACCOUNT
        // ===============================

        User user = new User();

        user.setUsername(cleanUsername);

        user.setPassword(
                passwordEncoder.encode(password)
        );

        user.setRole(role);

        // New registrations must wait
        // for administrator approval
        user.setActive(false);

        user = userRepository.save(user);

        // ===============================
        // STUDENT REGISTRATION
        // ===============================

        if (role == Role.STUDENT) {

            if (studentId == null ||
                    studentId.trim().isEmpty()) {

                throw new RuntimeException(
                        "Student ID is required"
                );
            }

            if (dateOfBirth == null) {

                throw new RuntimeException(
                        "Date of birth is required"
                );
            }

            if (section == null) {

                throw new RuntimeException(
                        "School section is required"
                );
            }

            if (grade == null) {

                throw new RuntimeException(
                        "Grade is required"
                );
            }

            if (grade < 1 ||
                    grade > 13) {

                throw new RuntimeException(
                        "Grade must be between 1 and 13"
                );
            }

            String cleanStudentId =
                    studentId.trim();

            // ==========================================
            // FIND THE EXISTING STUDENT RECORD
            // ==========================================

            Student student =
                    studentRepository
                            .findByStudentNumber(
                                    cleanStudentId
                            )
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "No student record found for this Student ID"
                                    )
                            );

            // ==========================================
            // CHECK WHETHER THE STUDENT ALREADY HAS
            // A USER ACCOUNT
            // ==========================================

            if (student.getUser() != null) {

                throw new RuntimeException(
                        "This Student ID is already linked to a user account"
                );
            }

            // ==========================================
            // LINK THE EXISTING STUDENT TO THE USER
            // ==========================================

            student.setUser(user);

            /*
             * Keep the Teacher-created student information.
             *
             * The student's academic record already exists.
             * We should not create a new Student record or
             * overwrite the existing academic information.
             */

            studentRepository.save(student);
        }

        // ===============================
        // TEACHER REGISTRATION
        // ===============================

        if (role == Role.TEACHER) {

            if (teacherId == null ||
                    teacherId.trim().isEmpty()) {

                throw new RuntimeException(
                        "Teacher ID is required"
                );
            }

            if (section == null) {

                throw new RuntimeException(
                        "School section is required"
                );
            }

            if (subject == null ||
                    subject.trim().isEmpty()) {

                throw new RuntimeException(
                        "Subject is required"
                );
            }

            String cleanTeacherId =
                    teacherId.trim();

            if (teacherRepository
                    .existsByTeacherNumber(
                            cleanTeacherId
                    )) {

                throw new RuntimeException(
                        "Teacher ID already exists"
                );
            }

            Teacher teacher =
                    new Teacher();

            teacher.setUser(user);

            teacher.setTeacherNumber(
                    cleanTeacherId
            );

            teacher.setFirstName(
                    firstName.trim()
            );

            teacher.setLastName(
                    lastName.trim()
            );

            teacher.setSchoolSection(
                    section
            );

            teacher.setSubject(
                    subject.trim()
            );

            teacher.setActive(true);

            teacherRepository.save(teacher);
        }

        return user;
    }

    // ===============================
    // LOGIN
    // ===============================

    public User login(
            String username,
            String password
    ) {

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                username,
                                password
                        )
                );

        if (!authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "Invalid username or password"
            );
        }

        return userRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );
    }

    // ===============================
    // GENERATE TOKEN
    // ===============================

    public String generateToken(
            String username
    ) {

        return jwtService.generateToken(
                username
        );
    }
}