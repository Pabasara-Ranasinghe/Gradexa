package com.gradexa.backend.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;

import com.gradexa.backend.dto.StudentPerformanceResponse;
import com.gradexa.backend.entity.AcademicClass;
import com.gradexa.backend.entity.Mark;
import com.gradexa.backend.entity.Student;
import com.gradexa.backend.entity.StudentEnrollment;
import com.gradexa.backend.entity.Term;
import com.gradexa.backend.exception.ResourceNotFoundException;
import com.gradexa.backend.repository.AcademicClassRepository;
import com.gradexa.backend.repository.MarkRepository;
import com.gradexa.backend.repository.StudentEnrollmentRepository;
import com.gradexa.backend.repository.SubjectRepository;

@Service
public class StudentPerformanceService {

    private final StudentEnrollmentRepository enrollmentRepository;
    private final MarkRepository markRepository;
    private final AcademicClassRepository academicClassRepository;
    private final SubjectRepository subjectRepository;
    private final StudentService studentService;

    public StudentPerformanceService(
            StudentEnrollmentRepository enrollmentRepository,
            MarkRepository markRepository,
            AcademicClassRepository academicClassRepository,
            SubjectRepository subjectRepository,
            StudentService studentService
    ) {
        this.enrollmentRepository = enrollmentRepository;
        this.markRepository = markRepository;
        this.academicClassRepository = academicClassRepository;
        this.subjectRepository = subjectRepository;
        this.studentService = studentService;
    }

    // ==========================================================
    // GET CLASS PERFORMANCE
    // ==========================================================

