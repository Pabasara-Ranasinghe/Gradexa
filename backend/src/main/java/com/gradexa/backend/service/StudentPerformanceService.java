package com.gradexa.backend.service;

import com.gradexa.backend.dto.StudentPerformanceResponse;
import com.gradexa.backend.entity.AcademicClass;
import com.gradexa.backend.entity.Mark;
import com.gradexa.backend.entity.StudentEnrollment;
import com.gradexa.backend.entity.Term;
import com.gradexa.backend.exception.ResourceNotFoundException;
import com.gradexa.backend.repository.AcademicClassRepository;
import com.gradexa.backend.repository.MarkRepository;
import com.gradexa.backend.repository.StudentEnrollmentRepository;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class StudentPerformanceService {

    private final StudentEnrollmentRepository enrollmentRepository;
    private final MarkRepository markRepository;
    private final AcademicClassRepository academicClassRepository;

    public StudentPerformanceService(
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

    public List<StudentPerformanceResponse> getClassPerformance(
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

        List<StudentResult> results =
                new ArrayList<>();

        // Calculate each student's results
        for (StudentEnrollment enrollment :
                enrollments) {

            List<Mark> allMarks =
                    markRepository
                            .findByStudentEnrollment(
                                    enrollment
                            );

            // Skip students who have no marks
            if (allMarks.isEmpty()) {
                continue;
            }

            TermResult term1 =
                    calculateTermResult(
                            allMarks,
                            Term.TERM_1
                    );

            TermResult term2 =
                    calculateTermResult(
                            allMarks,
                            Term.TERM_2
                    );

            TermResult term3 =
                    calculateTermResult(
                            allMarks,
                            Term.TERM_3
                    );

            double overallTotal =
                    term1.total
                            + term2.total
                            + term3.total;

            int totalMarksCount =
                    term1.count
                            + term2.count
                            + term3.count;

            double overallAverage =
                    totalMarksCount == 0
                            ? 0
                            : overallTotal /
                            totalMarksCount;

            results.add(
                    new StudentResult(
                            enrollment,
                            term1.total,
                            term1.average,
                            term2.total,
                            term2.average,
                            term3.total,
                            term3.average,
                            overallTotal,
                            overallAverage
                    )
            );
        }

        // Sort highest average first
        results.sort(
                Comparator.comparingDouble(
                        StudentResult::getOverallAverage
                ).reversed()
        );

        int totalStudents =
                results.size();

        List<StudentPerformanceResponse> responses =
                new ArrayList<>();

        // Assign places
        for (int i = 0; i < results.size(); i++) {

            StudentResult result =
                    results.get(i);

            int place = i + 1;

            StudentEnrollment enrollment =
                    result.enrollment;

            String studentName =
                    enrollment
                            .getStudent()
                            .getFirstName()
                            + " "
                            + enrollment
                            .getStudent()
                            .getLastName();

            responses.add(
                    new StudentPerformanceResponse(
                            enrollment.getId(),

                            enrollment
                                    .getStudent()
                                    .getStudentNumber(),

                            studentName,

                            result.term1Total,
                            result.term1Average,

                            result.term2Total,
                            result.term2Average,

                            result.term3Total,
                            result.term3Average,

                            result.overallTotal,
                            result.overallAverage,

                            place,
                            totalStudents
                    )
            );
        }

        return responses;
    }

    // ==========================================================
    // Calculate One Term
    // ==========================================================

    private TermResult calculateTermResult(
            List<Mark> allMarks,
            Term term
    ) {

        double total = 0;
        int count = 0;

        for (Mark mark : allMarks) {

            if (mark.getTerm() == term) {

                total += mark.getMarks();
                count++;
            }
        }

        double average =
                count == 0
                        ? 0
                        : total / count;

        return new TermResult(
                total,
                average,
                count
        );
    }

    // ==========================================================
    // Term Result Helper
    // ==========================================================

    private static class TermResult {

        private final double total;
        private final double average;
        private final int count;

        public TermResult(
                double total,
                double average,
                int count
        ) {
            this.total = total;
            this.average = average;
            this.count = count;
        }
    }

    // ==========================================================
    // Student Result Helper
    // ==========================================================

    private static class StudentResult {

        private final StudentEnrollment enrollment;

        private final double term1Total;
        private final double term1Average;

        private final double term2Total;
        private final double term2Average;

        private final double term3Total;
        private final double term3Average;

        private final double overallTotal;
        private final double overallAverage;

        public StudentResult(
                StudentEnrollment enrollment,
                double term1Total,
                double term1Average,
                double term2Total,
                double term2Average,
                double term3Total,
                double term3Average,
                double overallTotal,
                double overallAverage
        ) {

            this.enrollment = enrollment;

            this.term1Total = term1Total;
            this.term1Average = term1Average;

            this.term2Total = term2Total;
            this.term2Average = term2Average;

            this.term3Total = term3Total;
            this.term3Average = term3Average;

            this.overallTotal = overallTotal;
            this.overallAverage = overallAverage;
        }

        public double getOverallAverage() {
            return overallAverage;
        }
    }
}