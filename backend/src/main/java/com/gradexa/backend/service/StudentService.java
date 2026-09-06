package com.gradexa.backend.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gradexa.backend.entity.AcademicClass;
import com.gradexa.backend.entity.Role;
import com.gradexa.backend.entity.Student;
import com.gradexa.backend.entity.StudentEnrollment;
import com.gradexa.backend.entity.Teacher;
import com.gradexa.backend.entity.User;
import com.gradexa.backend.repository.StudentEnrollmentRepository;
import com.gradexa.backend.repository.StudentRepository;
import com.gradexa.backend.repository.TeacherClassAssignmentRepository;
import com.gradexa.backend.repository.TeacherRepository;
import com.gradexa.backend.repository.UserRepository;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final StudentEnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final AcademicClassService academicClassService;
    private final TeacherClassAssignmentRepository assignmentRepository;
    private final TeacherRepository teacherRepository;

    public StudentService(
            StudentRepository studentRepository,
            StudentEnrollmentRepository enrollmentRepository,
            UserRepository userRepository,
            AcademicClassService academicClassService,
            TeacherClassAssignmentRepository assignmentRepository,
            TeacherRepository teacherRepository
    ) {
        this.studentRepository = studentRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.userRepository = userRepository;
        this.academicClassService = academicClassService;
        this.assignmentRepository = assignmentRepository;
        this.teacherRepository = teacherRepository;
    }


    // ==========================================================
    // CREATE STUDENT - EXISTING ADMIN / PRINCIPAL FUNCTION
    // ==========================================================

    @Transactional
    public Student createStudent(
            Long userId,
            String studentNumber,
            String firstName,
            String lastName,
            LocalDate dateOfBirth
    ) {

        User user =
                userRepository.findById(userId)
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

        validateStudentDetails(
                studentNumber,
                firstName,
                lastName
        );

        Student student =
                new Student();

        student.setUser(
                user
        );

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

        student.setActive(
                true
        );

        return studentRepository.save(
                student
        );
    }


    // ==========================================================
    // CREATE STUDENT - TEACHER
    // ==========================================================

    /*
     * Teachers create the student record first.
     *
     * No User account is required here.
     *
     * The student can later request an account and the
     * approved account can be linked to this Student record.
     */

    @Transactional
    public StudentEnrollment createStudentForTeacher(
            String studentNumber,
            String firstName,
            String lastName,
            LocalDate dateOfBirth,
            Long classId
    ) {

        validateStudentDetails(
                studentNumber,
                firstName,
                lastName
        );

        requireTeacherAssignedToClass(
                classId
        );

        AcademicClass academicClass =
                academicClassService.getClassById(
                        classId
                );

        if (!academicClass.isActive()) {

            throw new RuntimeException(
                    "Cannot add a student to an inactive class."
            );
        }

        Student student =
                new Student();

        /*
         * The student does not have a User account yet.
         */
        student.setUser(
                null
        );

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

        student.setActive(
                true
        );

        Student savedStudent =
                studentRepository.save(
                        student
                );

        StudentEnrollment enrollment =
                new StudentEnrollment();

        enrollment.setStudent(
                savedStudent
        );

        enrollment.setAcademicClass(
                academicClass
        );

        enrollment.setAcademicYear(
                academicClass.getAcademicYear()
        );

        enrollment.setActive(
                true
        );

        return enrollmentRepository.save(
                enrollment
        );
    }


    // ==========================================================
    // ENROLL STUDENT
    // ==========================================================

    @Transactional
    public StudentEnrollment enrollStudent(
            Long studentId,
            Long classId
    ) {

        /*
         * Teachers can only enroll students into classes
         * assigned to them.
         */
        requireTeacherAssignedToClass(
                classId
        );

        Student student =
                getStudentById(
                        studentId
                );

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

        enrollment.setStudent(
                student
        );

        enrollment.setAcademicClass(
                academicClass
        );

        enrollment.setAcademicYear(
                academicClass.getAcademicYear()
        );

        enrollment.setActive(
                true
        );

        return enrollmentRepository.save(
                enrollment
        );
    }


    // ==========================================================
    // UPDATE STUDENT - TEACHER
    // ==========================================================

    @Transactional
    public Student updateStudentForTeacher(
            Long studentId,
            String studentNumber,
            String firstName,
            String lastName,
            LocalDate dateOfBirth
    ) {

        Student student =
                getStudentById(
                        studentId
                );

        /*
         * Make sure the logged-in teacher is allowed
         * to manage this student.
         */
        requireTeacherCanManageStudent(
                studentId
        );

        /*
         * Validate fields without checking the current
         * student number against itself.
         */
        if (studentNumber == null ||
                studentNumber.trim().isEmpty()) {

            throw new RuntimeException(
                    "Student number is required"
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

        String trimmedStudentNumber =
                studentNumber.trim();

        /*
         * Only check uniqueness if the student number
         * has actually changed.
         */
        if (!trimmedStudentNumber.equals(
                student.getStudentNumber()
        )) {

            boolean numberExists =
                    studentRepository
                            .existsByStudentNumber(
                                    trimmedStudentNumber
                            );

            if (numberExists) {

                throw new RuntimeException(
                        "Student number already exists"
                );
            }
        }

        student.setStudentNumber(
                trimmedStudentNumber
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

        return studentRepository.save(
                student
        );
    }


    // ==========================================================
    // DEACTIVATE STUDENT IN CLASS
    // ==========================================================

    @Transactional
    public StudentEnrollment deactivateStudentForTeacher(
            Long studentId,
            Long classId
    ) {

        requireTeacherAssignedToClass(
                classId
        );

        StudentEnrollment enrollment =
                getEnrollmentForStudentAndClass(
                        studentId,
                        classId
                );

        if (!enrollment.isActive()) {

            throw new RuntimeException(
                    "Student is already inactive in this class."
            );
        }

        enrollment.setActive(
                false
        );

        return enrollmentRepository.save(
                enrollment
        );
    }


    // ==========================================================
    // REACTIVATE STUDENT IN CLASS
    // ==========================================================

    @Transactional
    public StudentEnrollment reactivateStudentForTeacher(
            Long studentId,
            Long classId
    ) {

        requireTeacherAssignedToClass(
                classId
        );

        StudentEnrollment enrollment =
                getEnrollmentForStudentAndClass(
                        studentId,
                        classId
                );

        if (enrollment.isActive()) {

            throw new RuntimeException(
                    "Student is already active in this class."
            );
        }

        enrollment.setActive(
                true
        );

        return enrollmentRepository.save(
                enrollment
        );
    }


    // ==========================================================
    // GET STUDENT BY ID
    // ==========================================================

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


    // ==========================================================
    // GET CURRENT LOGGED-IN STUDENT
    // ==========================================================

    public Student getCurrentStudent() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "User is not authenticated"
            );
        }

        String username =
                authentication.getName();

        User user =
                userRepository
                        .findByUsername(username)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Logged-in user not found"
                                )
                        );

        return studentRepository
                .findByUser(user)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Student profile not found"
                        )
                );
    }


    // ==========================================================
    // GET CURRENT STUDENT ENROLLMENT
    // ==========================================================

    public StudentEnrollment
    getCurrentStudentEnrollment() {

        Student student =
                getCurrentStudent();

        return enrollmentRepository
                .findByStudentAndActiveTrue(student)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Current student enrollment not found"
                        )
                );
    }


    // ==========================================================
    // GET STUDENT ENROLLMENTS
    // ==========================================================

    public List<StudentEnrollment>
    getStudentEnrollments(
            Long studentId
    ) {

        Student student =
                getStudentById(
                        studentId
                );

        return enrollmentRepository
                .findByStudent(
                        student
                );
    }


    // ==========================================================
    // GET STUDENTS BY CLASS
    // ==========================================================

    public List<StudentEnrollment>
    getStudentsByClass(
            Long classId
    ) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "User is not authenticated"
            );
        }

        String username =
                authentication.getName();

        User user =
                userRepository
                        .findByUsername(username)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Logged-in user not found"
                                )
                        );

        /*
         * Teachers can only view students from classes
         * assigned to them.
         */
        if (user.getRole() == Role.TEACHER) {

            requireTeacherAssignedToClass(
                    classId
            );
        }

        return enrollmentRepository
                .findByAcademicClassId(
                        classId
                );
    }


    // ==========================================================
    // VALIDATE STUDENT DETAILS
    // ==========================================================

    private void validateStudentDetails(
            String studentNumber,
            String firstName,
            String lastName
    ) {

        if (studentNumber == null ||
                studentNumber.trim().isEmpty()) {

            throw new RuntimeException(
                    "Student number is required"
            );
        }

        if (studentRepository
                .existsByStudentNumber(
                        studentNumber.trim()
                )) {

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
    }


    // ==========================================================
    // REQUIRE TEACHER ASSIGNED TO CLASS
    // ==========================================================

    private void requireTeacherAssignedToClass(
            Long classId
    ) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "User is not authenticated"
            );
        }

        String username =
                authentication.getName();

        User user =
                userRepository
                        .findByUsername(username)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Logged-in user not found"
                                )
                        );

        /*
         * Admins and principals are not restricted
         * by teacher class assignments.
         */
        if (user.getRole() != Role.TEACHER) {
            return;
        }

        Teacher teacher =
                teacherRepository
                        .findByUser(user)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Teacher profile not found."
                                )
                        );

        boolean assigned =
                assignmentRepository
                        .findByTeacherIdAndActiveTrue(
                                teacher.getId()
                        )
                        .stream()
                        .anyMatch(
                                assignment ->
                                        assignment
                                                .getAcademicClass()
                                                .getId()
                                                .equals(
                                                        classId
                                                )
                        );

        if (!assigned) {

            throw new RuntimeException(
                    "You are not assigned to this class."
            );
        }
    }


    // ==========================================================
    // REQUIRE TEACHER CAN MANAGE STUDENT
    // ==========================================================

    private void requireTeacherCanManageStudent(
            Long studentId
    ) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "User is not authenticated"
            );
        }

        String username =
                authentication.getName();

        User user =
                userRepository
                        .findByUsername(username)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Logged-in user not found"
                                )
                        );

        /*
         * Non-teachers are not restricted by teacher
         * assignment checks.
         */
        if (user.getRole() != Role.TEACHER) {
            return;
        }

        Teacher teacher =
                teacherRepository
                        .findByUser(user)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Teacher profile not found."
                                )
                        );

        Student student =
                getStudentById(
                        studentId
                );

        List<StudentEnrollment> enrollments =
                enrollmentRepository
                        .findByStudent(
                                student
                        );

        boolean canManage =
                enrollments
                        .stream()
                        .filter(
                                StudentEnrollment::isActive
                        )
                        .anyMatch(
                                enrollment ->

                                        assignmentRepository
                                                .findByTeacherIdAndActiveTrue(
                                                        teacher.getId()
                                                )
                                                .stream()
                                                .anyMatch(
                                                        assignment ->

                                                                assignment
                                                                        .getAcademicClass()
                                                                        .getId()
                                                                        .equals(
                                                                                enrollment
                                                                                        .getAcademicClass()
                                                                                        .getId()
                                                                        )
                                                )
                        );

        if (!canManage) {

            throw new RuntimeException(
                    "You are not assigned to this student's class."
            );
        }
    }


    // ==========================================================
    // GET ENROLLMENT FOR STUDENT + CLASS
    // ==========================================================

    private StudentEnrollment
    getEnrollmentForStudentAndClass(
            Long studentId,
            Long classId
    ) {

        Student student =
                getStudentById(
                        studentId
                );

        AcademicClass academicClass =
                academicClassService.getClassById(
                        classId
                );

        return enrollmentRepository
                .findByStudentAndAcademicYear(
                        student,
                        academicClass.getAcademicYear()
                )
                .filter(
                        enrollment ->
                                enrollment
                                        .getAcademicClass()
                                        .getId()
                                        .equals(
                                                classId
                                        )
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Student is not enrolled in this class."
                        )
                );
    }
}