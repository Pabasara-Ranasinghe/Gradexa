package com.gradexa.backend.service;

import com.gradexa.backend.entity.AcademicClass;
import com.gradexa.backend.entity.SchoolSection;
import com.gradexa.backend.repository.AcademicClassRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AcademicClassService {

    private final AcademicClassRepository academicClassRepository;

    public AcademicClassService(
            AcademicClassRepository academicClassRepository
    ) {
        this.academicClassRepository = academicClassRepository;
    }

    // ===============================
    // CREATE CLASS
    // ===============================

    public AcademicClass createClass(
            Integer academicYear,
            Integer grade,
            String sectionName
    ) {

        validateGrade(grade);

        String normalizedSection =
                normalizeSectionName(sectionName);

        SchoolSection schoolSection =
                determineSchoolSection(grade);

        if (academicClassRepository
                .existsByAcademicYearAndGradeAndSectionName(
                        academicYear,
                        grade,
                        normalizedSection
                )) {

            throw new RuntimeException(
                    "This class already exists for the selected academic year"
            );
        }

        AcademicClass academicClass =
                new AcademicClass();

        academicClass.setAcademicYear(academicYear);
        academicClass.setGrade(grade);
        academicClass.setSectionName(normalizedSection);
        academicClass.setSchoolSection(schoolSection);
        academicClass.setActive(true);

        return academicClassRepository.save(
                academicClass
        );
    }

    // ===============================
    // GET ALL CLASSES FOR YEAR
    // ===============================

    public List<AcademicClass> getClassesByYear(
            Integer academicYear
    ) {

        return academicClassRepository
                .findByAcademicYearAndActiveTrue(
                        academicYear
                );
    }

    // ===============================
    // GET CLASSES BY GRADE
    // ===============================

    public List<AcademicClass> getClassesByGrade(
            Integer academicYear,
            Integer grade
    ) {

        validateGrade(grade);

        return academicClassRepository
                .findByAcademicYearAndGrade(
                        academicYear,
                        grade
                )
                .stream()
                .filter(AcademicClass::isActive)
                .toList();
    }

    // ===============================
    // GET CLASSES BY SCHOOL SECTION
    // ===============================

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

    // ===============================
    // GET CLASS BY ID
    // ===============================

    public AcademicClass getClassById(
            Long id
    ) {

        return academicClassRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Class not found"
                        )
                );
    }

    // ===============================
    // UPDATE CLASS SECTION NAME
    // ===============================

    public AcademicClass updateClassSection(
            Long id,
            String sectionName
    ) {

        AcademicClass academicClass =
                getClassById(id);

        if (!academicClass.isActive()) {

            throw new RuntimeException(
                    "Cannot update an inactive class"
            );
        }

        String normalizedSection =
                normalizeSectionName(sectionName);

        boolean duplicate =
                academicClassRepository
                        .existsByAcademicYearAndGradeAndSectionName(
                                academicClass.getAcademicYear(),
                                academicClass.getGrade(),
                                normalizedSection
                        );

        if (duplicate &&
                !academicClass
                        .getSectionName()
                        .equals(normalizedSection)) {

            throw new RuntimeException(
                    "This class already exists"
            );
        }

        academicClass.setSectionName(
                normalizedSection
        );

        return academicClassRepository.save(
                academicClass
        );
    }

    // ===============================
    // DEACTIVATE CLASS
    // ===============================

    public AcademicClass deactivateClass(
            Long id
    ) {

        AcademicClass academicClass =
                getClassById(id);

        academicClass.setActive(false);

        return academicClassRepository.save(
                academicClass
        );
    }

    // ===============================
    // VALIDATE GRADE
    // ===============================

    private void validateGrade(
            Integer grade
    ) {

        if (grade == null ||
                grade < 1 ||
                grade > 13) {

            throw new RuntimeException(
                    "Grade must be between 1 and 13"
            );
        }
    }

    // ===============================
    // DETERMINE SCHOOL SECTION
    // ===============================

    private SchoolSection determineSchoolSection(
            Integer grade
    ) {

        if (grade <= 5) {
            return SchoolSection.PRIMARY;
        }

        return SchoolSection.UPPER;
    }

    // ===============================
    // NORMALIZE SECTION NAME
    // ===============================

    private String normalizeSectionName(
            String sectionName
    ) {

        if (sectionName == null ||
                sectionName.trim().isEmpty()) {

            throw new RuntimeException(
                    "Class section is required"
            );
        }

        String normalized =
                sectionName
                        .trim()
                        .toUpperCase();

        if (!normalized.matches("[A-Z]+")) {

            throw new RuntimeException(
                    "Class section must contain letters only"
            );
        }

        return normalized;
    }
}