    public List<StudentPerformanceResponse> getClassPerformance(
            Long classId
    ) {

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

        // ======================================================
        // TOTAL ACTIVE SUBJECTS IN THIS CLASS
        // ======================================================

        int totalSubjects =
                (int) subjectRepository
                        .countByAcademicClassIdAndActiveTrue(
                                academicClass.getId()
                        );

        List<StudentResult> results =
                new ArrayList<>();

        // ======================================================
        // CALCULATE EACH STUDENT'S RESULTS
        // ======================================================

        for (StudentEnrollment enrollment :
                enrollments) {

            List<Mark> allMarks =
                    markRepository
                            .findByStudentEnrollment(
                                    enrollment
                            );

            // Skip students who have no marks at all
            if (allMarks.isEmpty()) {
                continue;
            }

            // --------------------------------------------------
            // TERM 1
            // --------------------------------------------------

            TermResult term1 =
                    calculateTermResult(
                            allMarks,
                            Term.TERM_1,
                            totalSubjects
                    );

            // --------------------------------------------------
            // TERM 2
            // --------------------------------------------------

            TermResult term2 =
                    calculateTermResult(
                            allMarks,
                            Term.TERM_2,
                            totalSubjects
                    );

            // --------------------------------------------------
            // TERM 3
            // --------------------------------------------------

            TermResult term3 =
                    calculateTermResult(
                            allMarks,
                            Term.TERM_3,
                            totalSubjects
                    );

            // ==================================================
            // OVERALL
            // ==================================================

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

                            // Term 1
                            term1.total,
                            term1.average,
                            term1.count,
                            term1.absentSubjects,

                            // Term 2
                            term2.total,
                            term2.average,
                            term2.count,
                            term2.absentSubjects,

                            // Term 3
                            term3.total,
                            term3.average,
                            term3.count,
                            term3.absentSubjects,

                            // Overall
                            overallTotal,
                            overallAverage
                    )
            );
        }

        // ======================================================
        // CALCULATE TERM 1 POSITIONS
        // ======================================================

        assignTermPositions(
                results,
                Term.TERM_1
        );

        // ======================================================
        // CALCULATE TERM 2 POSITIONS
        // ======================================================

        assignTermPositions(
                results,
                Term.TERM_2
        );

        // ======================================================
        // CALCULATE TERM 3 POSITIONS
        // ======================================================

        assignTermPositions(
                results,
                Term.TERM_3
        );

        // ======================================================
        // TOTAL STUDENTS WHO PARTICIPATED IN EACH TERM
        // ======================================================

        int term1TotalStudents =
                (int) results.stream()
                        .filter(result ->
                                result.term1ParticipatedSubjects > 0
                        )
                        .count();

        int term2TotalStudents =
                (int) results.stream()
                        .filter(result ->
                                result.term2ParticipatedSubjects > 0
                        )
                        .count();

        int term3TotalStudents =
                (int) results.stream()
                        .filter(result ->
                                result.term3ParticipatedSubjects > 0
                        )
                        .count();

        // ======================================================
        // CREATE RESPONSE
        // ======================================================

        List<StudentPerformanceResponse> responses =
                new ArrayList<>();

        for (StudentResult result : results) {

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

                            // ----------------------------------
                            // STUDENT INFORMATION
                            // ----------------------------------

                            enrollment.getId(),

                            enrollment
                                    .getStudent()
                                    .getStudentNumber(),

                            studentName,

                            // ----------------------------------
                            // TERM 1
                            // ----------------------------------

                            result.term1Total,

                            result.term1Average,

                            result.term1Place,

                            term1TotalStudents,

                            result.term1ParticipatedSubjects,

                            result.term1AbsentSubjects,

                            // ----------------------------------
                            // TERM 2
                            // ----------------------------------

                            result.term2Total,

                            result.term2Average,

                            result.term2Place,

                            term2TotalStudents,

                            result.term2ParticipatedSubjects,

                            result.term2AbsentSubjects,

                            // ----------------------------------
                            // TERM 3
                            // ----------------------------------

                            result.term3Total,

                            result.term3Average,

                            result.term3Place,

                            term3TotalStudents,

                            result.term3ParticipatedSubjects,

                            result.term3AbsentSubjects,

                            // ----------------------------------
                            // OVERALL
                            // ----------------------------------

                            result.overallTotal,

                            result.overallAverage
                    )
            );
        }

        return responses;
    }

    // ==========================================================
    // GET CURRENT LOGGED-IN STUDENT PERFORMANCE
    // ==========================================================

    public StudentPerformanceResponse
    getCurrentStudentPerformance() {

        Student student =
                studentService.getCurrentStudent();

        StudentEnrollment enrollment =
                enrollmentRepository
                        .findByStudentAndActiveTrue(
                                student
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Current student enrollment not found"
                                )
                        );

        List<StudentPerformanceResponse> classPerformance =
                getClassPerformance(
                        enrollment
                                .getAcademicClass()
                                .getId()
                );

        return classPerformance
                .stream()
                .filter(result ->
                        result.getEnrollmentId()
                                .equals(
                                        enrollment.getId()
                                )
                )
                .findFirst()
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "No marks found for the current student"
                        )
                );
    }

    // ==========================================================
    // CALCULATE ONE TERM
    // ==========================================================

    private TermResult calculateTermResult(
            List<Mark> allMarks,
            Term term,
            int totalSubjects
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

        int participatedSubjects =
                count;

        int absentSubjects =
                count == 0
                        ? 0
                        : Math.max(
                                totalSubjects -
                                        participatedSubjects,
                                0
                        );

        return new TermResult(
                total,
                average,
                participatedSubjects,
                absentSubjects
        );
    }

    // ==========================================================
    // ASSIGN TERM POSITIONS
    // ==========================================================

    private void assignTermPositions(
            List<StudentResult> results,
            Term term
    ) {

        List<StudentResult> rankedStudents =
                results.stream()
                        .filter(result ->
                                getTermParticipatedSubjects(
                                        result,
                                        term
                                ) > 0
                        )
                        .sorted(
                                Comparator.comparingDouble(
                                        (StudentResult result) ->
                                                getTermAverage(
                                                        result,
                                                        term
                                                )
                                ).reversed()
                        )
                        .toList();

        for (int i = 0;
             i < rankedStudents.size();
             i++) {

            StudentResult result =
                    rankedStudents.get(i);

            int position =
                    i + 1;

            setTermPosition(
                    result,
                    term,
                    position
            );
        }
    }

    // ==========================================================
    // GET TERM AVERAGE
    // ==========================================================

    private double getTermAverage(
            StudentResult result,
            Term term
    ) {

        return switch (term) {

            case TERM_1 ->
                    result.term1Average;

            case TERM_2 ->
                    result.term2Average;

            case TERM_3 ->
                    result.term3Average;
        };
    }

    // ==========================================================
    // GET PARTICIPATED SUBJECT COUNT
    // ==========================================================

    private int getTermParticipatedSubjects(
            StudentResult result,
            Term term
    ) {

        return switch (term) {

            case TERM_1 ->
                    result.term1ParticipatedSubjects;

            case TERM_2 ->
                    result.term2ParticipatedSubjects;

            case TERM_3 ->
                    result.term3ParticipatedSubjects;
        };
    }

    // ==========================================================
    // SET TERM POSITION
    // ==========================================================

    private void setTermPosition(
            StudentResult result,
            Term term,
            int position
    ) {

        switch (term) {

            case TERM_1 ->
                    result.term1Place = position;

            case TERM_2 ->
                    result.term2Place = position;

            case TERM_3 ->
                    result.term3Place = position;
        }
    }

    // ==========================================================
    // TERM RESULT HELPER
    // ==========================================================

    private static class TermResult {

        private final double total;

        private final double average;

        private final int count;

        private final int absentSubjects;

        public TermResult(
                double total,
                double average,
                int count,
                int absentSubjects
        ) {

            this.total = total;

            this.average = average;

            this.count = count;

            this.absentSubjects =
                    absentSubjects;
        }
    }

    // ==========================================================
    // STUDENT RESULT HELPER
    // ==========================================================

    private static class StudentResult {

        private final StudentEnrollment enrollment;

        // ------------------------------------------------------
        // TERM 1
        // ------------------------------------------------------

        private final double term1Total;

        private final double term1Average;

        private final int term1ParticipatedSubjects;

        private final int term1AbsentSubjects;

        private int term1Place;

        // ------------------------------------------------------
        // TERM 2
        // ------------------------------------------------------

        private final double term2Total;

        private final double term2Average;

        private final int term2ParticipatedSubjects;

        private final int term2AbsentSubjects;

        private int term2Place;

        // ------------------------------------------------------
        // TERM 3
        // ------------------------------------------------------

        private final double term3Total;

        private final double term3Average;

        private final int term3ParticipatedSubjects;

        private final int term3AbsentSubjects;

        private int term3Place;

        // ------------------------------------------------------
        // OVERALL
        // ------------------------------------------------------

        private final double overallTotal;

        private final double overallAverage;

        public StudentResult(
                StudentEnrollment enrollment,

                // Term 1
                double term1Total,
                double term1Average,
                int term1ParticipatedSubjects,
                int term1AbsentSubjects,

                // Term 2
                double term2Total,
                double term2Average,
                int term2ParticipatedSubjects,
                int term2AbsentSubjects,

                // Term 3
                double term3Total,
                double term3Average,
                int term3ParticipatedSubjects,
                int term3AbsentSubjects,

                // Overall
                double overallTotal,
                double overallAverage
        ) {

            this.enrollment =
                    enrollment;

            // Term 1
            this.term1Total =
                    term1Total;

            this.term1Average =
                    term1Average;

            this.term1ParticipatedSubjects =
                    term1ParticipatedSubjects;

            this.term1AbsentSubjects =
                    term1AbsentSubjects;

            // Term 2
            this.term2Total =
                    term2Total;

            this.term2Average =
                    term2Average;

            this.term2ParticipatedSubjects =
                    term2ParticipatedSubjects;

            this.term2AbsentSubjects =
                    term2AbsentSubjects;

            // Term 3
            this.term3Total =
                    term3Total;

            this.term3Average =
                    term3Average;

            this.term3ParticipatedSubjects =
                    term3ParticipatedSubjects;

            this.term3AbsentSubjects =
                    term3AbsentSubjects;

            // Overall
            this.overallTotal =
                    overallTotal;

            this.overallAverage =
                    overallAverage;
        }
    }
}