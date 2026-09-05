package com.gradexa.backend.service;

import com.gradexa.backend.entity.AcademicClass;
import com.gradexa.backend.entity.SchoolSection;
import com.gradexa.backend.repository.AcademicClassRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AcademicClassService {

    private final AcademicClassRepository academicClassRepository;
    private final DefaultSubjectService defaultSubjectService;

    public AcademicClassService(
            AcademicClassRepository academicClassRepository,
            DefaultSubjectService defaultSubjectService
    ) {
        this.academicClassRepository =
                academicClassRepository;

        this.defaultSubjectService =
                defaultSubjectService;
    }

    // ==========================================================
    // CREATE CLASS
    // ==========================================================

    public AcademicClass createClass(
            Integer academicYear,
            Integer grade,
            String sectionName
    ) {

        // ======================================================
        // VALIDATION
        // ======================================================

        if (academicYear == null) {

            throw new RuntimeException(
                    "Academic year is required"
            );
        }

        if (grade == null) {

            throw new RuntimeException(
                    "Grade is required"
            );
        }

        if (grade < 1 || grade > 13) {

            throw new RuntimeException(
                    "Grade must be between 1 and 13"
            );
        }

        if (sectionName == null ||
                sectionName.trim().isEmpty()) {

            throw new RuntimeException(
                    "Section name is required"
            );
        }

        String cleanedSectionName =
                sectionName.trim();

        // ======================================================
        // DETERMINE SCHOOL SECTION
        // ======================================================

        SchoolSection schoolSection;

        if (grade <= 5) {

            schoolSection =
                    SchoolSection.PRIMARY;

        } else {

            schoolSection =
                    SchoolSection.UPPER;
        }

        // ======================================================
        // CHECK DUPLICATE CLASS
        // ======================================================

        boolean exists =
                academicClassRepository
                        .existsByAcademicYearAndGradeAndSectionName(
                                academicYear,
                                grade,
                                cleanedSectionName
                        );

        if (exists) {

            throw new RuntimeException(
                    "This academic class already exists"
            );
        }

        // ======================================================
        // CREATE CLASS
        // ======================================================

        AcademicClass academicClass =
                new AcademicClass();

        academicClass.setAcademicYear(
                academicYear
        );

        academicClass.setSchoolSection(
                schoolSection
        );

        academicClass.setGrade(
                grade
        );

        academicClass.setSectionName(
                cleanedSectionName
        );

        academicClass.setActive(true);

        // ======================================================
        // SAVE CLASS FIRST
        // ======================================================

        AcademicClass savedClass =
                academicClassRepository.save(
                        academicClass
                );

        // ======================================================
        // CREATE DEFAULT SUBJECTS
        // ======================================================

        defaultSubjectService.createDefaultSubjects(
                savedClass
        );

        return savedClass;
    }

    // ==========================================================
    // GET CLASSES BY YEAR
    // ==========================================================

    public List<AcademicClass> getClassesByYear(
            Integer academicYear
    ) {

        return academicClassRepository
                .findByAcademicYearAndActiveTrue(
                        academicYear
                );
    }

    // ==========================================================
    // GET CLASSES BY GRADE
    // ==========================================================

    public List<AcademicClass> getClassesByGrade(
            Integer academicYear,
            Integer grade
    ) {

        return academicClassRepository
                .findByAcademicYearAndGrade(
                        academicYear,
                        grade
                )
                .stream()
                .filter(AcademicClass::isActive)
                .toList();
    }

    // ==========================================================
    // GET CLASSES BY SCHOOL SECTION
    // ==========================================================

    public List<AcademicClass> getClassesBySchoolSection(
            Integer academicYear,
            SchoolSection schoolSection
    ) {

        return academicClassRepository
                .findByAcademicYearAndSchoolSection(
                        academicYear,
                        schoolSection
                )
                .stream()
                .filter(AcademicClass::isActive)
                .toList();
    }

    // ==========================================================
    // GET ALL ACTIVE CLASSES
    // ==========================================================

    public List<AcademicClass> getAllActiveClasses() {

        return academicClassRepository
                .findByActiveTrue();
    }

    // ==========================================================
    // GET CLASS BY ID
    // ==========================================================

    public AcademicClass getClassById(
            Long id
    ) {

        return academicClassRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Academic class not found"
                        )
                );
    }

    // ==========================================================
    // UPDATE CLASS SECTION NAME
    // ==========================================================

    public AcademicClass updateClassSection(
            Long id,
            String sectionName
    ) {

        AcademicClass academicClass =
                academicClassRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Academic class not found"
                                )
                        );

        if (sectionName == null ||
                sectionName.trim().isEmpty()) {

            throw new RuntimeException(
                    "Section name is required"
            );
        }

        academicClass.setSectionName(
                sectionName.trim()
        );

        return academicClassRepository.save(
                academicClass
        );
    }

    // ==========================================================
    // DEACTIVATE CLASS
    // ==========================================================

    public AcademicClass deactivateClass(
            Long id
    ) {

        AcademicClass academicClass =
                academicClassRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Academic class not found"
                                )
                        );

        academicClass.setActive(false);

        return academicClassRepository.save(
                academicClass
        );
    }
}