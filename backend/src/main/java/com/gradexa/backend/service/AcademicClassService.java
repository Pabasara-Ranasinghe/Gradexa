package com.gradexa.backend.service;

import com.gradexa.backend.entity.AcademicClass;
import com.gradexa.backend.entity.SchoolSection;
import com.gradexa.backend.repository.AcademicClassRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AcademicClassService {

    private final AcademicClassRepository academicClassRepository;
    private final DefaultSubjectService defaultSubjectService;

    public AcademicClassService(
            AcademicClassRepository academicClassRepository,
            DefaultSubjectService defaultSubjectService
    ) {
        this.academicClassRepository = academicClassRepository;
        this.defaultSubjectService = defaultSubjectService;
    }

    // ==========================================================
    // CREATE CLASS
    // ==========================================================

    @Transactional
    public AcademicClass createClass(
            Integer academicYear,
            Integer grade,
            String sectionName
    ) {

        if (academicYear == null) {
            throw new IllegalArgumentException(
                    "Academic year is required."
            );
        }

        if (academicYear < 2000 || academicYear > 2100) {
            throw new IllegalArgumentException(
                    "Invalid academic year."
            );
        }

        if (grade == null) {
            throw new IllegalArgumentException(
                    "Grade is required."
            );
        }

        if (grade < 1 || grade > 13) {
            throw new IllegalArgumentException(
                    "Grade must be between 1 and 13."
            );
        }

        if (sectionName == null ||
                sectionName.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Section name is required."
            );
        }

        String cleanSectionName =
                sectionName.trim();

        boolean exists =
                academicClassRepository
                        .existsByAcademicYearAndGradeAndSectionName(
                                academicYear,
                                grade,
                                cleanSectionName
                        );

        if (exists) {
            throw new IllegalArgumentException(
                    "A class with this academic year, grade and section already exists."
            );
        }

        SchoolSection schoolSection;

        if (grade <= 5) {
            schoolSection = SchoolSection.PRIMARY;
        } else {
            schoolSection = SchoolSection.UPPER;
        }

        AcademicClass academicClass =
                new AcademicClass();

        academicClass.setAcademicYear(
                academicYear
        );

        academicClass.setGrade(
                grade
        );

        academicClass.setSectionName(
                cleanSectionName
        );

        academicClass.setSchoolSection(
                schoolSection
        );

        academicClass.setActive(true);

        AcademicClass savedClass =
                academicClassRepository.save(
                        academicClass
                );

        // Create the default subjects for the new class.
        defaultSubjectService.createDefaultSubjects(
                savedClass
        );

        return savedClass;
    }

    // ==========================================================
    // GET ALL ACTIVE CLASSES FOR YEAR
    // ==========================================================

    public List<AcademicClass> getClassesByYear(
            Integer academicYear
    ) {

        if (academicYear == null) {
            throw new IllegalArgumentException(
                    "Academic year is required."
            );
        }

        return academicClassRepository
                .findByAcademicYearAndActiveTrue(
                        academicYear
                );
    }

    // ==========================================================
    // GET ACTIVE CLASSES BY GRADE
    // ==========================================================

    public List<AcademicClass> getClassesByGrade(
            Integer academicYear,
            Integer grade
    ) {

        if (academicYear == null) {
            throw new IllegalArgumentException(
                    "Academic year is required."
            );
        }

        if (grade == null ||
                grade < 1 ||
                grade > 13) {

            throw new IllegalArgumentException(
                    "Grade must be between 1 and 13."
            );
        }

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
    // GET ACTIVE CLASSES BY SCHOOL SECTION
    // ==========================================================

    public List<AcademicClass> getClassesBySchoolSection(
            Integer academicYear,
            SchoolSection schoolSection
    ) {

        if (academicYear == null) {
            throw new IllegalArgumentException(
                    "Academic year is required."
            );
        }

        if (schoolSection == null) {
            throw new IllegalArgumentException(
                    "School section is required."
            );
        }

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
    // GET CLASS BY ID
    // ==========================================================

    public AcademicClass getClassById(
            Long id
    ) {

        if (id == null) {
            throw new IllegalArgumentException(
                    "Class ID is required."
            );
        }

        return academicClassRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Academic class not found."
                        )
                );
    }

    // ==========================================================
    // UPDATE CLASS SECTION
    // ==========================================================

    @Transactional
    public AcademicClass updateClassSection(
            Long id,
            String sectionName
    ) {

        if (id == null) {
            throw new IllegalArgumentException(
                    "Class ID is required."
            );
        }

        if (sectionName == null ||
                sectionName.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Section name is required."
            );
        }

        AcademicClass academicClass =
                academicClassRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Academic class not found."
                                )
                        );

        String cleanSectionName =
                sectionName.trim();

        boolean duplicate =
                academicClassRepository
                        .existsByAcademicYearAndGradeAndSectionName(
                                academicClass.getAcademicYear(),
                                academicClass.getGrade(),
                                cleanSectionName
                        );

        if (duplicate &&
                !cleanSectionName.equalsIgnoreCase(
                        academicClass.getSectionName()
                )) {

            throw new IllegalArgumentException(
                    "A class with this section already exists."
            );
        }

        academicClass.setSectionName(
                cleanSectionName
        );

        return academicClassRepository.save(
                academicClass
        );
    }

    // ==========================================================
    // DEACTIVATE CLASS
    // ==========================================================

    @Transactional
    public AcademicClass deactivateClass(
            Long id
    ) {

        if (id == null) {
            throw new IllegalArgumentException(
                    "Class ID is required."
            );
        }

        AcademicClass academicClass =
                academicClassRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Academic class not found."
                                )
                        );

        academicClass.setActive(false);

        return academicClassRepository.save(
                academicClass
        );
    }
}