package com.gradexa.backend.service;

import com.gradexa.backend.entity.AcademicClass;
import com.gradexa.backend.entity.SchoolSection;
import com.gradexa.backend.entity.Subject;
import com.gradexa.backend.entity.SubjectCategory;
import com.gradexa.backend.repository.SubjectRepository;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class DefaultSubjectService {

    private final SubjectRepository subjectRepository;

    public DefaultSubjectService(
            SubjectRepository subjectRepository
    ) {
        this.subjectRepository = subjectRepository;
    }

    // ==========================================================
    // CREATE DEFAULT SUBJECTS FOR A CLASS
    // ==========================================================

    public void createDefaultSubjects(
            AcademicClass academicClass
    ) {

        Long classId =
                academicClass.getId();

        // Prevent duplicate default subjects
        if (subjectRepository
                .countByAcademicClassIdAndActiveTrue(classId) > 0) {

            return;
        }

        int grade =
                academicClass.getGrade();

        SchoolSection section =
                academicClass.getSchoolSection();

        // ======================================================
        // PRIMARY
        // ======================================================

        if (section == SchoolSection.PRIMARY) {

            createPrimarySubjects(
                    academicClass
            );

            return;
        }

        // ======================================================
        // GRADES 6–9
        // ======================================================

        if (grade >= 6 && grade <= 9) {

            createGradeSixToNineSubjects(
                    academicClass
            );

            return;
        }

        // ======================================================
        // GRADES 10–11
        // ======================================================

        if (grade == 10 || grade == 11) {

            createGradeTenToElevenSubjects(
                    academicClass
            );
        }
    }

    // ==========================================================
    // PRIMARY SUBJECTS
    // ==========================================================

    private void createPrimarySubjects(
            AcademicClass academicClass
    ) {

        List<String> subjects =
                List.of(
                        "Sinhala",
                        "Buddhism",
                        "English",
                        "ERA",
                        "Mathematics",
                        "ICT",
                        "Art",
                        "Dancing",
                        "Music"
                );

        int order = 1;

        for (String subjectName : subjects) {

            saveDefaultSubject(
                    academicClass,
                    subjectName,
                    SubjectCategory.PRIMARY,
                    null,
                    order++
            );
        }
    }

    // ==========================================================
    // GRADES 6–9
    // ==========================================================

    private void createGradeSixToNineSubjects(
            AcademicClass academicClass
    ) {

        // ------------------------------------------------------
        // CORE SUBJECTS
        // ------------------------------------------------------

        List<String> coreSubjects =
                List.of(
                        "Sinhala",
                        "Buddhism",
                        "English",
                        "Science",
                        "Mathematics",
                        "History",
                        "Civic Education",
                        "Geography",
                        "ICT",
                        "PTS",
                        "Tamil",
                        "English Literature"
                );

        int order = 1;

        for (String subjectName : coreSubjects) {

            saveDefaultSubject(
                    academicClass,
                    subjectName,
                    SubjectCategory.CORE,
                    null,
                    order++
            );
        }

        // ------------------------------------------------------
        // BASKET SUBJECTS
        // ------------------------------------------------------

        List<String> basketSubjects =
                List.of(
                        "Art",
                        "Dancing",
                        "Drama",
                        "Music Oriental",
                        "Music Western"
                );

        order = 1;

        for (String subjectName : basketSubjects) {

            saveDefaultSubject(
                    academicClass,
                    subjectName,
                    SubjectCategory.BASKET_01,
                    1,
                    order++
            );
        }
    }

    // ==========================================================
    // GRADES 10–11
    // ==========================================================

    private void createGradeTenToElevenSubjects(
            AcademicClass academicClass
    ) {

        // ------------------------------------------------------
        // CORE SUBJECTS
        // ------------------------------------------------------

        List<String> coreSubjects =
                List.of(
                        "Sinhala",
                        "Buddhism",
                        "English",
                        "Science",
                        "Mathematics",
                        "History"
                );

        int order = 1;

        for (String subjectName : coreSubjects) {

            saveDefaultSubject(
                    academicClass,
                    subjectName,
                    SubjectCategory.CORE,
                    null,
                    order++
            );
        }

        // ------------------------------------------------------
        // BASKET 01
        // ------------------------------------------------------

        List<String> basket01Subjects =
                List.of(
                        "Art",
                        "Dancing",
                        "Drama",
                        "English Literature",
                        "Music Oriental",
                        "Music Western"
                );

        order = 1;

        for (String subjectName : basket01Subjects) {

            saveDefaultSubject(
                    academicClass,
                    subjectName,
                    SubjectCategory.BASKET_01,
                    1,
                    order++
            );
        }

        // ------------------------------------------------------
        // BASKET 02
        // ------------------------------------------------------

        List<String> basket02Subjects =
                List.of(
                        "Commerce",
                        "Civic Education",
                        "Geography",
                        "French",
                        "Japanese"
                );

        order = 1;

        for (String subjectName : basket02Subjects) {

            saveDefaultSubject(
                    academicClass,
                    subjectName,
                    SubjectCategory.BASKET_02,
                    2,
                    order++
            );
        }

        // ------------------------------------------------------
        // BASKET 03
        // ------------------------------------------------------

        List<String> basket03Subjects =
                List.of(
                        "Health Education",
                        "Home Science",
                        "Agriculture",
                        "ICT",
                        "Media Studies"
                );

        order = 1;

        for (String subjectName : basket03Subjects) {

            saveDefaultSubject(
                    academicClass,
                    subjectName,
                    SubjectCategory.BASKET_03,
                    3,
                    order++
            );
        }
    }

    // ==========================================================
    // SAVE DEFAULT SUBJECT
    // ==========================================================

    private void saveDefaultSubject(
            AcademicClass academicClass,
            String subjectName,
            SubjectCategory category,
            Integer basketNumber,
            int displayOrder
    ) {

        Subject subject =
                new Subject();

        subject.setAcademicClass(
                academicClass
        );

        subject.setSubjectName(
                subjectName
        );

        subject.setCategory(
                category
        );

        subject.setBasketNumber(
                basketNumber
        );

        subject.setDisplayOrder(
                displayOrder
        );

        subject.setCustom(false);

        subject.setActive(true);

        subjectRepository.save(subject);
    }
}