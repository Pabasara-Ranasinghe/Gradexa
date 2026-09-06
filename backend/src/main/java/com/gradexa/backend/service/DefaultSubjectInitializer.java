package com.gradexa.backend.service;

import com.gradexa.backend.entity.AcademicClass;
import com.gradexa.backend.repository.AcademicClassRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
public class DefaultSubjectInitializer
        implements CommandLineRunner {

    private final AcademicClassRepository academicClassRepository;
    private final DefaultSubjectService defaultSubjectService;

    public DefaultSubjectInitializer(
            AcademicClassRepository academicClassRepository,
            DefaultSubjectService defaultSubjectService
    ) {
        this.academicClassRepository =
                academicClassRepository;

        this.defaultSubjectService =
                defaultSubjectService;
    }

    // ==========================================================
    // RUN WHEN APPLICATION STARTS
    // ==========================================================

    @Override
    @Transactional
    public void run(String... args) {

        System.out.println(
                "=============================================="
        );

        System.out.println(
                "Initializing default subjects..."
        );

        List<AcademicClass> activeClasses =
                academicClassRepository
                        .findByActiveTrue();

        if (activeClasses.isEmpty()) {

            System.out.println(
                    "No active academic classes found."
            );

            System.out.println(
                    "Default subject initialization completed."
            );

            System.out.println(
                    "=============================================="
            );

            return;
        }

        // ------------------------------------------------------
        // Add missing default subjects to every active class
        // ------------------------------------------------------

        for (AcademicClass academicClass : activeClasses) {

            try {

                defaultSubjectService
                        .createDefaultSubjects(
                                academicClass
                        );

                System.out.println(
                        "Default subjects initialized for "
                                + "Grade "
                                + academicClass.getGrade()
                                + " - Section "
                                + academicClass.getSectionName()
                                + " - Academic Year "
                                + academicClass.getAcademicYear()
                );

            } catch (Exception e) {

                System.err.println(
                        "Failed to initialize default subjects "
                                + "for Grade "
                                + academicClass.getGrade()
                                + " - Section "
                                + academicClass.getSectionName()
                );

                System.err.println(
                        "Reason: "
                                + e.getMessage()
                );

                throw e;
            }
        }

        System.out.println(
                "Default subject initialization completed."
        );

        System.out.println(
                "=============================================="
        );
    }
}