package com.gradexa.backend.repository;

import com.gradexa.backend.entity.Subject;
import com.gradexa.backend.entity.SubjectCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubjectRepository
        extends JpaRepository<Subject, Long> {

    // ==========================================================
    // SUBJECTS BY CLASS
    // ==========================================================

    List<Subject> findByAcademicClassIdAndActiveTrueOrderByDisplayOrderAsc(
            Long academicClassId
    );

    // ==========================================================
    // SUBJECTS BY CATEGORY
    // ==========================================================

    List<Subject> findByAcademicClassIdAndCategoryAndActiveTrueOrderByDisplayOrderAsc(
            Long academicClassId,
            SubjectCategory category
    );

    // ==========================================================
    // SUBJECTS BY BASKET
    // ==========================================================

    List<Subject> findByAcademicClassIdAndBasketNumberAndActiveTrueOrderByDisplayOrderAsc(
            Long academicClassId,
            Integer basketNumber
    );

    // ==========================================================
    // FIND SUBJECT BY CLASS + NAME
    // ==========================================================

    Optional<Subject> findByAcademicClassIdAndSubjectName(
            Long academicClassId,
            String subjectName
    );

    // ==========================================================
    // CHECK DUPLICATE SUBJECT
    // ==========================================================

    boolean existsByAcademicClassIdAndSubjectName(
            Long academicClassId,
            String subjectName
    );

    // ==========================================================
    // COUNT SUBJECTS IN A CLASS
    // ==========================================================

    long countByAcademicClassIdAndActiveTrue(
            Long academicClassId
    );

    // ==========================================================
    // COUNT SUBJECTS IN A BASKET
    // ==========================================================

    long countByAcademicClassIdAndBasketNumberAndActiveTrue(
            Long academicClassId,
            Integer basketNumber
    );
}