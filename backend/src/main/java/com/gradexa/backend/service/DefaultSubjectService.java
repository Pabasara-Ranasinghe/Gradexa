package com.gradexa.backend.service;

import com.gradexa.backend.entity.AcademicClass;
import com.gradexa.backend.entity.Subject;
import com.gradexa.backend.entity.SubjectCategory;
import com.gradexa.backend.repository.SubjectRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DefaultSubjectService {

    private final SubjectRepository subjectRepository;

    public DefaultSubjectService(
            SubjectRepository subjectRepository
    ) {
        this.subjectRepository = subjectRepository;
    }

    // ==========================================================
    // CREATE DEFAULT SUBJECTS
    // ==========================================================

    /**
     * Creates the standard subjects for an academic class.
     *
     * This method does not skip a class just because it already
     * has subjects.
     *
     * Existing subjects are preserved.
     * Missing default subjects are added.
     */
    @Transactional
    public void createDefaultSubjects(
            AcademicClass academicClass
    ) {

        if (academicClass == null) {
            throw new IllegalArgumentException(
                    "Academic class is required."
            );
        }

        Integer grade =
                academicClass.getGrade();

        if (grade == null) {
            throw new IllegalArgumentException(
                    "Academic class grade is required."
            );
        }

        // ======================================================
        // PRIMARY
        // Grades 1 - 5
        // ======================================================

        if (grade <= 5) {

            createSubjectIfMissing(
                    academicClass,
                    "Sinhala",
                    SubjectCategory.PRIMARY,
                    null,
                    1
            );

            createSubjectIfMissing(
                    academicClass,
                    "Buddhism",
                    SubjectCategory.PRIMARY,
                    null,
                    2
            );

            createSubjectIfMissing(
                    academicClass,
                    "English",
                    SubjectCategory.PRIMARY,
                    null,
                    3
            );

            createSubjectIfMissing(
                    academicClass,
                    "ERA",
                    SubjectCategory.PRIMARY,
                    null,
                    4
            );

            createSubjectIfMissing(
                    academicClass,
                    "Mathematics",
                    SubjectCategory.PRIMARY,
                    null,
                    5
            );

            createSubjectIfMissing(
                    academicClass,
                    "ICT",
                    SubjectCategory.PRIMARY,
                    null,
                    6
            );

            createSubjectIfMissing(
                    academicClass,
                    "Art",
                    SubjectCategory.PRIMARY,
                    null,
                    7
            );

            createSubjectIfMissing(
                    academicClass,
                    "Dancing",
                    SubjectCategory.PRIMARY,
                    null,
                    8
            );

            createSubjectIfMissing(
                    academicClass,
                    "Music",
                    SubjectCategory.PRIMARY,
                    null,
                    9
            );

            return;
        }

        // ======================================================
        // GRADES 6 - 9
        // ======================================================

        if (grade >= 6 && grade <= 9) {

            // --------------------------------------------------
            // CORE SUBJECTS
            // --------------------------------------------------

            createSubjectIfMissing(
                    academicClass,
                    "Sinhala",
                    SubjectCategory.CORE,
                    null,
                    1
            );

            createSubjectIfMissing(
                    academicClass,
                    "Buddhism",
                    SubjectCategory.CORE,
                    null,
                    2
            );

            createSubjectIfMissing(
                    academicClass,
                    "English",
                    SubjectCategory.CORE,
                    null,
                    3
            );

            createSubjectIfMissing(
                    academicClass,
                    "Science",
                    SubjectCategory.CORE,
                    null,
                    4
            );

            createSubjectIfMissing(
                    academicClass,
                    "Mathematics",
                    SubjectCategory.CORE,
                    null,
                    5
            );

            createSubjectIfMissing(
                    academicClass,
                    "History",
                    SubjectCategory.CORE,
                    null,
                    6
            );

            createSubjectIfMissing(
                    academicClass,
                    "Civic Education",
                    SubjectCategory.CORE,
                    null,
                    7
            );

            createSubjectIfMissing(
                    academicClass,
                    "Geography",
                    SubjectCategory.CORE,
                    null,
                    8
            );

            createSubjectIfMissing(
                    academicClass,
                    "ICT",
                    SubjectCategory.CORE,
                    null,
                    9
            );

            createSubjectIfMissing(
                    academicClass,
                    "PTS",
                    SubjectCategory.CORE,
                    null,
                    10
            );

            createSubjectIfMissing(
                    academicClass,
                    "Tamil",
                    SubjectCategory.CORE,
                    null,
                    11
            );

            createSubjectIfMissing(
                    academicClass,
                    "English Literature",
                    SubjectCategory.CORE,
                    null,
                    12
            );

            // --------------------------------------------------
            // BASKET 01
            // --------------------------------------------------

            createSubjectIfMissing(
                    academicClass,
                    "Art",
                    SubjectCategory.BASKET_01,
                    1,
                    13
            );

            createSubjectIfMissing(
                    academicClass,
                    "Dancing",
                    SubjectCategory.BASKET_01,
                    1,
                    14
            );

            createSubjectIfMissing(
                    academicClass,
                    "Drama",
                    SubjectCategory.BASKET_01,
                    1,
                    15
            );

            createSubjectIfMissing(
                    academicClass,
                    "Music Oriental",
                    SubjectCategory.BASKET_01,
                    1,
                    16
            );

            createSubjectIfMissing(
                    academicClass,
                    "Music Western",
                    SubjectCategory.BASKET_01,
                    1,
                    17
            );

            return;
        }

        // ======================================================
        // GRADES 10 - 11
        // ======================================================

        if (grade == 10 || grade == 11) {

            // --------------------------------------------------
            // CORE SUBJECTS
            // --------------------------------------------------

            createSubjectIfMissing(
                    academicClass,
                    "Sinhala",
                    SubjectCategory.CORE,
                    null,
                    1
            );

            createSubjectIfMissing(
                    academicClass,
                    "Buddhism",
                    SubjectCategory.CORE,
                    null,
                    2
            );

            createSubjectIfMissing(
                    academicClass,
                    "English",
                    SubjectCategory.CORE,
                    null,
                    3
            );

            createSubjectIfMissing(
                    academicClass,
                    "Science",
                    SubjectCategory.CORE,
                    null,
                    4
            );

            createSubjectIfMissing(
                    academicClass,
                    "Mathematics",
                    SubjectCategory.CORE,
                    null,
                    5
            );

            createSubjectIfMissing(
                    academicClass,
                    "History",
                    SubjectCategory.CORE,
                    null,
                    6
            );

            // --------------------------------------------------
            // BASKET 01
            // --------------------------------------------------

            createSubjectIfMissing(
                    academicClass,
                    "Art",
                    SubjectCategory.BASKET_01,
                    1,
                    7
            );

            createSubjectIfMissing(
                    academicClass,
                    "Dancing",
                    SubjectCategory.BASKET_01,
                    1,
                    8
            );

            createSubjectIfMissing(
                    academicClass,
                    "Drama",
                    SubjectCategory.BASKET_01,
                    1,
                    9
            );

            createSubjectIfMissing(
                    academicClass,
                    "English Literature",
                    SubjectCategory.BASKET_01,
                    1,
                    10
            );

            createSubjectIfMissing(
                    academicClass,
                    "Music Oriental",
                    SubjectCategory.BASKET_01,
                    1,
                    11
            );

            createSubjectIfMissing(
                    academicClass,
                    "Music Western",
                    SubjectCategory.BASKET_01,
                    1,
                    12
            );

            // --------------------------------------------------
            // BASKET 02
            // --------------------------------------------------

            createSubjectIfMissing(
                    academicClass,
                    "Commerce",
                    SubjectCategory.BASKET_02,
                    2,
                    13
            );

            createSubjectIfMissing(
                    academicClass,
                    "Civic Education",
                    SubjectCategory.BASKET_02,
                    2,
                    14
            );

            createSubjectIfMissing(
                    academicClass,
                    "Geography",
                    SubjectCategory.BASKET_02,
                    2,
                    15
            );

            createSubjectIfMissing(
                    academicClass,
                    "French",
                    SubjectCategory.BASKET_02,
                    2,
                    16
            );

            createSubjectIfMissing(
                    academicClass,
                    "Japanese",
                    SubjectCategory.BASKET_02,
                    2,
                    17
            );

            // --------------------------------------------------
            // BASKET 03
            // --------------------------------------------------

            createSubjectIfMissing(
                    academicClass,
                    "Health Education",
                    SubjectCategory.BASKET_03,
                    3,
                    18
            );

            createSubjectIfMissing(
                    academicClass,
                    "Home Science",
                    SubjectCategory.BASKET_03,
                    3,
                    19
            );

            createSubjectIfMissing(
                    academicClass,
                    "Agriculture",
                    SubjectCategory.BASKET_03,
                    3,
                    20
            );

            createSubjectIfMissing(
                    academicClass,
                    "ICT",
                    SubjectCategory.BASKET_03,
                    3,
                    21
            );

            createSubjectIfMissing(
                    academicClass,
                    "Media Studies",
                    SubjectCategory.BASKET_03,
                    3,
                    22
            );

            return;
        }

        // ======================================================
        // GRADES 12 - 13
        // ======================================================

        /*
         * No default subjects are currently created for
         * Grades 12 and 13.
         *
         * Subjects can be added manually as custom subjects.
         */
    }

    // ==========================================================
    // CREATE SUBJECT IF MISSING
    // ==========================================================

    private void createSubjectIfMissing(
            AcademicClass academicClass,
            String subjectName,
            SubjectCategory category,
            Integer basketNumber,
            Integer displayOrder
    ) {

        Subject existingSubject =
                subjectRepository
                        .findByAcademicClassIdAndSubjectName(
                                academicClass.getId(),
                                subjectName
                        )
                        .orElse(null);

        // ------------------------------------------------------
        // Subject already exists
        // ------------------------------------------------------

        if (existingSubject != null) {

            existingSubject.setCategory(category);
            existingSubject.setBasketNumber(basketNumber);
            existingSubject.setDisplayOrder(displayOrder);
            existingSubject.setActive(true);

            subjectRepository.save(existingSubject);

            return;
        }

        // ------------------------------------------------------
        // Subject does not exist
        // ------------------------------------------------------

        Subject subject =
                new Subject();

        subject.setAcademicClass(academicClass);
        subject.setSubjectName(subjectName);
        subject.setCategory(category);
        subject.setBasketNumber(basketNumber);
        subject.setDisplayOrder(displayOrder);
        subject.setCustom(false);
        subject.setActive(true);

        subjectRepository.save(subject);
    }
}