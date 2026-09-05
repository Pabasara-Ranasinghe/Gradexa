package com.gradexa.backend.service;

import com.gradexa.backend.entity.AcademicClass;
import com.gradexa.backend.entity.Role;
import com.gradexa.backend.entity.Subject;
import com.gradexa.backend.entity.Teacher;
import com.gradexa.backend.entity.TeacherClassAssignment;
import com.gradexa.backend.entity.User;
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

    private final SubjectRepository subjectRepository;
    private final AcademicClassService academicClassService;
    private final TeacherClassAssignmentRepository assignmentRepository;
    private final TeacherRepository teacherRepository;

    public SubjectService(
            SubjectRepository subjectRepository,
            AcademicClassService academicClassService,
            TeacherClassAssignmentRepository assignmentRepository,
            TeacherRepository teacherRepository
    ) {
        this.subjectRepository = subjectRepository;
        this.academicClassService = academicClassService;
        this.assignmentRepository = assignmentRepository;
        this.teacherRepository = teacherRepository;
    }

    // ==========================================================
    // CREATE SUBJECT
    // ==========================================================

    public Subject createSubject(
            Long classId,
            String subjectName
    ) {

        AcademicClass academicClass =
                academicClassService.getClassById(classId);

        checkTeacherClassAccess(academicClass);

        if (!academicClass.isActive()) {

            throw new RuntimeException(
                    "Cannot add a subject to an inactive class"
            );
        }

        if (subjectName == null ||
                subjectName.trim().isEmpty()) {

            throw new RuntimeException(
                    "Subject name is required"
            );
        }

        String normalizedSubjectName =
                subjectName.trim();

        long subjectCount =
                subjectRepository
                        .countByAcademicClassIdAndActiveTrue(
                                classId
                        );

        if (subjectCount >= MAX_SUBJECTS_PER_CLASS) {

            throw new RuntimeException(
                    "A class can have a maximum of 15 subjects"
            );
        }

        if (subjectRepository
                .existsByAcademicClassIdAndSubjectName(
                        classId,
                        normalizedSubjectName
                )) {

            throw new RuntimeException(
                    "This subject already exists for the selected class"
            );
        }

        Subject subject = new Subject();

        subject.setAcademicClass(academicClass);
        subject.setSubjectName(normalizedSubjectName);
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
                academicClassService.getClassById(classId);

        checkTeacherClassAccess(academicClass);

        return subjectRepository
                .findByAcademicClassIdAndActiveTrue(
                        classId
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
                getSubjectById(id);

        if (!subject.isActive()) {

            throw new RuntimeException(
                    "Cannot update an inactive subject"
            );
        }

        if (subjectName == null ||
                subjectName.trim().isEmpty()) {

            throw new RuntimeException(
                    "Subject name is required"
            );
        }

        String normalizedSubjectName =
                subjectName.trim();

        Long classId =
                subject.getAcademicClass().getId();

        boolean duplicate =
                subjectRepository
                        .existsByAcademicClassIdAndSubjectName(
                                classId,
                                normalizedSubjectName
                        );

        if (duplicate &&
                !subject.getSubjectName()
                        .equalsIgnoreCase(
                                normalizedSubjectName
                        )) {

            throw new RuntimeException(
                    "This subject already exists for the selected class"
            );
        }

        subject.setSubjectName(
                normalizedSubjectName
        );

        return subjectRepository.save(subject);
    }

    // ==========================================================
    // DEACTIVATE SUBJECT
    // ==========================================================

    public Subject deactivateSubject(
            Long id
    ) {

        Subject subject =
                getSubjectById(id);

        subject.setActive(false);

        return subjectRepository.save(subject);
    }

    // ==========================================================
    // TEACHER CLASS ACCESS CHECK
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
                    "You are not authenticated."
            );
        }

        String username =
                authentication.getName();

        User user =
                (User) authentication
                        .getPrincipal();

        // ------------------------------------------------------
        // ADMIN AND PRINCIPAL
        // ------------------------------------------------------

        if (user.getRole() == Role.ADMIN ||
                user.getRole() == Role.PRINCIPAL) {

            return;
        }

        // ------------------------------------------------------
        // TEACHER
        // ------------------------------------------------------

        if (user.getRole() == Role.TEACHER) {

            Teacher teacher =
                    teacherRepository
                            .findByUserUsername(username)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Teacher profile not found."
                                    )
                            );

            if (!teacher.isActive()) {

                throw new RuntimeException(
                        "Your teacher account is inactive."
                );
            }

            List<TeacherClassAssignment> assignments =
                    assignmentRepository
                            .findByTeacherIdAndActiveTrue(
                                    teacher.getId()
                            );

            boolean assignedToClass =
                    assignments.stream()
                            .anyMatch(
                                    assignment ->
                                            assignment
                                                    .getAcademicClass()
                                                    .getId()
                                                    .equals(
                                                            academicClass
                                                                    .getId()
                                                    )
                            );

            if (!assignedToClass) {

                throw new RuntimeException(
                        "You are not assigned to this class."
                );
            }

            return;
        }

        // ------------------------------------------------------
        // OTHER ROLES
        // ------------------------------------------------------

        throw new RuntimeException(
                "You do not have permission to manage subjects."
        );
    }
}