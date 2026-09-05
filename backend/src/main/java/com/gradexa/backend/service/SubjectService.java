package com.gradexa.backend.service;

import com.gradexa.backend.entity.AcademicClass;
import com.gradexa.backend.entity.Subject;
import com.gradexa.backend.entity.SubjectCategory;
import com.gradexa.backend.entity.Teacher;
import com.gradexa.backend.repository.AcademicClassRepository;
import com.gradexa.backend.repository.SubjectRepository;
import com.gradexa.backend.repository.TeacherClassAssignmentRepository;
import com.gradexa.backend.repository.TeacherRepository;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SubjectService {

    private static final int MAX_SUBJECTS_PER_CLASS = 15;
    private static final int MAX_SUBJECTS_PER_BASKET = 15;

    private final SubjectRepository subjectRepository;
    private final AcademicClassRepository academicClassRepository;
    private final TeacherRepository teacherRepository;
    private final TeacherClassAssignmentRepository assignmentRepository;

    public SubjectService(
            SubjectRepository subjectRepository,
            AcademicClassRepository academicClassRepository,
            TeacherRepository teacherRepository,
            TeacherClassAssignmentRepository assignmentRepository
    ) {
        this.subjectRepository = subjectRepository;
        this.academicClassRepository = academicClassRepository;
        this.teacherRepository = teacherRepository;
        this.assignmentRepository = assignmentRepository;
    }

    // ==========================================================
    // CREATE CUSTOM SUBJECT
    // ==========================================================

    public Subject createSubject(
            Long classId,
            String subjectName
    ) {

        AcademicClass academicClass =
                academicClassRepository.findById(classId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Academic class not found"
                                )
                        );

        checkTeacherClassAccess(academicClass);

        if (!academicClass.isActive()) {
            throw new RuntimeException(
                    "The selected class is not active"
            );
        }

        if (subjectName == null ||
                subjectName.trim().isEmpty()) {

            throw new RuntimeException(
                    "Subject name cannot be empty"
            );
        }

        String cleanedName =
                subjectName.trim();

        // ======================================================
        // CHECK TOTAL SUBJECT LIMIT
        // ======================================================

        long totalSubjects =
                subjectRepository
                        .countByAcademicClassIdAndActiveTrue(
                                classId
                        );

        if (totalSubjects >= MAX_SUBJECTS_PER_CLASS) {

            throw new RuntimeException(
                    "A class can have a maximum of "
                            + MAX_SUBJECTS_PER_CLASS
                            + " active subjects"
            );
        }

        // ======================================================
        // CHECK DUPLICATE
        // ======================================================

        if (subjectRepository
                .existsByAcademicClassIdAndSubjectName(
                        classId,
                        cleanedName
                )) {

            throw new RuntimeException(
                    "This subject already exists for the selected class"
            );
        }

        // ======================================================
        // CUSTOM SUBJECT
        // ======================================================

        /*
         * Teacher-created subjects are placed in Basket 01
         * by default.
         *
         * The teacher can later manage the subject structure
         * from the subject management page.
         */
        Subject subject = new Subject();

        subject.setAcademicClass(academicClass);
        subject.setSubjectName(cleanedName);
        subject.setCategory(
                SubjectCategory.BASKET_01
        );
        subject.setBasketNumber(1);

        // Put custom subject after existing subjects.
        subject.setDisplayOrder(
                (int) totalSubjects + 1
        );

        subject.setCustom(true);
        subject.setActive(true);

        return subjectRepository.save(subject);
    }

    // ==========================================================
    // GET SUBJECTS BY CLASS
    // ==========================================================

    public List<Subject> getSubjectsByClass(
            Long classId
    ) {

        AcademicClass academicClass =
                academicClassRepository.findById(classId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Academic class not found"
                                )
                        );

        checkTeacherClassAccess(academicClass);

        return subjectRepository
                .findByAcademicClassIdAndActiveTrueOrderByDisplayOrderAsc(
                        classId
                );
    }

    // ==========================================================
    // GET SUBJECTS BY CATEGORY
    // ==========================================================

    public List<Subject> getSubjectsByCategory(
            Long classId,
            SubjectCategory category
    ) {

        AcademicClass academicClass =
                academicClassRepository.findById(classId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Academic class not found"
                                )
                        );

        checkTeacherClassAccess(academicClass);

        return subjectRepository
                .findByAcademicClassIdAndCategoryAndActiveTrueOrderByDisplayOrderAsc(
                        classId,
                        category
                );
    }

    // ==========================================================
    // GET SUBJECT BY ID
    // ==========================================================

    public Subject getSubjectById(
            Long id
    ) {

        Subject subject =
                subjectRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Subject not found"
                                )
                        );

        checkTeacherClassAccess(
                subject.getAcademicClass()
        );

        return subject;
    }

    // ==========================================================
    // UPDATE SUBJECT
    // ==========================================================

    public Subject updateSubject(
            Long id,
            String subjectName
    ) {

        Subject subject =
                subjectRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Subject not found"
                                )
                        );

        checkTeacherClassAccess(
                subject.getAcademicClass()
        );

        if (subjectName == null ||
                subjectName.trim().isEmpty()) {

            throw new RuntimeException(
                    "Subject name cannot be empty"
            );
        }

        String cleanedName =
                subjectName.trim();

        if (!cleanedName.equalsIgnoreCase(
                subject.getSubjectName()
        )) {

            if (subjectRepository
                    .existsByAcademicClassIdAndSubjectName(
                            subject.getAcademicClass().getId(),
                            cleanedName
                    )) {

                throw new RuntimeException(
                        "This subject already exists for the selected class"
                );
            }
        }

        subject.setSubjectName(cleanedName);

        return subjectRepository.save(subject);
    }

    // ==========================================================
    // DEACTIVATE SUBJECT
    // ==========================================================

    public Subject deactivateSubject(
            Long id
    ) {

        Subject subject =
                subjectRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Subject not found"
                                )
                        );

        checkTeacherClassAccess(
                subject.getAcademicClass()
        );

        subject.setActive(false);

        return subjectRepository.save(subject);
    }

    // ==========================================================
    // CHECK TEACHER CLASS ACCESS
    // ==========================================================

    private void checkTeacherClassAccess(
            AcademicClass academicClass
    ) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "You are not authenticated"
            );
        }

        boolean isAdmin =
                authentication.getAuthorities()
                        .stream()
                        .anyMatch(authority ->
                                authority.getAuthority()
                                        .equals("ROLE_ADMIN")
                        );

        boolean isPrincipal =
                authentication.getAuthorities()
                        .stream()
                        .anyMatch(authority ->
                                authority.getAuthority()
                                        .equals("ROLE_PRINCIPAL")
                        );

        boolean isTeacher =
                authentication.getAuthorities()
                        .stream()
                        .anyMatch(authority ->
                                authority.getAuthority()
                                        .equals("ROLE_TEACHER")
                        );

        // ======================================================
        // ADMIN / PRINCIPAL
        // ======================================================

        if (isAdmin || isPrincipal) {
            return;
        }

        // ======================================================
        // TEACHER
        // ======================================================

        if (isTeacher) {

            String username =
                    authentication.getName();

            Teacher teacher =
                    teacherRepository
                            .findByUserUsername(username)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Teacher profile not found"
                                    )
                            );

            if (!teacher.isActive()) {

                throw new RuntimeException(
                        "Your teacher account is inactive"
                );
            }

            boolean assigned =
                    assignmentRepository
                            .findByTeacherAndActiveTrue(teacher)
                            .stream()
                            .anyMatch(assignment ->
                                    assignment
                                            .getAcademicClass()
                                            .getId()
                                            .equals(
                                                    academicClass.getId()
                                            )
                            );

            if (!assigned) {

                throw new RuntimeException(
                        "You are not assigned to this class"
                );
            }

            return;
        }

        // ======================================================
        // OTHER ROLES
        // ======================================================

        throw new RuntimeException(
                "You do not have permission to manage subjects"
        );
    }
}