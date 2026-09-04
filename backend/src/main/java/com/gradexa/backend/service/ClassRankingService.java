package com.gradexa.backend.service;

import com.gradexa.backend.dto.ClassRankingResponse;
import com.gradexa.backend.entity.AcademicClass;
import com.gradexa.backend.entity.Mark;
import com.gradexa.backend.entity.StudentEnrollment;
import com.gradexa.backend.exception.ResourceNotFoundException;
import com.gradexa.backend.repository.AcademicClassRepository;
import com.gradexa.backend.repository.MarkRepository;
import com.gradexa.backend.repository.StudentEnrollmentRepository;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class ClassRankingService {

    private final StudentEnrollmentRepository enrollmentRepository;
    private final MarkRepository markRepository;
    private final AcademicClassRepository academicClassRepository;

    public ClassRankingService(
            StudentEnrollmentRepository enrollmentRepository,
            MarkRepository markRepository,
            AcademicClassRepository academicClassRepository
    ) {
        this.enrollmentRepository =
                enrollmentRepository;

        this.markRepository =
                markRepository;

        this.academicClassRepository =
                academicClassRepository;
    }

    public List<ClassRankingResponse> getClassRanking(
            Long classId
    ) {

        // Check whether the class exists
        AcademicClass academicClass =
                academicClassRepository
                        .findById(classId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Class not found"
                                )
                        );

        List<StudentEnrollment> enrollments =
                enrollmentRepository
                        .findByAcademicClassIdAndActiveTrue(
                                classId
                        );

        if (enrollments.isEmpty()) {
            throw new RuntimeException(
                    "No students found in this class"
            );
        }

        List<StudentRanking> rankings =
                new ArrayList<>();

        // Calculate overall result for each student
        for (StudentEnrollment enrollment :
                enrollments) {

            List<Mark> marks =
                    markRepository
                            .findByStudentEnrollment(
                                    enrollment
                            );

            // Students without marks are excluded
            if (marks.isEmpty()) {
                continue;
            }

            double total = 0;

            for (Mark mark : marks) {
                total += mark.getMarks();
            }

            double average =
                    total / marks.size();

            rankings.add(
                    new StudentRanking(
                            enrollment,
                            total,
                            average
                    )
            );
        }

        // Highest average gets first place
        rankings.sort(
                Comparator.comparingDouble(
                        StudentRanking::getAverage
                ).reversed()
        );

        List<ClassRankingResponse> responses =
                new ArrayList<>();

        for (int i = 0; i < rankings.size(); i++) {

            StudentRanking ranking =
                    rankings.get(i);

            StudentEnrollment enrollment =
                    ranking.enrollment;

            String studentName =
                    enrollment
                            .getStudent()
                            .getFirstName()
                            + " "
                            + enrollment
                            .getStudent()
                            .getLastName();

            responses.add(
                    new ClassRankingResponse(
                            i + 1,

                            enrollment.getId(),

                            enrollment
                                    .getStudent()
                                    .getStudentNumber(),

                            studentName,

                            ranking.total,

                            ranking.average
                    )
            );
        }

        return responses;
    }

    // ==========================================================
    // Student Ranking Helper
    // ==========================================================

    private static class StudentRanking {

        private final StudentEnrollment enrollment;
        private final double total;
        private final double average;

        public StudentRanking(
                StudentEnrollment enrollment,
                double total,
                double average
        ) {
            this.enrollment = enrollment;
            this.total = total;
            this.average = average;
        }

        public double getAverage() {
            return average;
        }
    }
}