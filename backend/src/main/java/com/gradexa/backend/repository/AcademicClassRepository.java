package com.gradexa.backend.repository;

import com.gradexa.backend.entity.AcademicClass;
import com.gradexa.backend.entity.SchoolSection;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AcademicClassRepository
        extends JpaRepository<AcademicClass, Long> {

    // ===============================
    // FIND BY ACADEMIC YEAR
    // ===============================

    List<AcademicClass> findByAcademicYear(
            Integer academicYear
    );

    // ===============================
    // FIND BY YEAR AND SCHOOL SECTION
    // ===============================

    List<AcademicClass> findByAcademicYearAndSchoolSection(
            Integer academicYear,
            SchoolSection schoolSection
    );

    // ===============================
    // FIND BY YEAR AND GRADE
    // ===============================

    List<AcademicClass> findByAcademicYearAndGrade(
            Integer academicYear,
            Integer grade
    );

    // ===============================
    // FIND SPECIFIC CLASS
    // ===============================

    Optional<AcademicClass> findByAcademicYearAndGradeAndSectionName(
            Integer academicYear,
            Integer grade,
            String sectionName
    );

    // ===============================
    // CHECK DUPLICATE CLASS
    // ===============================

    boolean existsByAcademicYearAndGradeAndSectionName(
            Integer academicYear,
            Integer grade,
            String sectionName
    );

    // ===============================
    // FIND ACTIVE CLASSES
    // ===============================

    List<AcademicClass> findByAcademicYearAndActiveTrue(
            Integer academicYear
    );

    // ===============================
    // FIND ALL ACTIVE CLASSES
    // ===============================

    List<AcademicClass> findByActiveTrue();

    // ===============================
    // FIND ACTIVE CLASSES BY GRADE
    // ===============================

    List<AcademicClass> findByGradeAndActiveTrue(
            Integer grade
    );
}