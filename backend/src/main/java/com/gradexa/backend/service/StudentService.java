package com.gradexa.backend.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gradexa.backend.entity.AcademicClass;
import com.gradexa.backend.entity.Role;
import com.gradexa.backend.entity.Student;
import com.gradexa.backend.entity.StudentEnrollment;
import com.gradexa.backend.entity.User;
import com.gradexa.backend.repository.StudentEnrollmentRepository;
import com.gradexa.backend.repository.StudentRepository;
import com.gradexa.backend.repository.UserRepository;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final StudentEnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final AcademicClassService academicClassService;

    public StudentService(
            StudentRepository studentRepository,
            StudentEnrollmentRepository enrollmentRepository,
            UserRepository userRepository,
            AcademicClassService academicClassService
    ) {
        this.studentRepository = studentRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.userRepository = userRepository;
        this.academicClassService = academicClassService;
    }

    // ===============================
    // CREATE STUDENT
    // ===============================

    @Transactional
    public Student createStudent(
            Long userId,
            String studentNumber,
            String firstName,
            String lastName,
            LocalDate dateOfBirth
    ) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );

        if (user.getRole() != Role.STUDENT) {
            throw new RuntimeException(
                    "Selected user must have STUDENT role"
            );
        }

        if (studentRepository.existsByUser(user)) {
            throw new RuntimeException(
                    "This user already has a student profile"
            );
        }

        if (studentNumber == null ||
                studentNumber.trim().isEmpty()) {

            throw new RuntimeException(
                    "Student number is required"
            );
        }

        if (studentRepository
                .existsByStudentNumber(studentNumber.trim())) {

            throw new RuntimeException(
                    "Student number already exists"
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

        Student student = new Student();

        student.setUser(user);

        student.setStudentNumber(
                studentNumber.trim()
        );

        student.setFirstName(
                firstName.trim()
        );

        student.setLastName(
                lastName.trim()
        );

        student.setDateOfBirth(
                dateOfBirth
        );

        student.setActive(true);

        return studentRepository.save(student);
    }

    // ===============================
    // ENROLL STUDENT
    // ===============================

    @Transactional
    public StudentEnrollment enrollStudent(
            Long studentId,
            Long classId
    ) {

        Student student = getStudentById(studentId);

        AcademicClass academicClass =
                academicClassService.getClassById(
                        classId
                );

        if (!academicClass.isActive()) {
            throw new RuntimeException(
                    "Cannot enroll student in an inactive class"
            );
        }

        if (enrollmentRepository
                .existsByStudentAndAcademicYear(
                        student,
                        academicClass.getAcademicYear()
                )) {

            throw new RuntimeException(
                    "Student is already enrolled for this academic year"
            );
        }

        StudentEnrollment enrollment =
                new StudentEnrollment();

        enrollment.setStudent(student);

        enrollment.setAcademicClass(
                academicClass
        );

        enrollment.setAcademicYear(
                academicClass.getAcademicYear()
        );

        enrollment.setActive(true);

        return enrollmentRepository.save(
                enrollment
        );
    }

    // ===============================
    // GET STUDENT
    // ===============================

    public Student getStudentById(
            Long id
    ) {

        return studentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Student not found"
                        )
                );
    }

    // ===============================
    // GET STUDENT ENROLLMENTS
    // ===============================

    public List<StudentEnrollment> getStudentEnrollments(
            Long studentId
    ) {

        Student student =
                getStudentById(studentId);

        return enrollmentRepository
                .findByStudent(student);
    }

    // ===============================
    // GET STUDENTS BY CLASS
    // ===============================

    public List<StudentEnrollment> getStudentsByClass(
            Long classId
    ) {

        return enrollmentRepository
                .findByAcademicClassIdAndActiveTrue(
                        classId
                );
    }
}