package com.gradexa.backend.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gradexa.backend.dto.MarkCalculationResponse;
import com.gradexa.backend.dto.MarkRankingResponse;
import com.gradexa.backend.dto.MarkYearlyRankingResponse;
import com.gradexa.backend.dto.MarkYearlyResultResponse;
import com.gradexa.backend.entity.Mark;
import com.gradexa.backend.entity.StudentEnrollment;
import com.gradexa.backend.entity.Subject;
import com.gradexa.backend.entity.Term;
import com.gradexa.backend.exception.ResourceNotFoundException;
import com.gradexa.backend.repository.MarkRepository;
import com.gradexa.backend.repository.StudentEnrollmentRepository;
import com.gradexa.backend.repository.SubjectRepository;

@Service
public class MarkService {

    private final MarkRepository markRepository;
    private final StudentEnrollmentRepository enrollmentRepository;
    private final SubjectRepository subjectRepository;

    public MarkService(
            MarkRepository markRepository,
            StudentEnrollmentRepository enrollmentRepository,
            SubjectRepository subjectRepository
    ) {
        this.markRepository = markRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.subjectRepository = subjectRepository;
    }

    // ============================================================
    // ADD MARK
    // ============================================================

    @Transactional
    public Mark addMark(
            Long enrollmentId,
            Long subjectId,
            Term term,
            Double marks
    ) {

        if (marks == null) {
            throw new RuntimeException(
                    "Marks are required"
            );
        }

        if (marks < 0 || marks > 100) {
            throw new RuntimeException(
                    "Marks must be between 0 and 100"
            );
        }

        if (term == null) {
            throw new RuntimeException(
                    "Term is required"
            );
        }

        StudentEnrollment enrollment =
                enrollmentRepository.findById(enrollmentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Student enrollment not found"
                                )
                        );

        Subject subject =
                subjectRepository.findById(subjectId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Subject not found"
                                )
                        );

        if (!enrollment.isActive()) {
            throw new RuntimeException(
                    "Cannot add marks to an inactive enrollment"
            );
        }

        if (!subject.isActive()) {
            throw new RuntimeException(
                    "Cannot add marks for an inactive subject"
            );
        }

        if (!subject.getAcademicClass()
                .getId()
                .equals(
                        enrollment.getAcademicClass().getId()
                )) {

            throw new RuntimeException(
                    "Subject does not belong to the student's class"
            );
        }

        if (markRepository
                .existsByStudentEnrollmentAndSubjectIdAndTerm(
                        enrollment,
                        subjectId,
                        term
                )) {

            throw new RuntimeException(
                    "Marks already exist for this student, subject and term"
            );
        }

        Mark mark = new Mark();

        mark.setStudentEnrollment(enrollment);
        mark.setSubject(subject);
        mark.setTerm(term);
        mark.setMarks(marks);

        return markRepository.save(mark);
    }

    // ============================================================
    // GET ALL MARKS FOR AN ENROLLMENT
    // ============================================================

    public List<Mark> getMarksByEnrollment(
            Long enrollmentId
    ) {

        StudentEnrollment enrollment =
                enrollmentRepository.findById(enrollmentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Student enrollment not found"
                                )
                        );

        return markRepository
                .findByStudentEnrollment(enrollment);
    }

    // ============================================================
    // GET MARKS FOR AN ENROLLMENT AND TERM
    // ============================================================

    public List<Mark> getMarksByEnrollmentAndTerm(
            Long enrollmentId,
            Term term
    ) {

        StudentEnrollment enrollment =
                enrollmentRepository.findById(enrollmentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Student enrollment not found"
                                )
                        );

        if (term == null) {
            throw new RuntimeException(
                    "Term is required"
            );
        }

        return markRepository
                .findByStudentEnrollmentAndTerm(
                        enrollment,
                        term
                );
    }

    // ============================================================
    // GET MARK BY ID
    // ============================================================

    public Mark getMarkById(Long id) {

        return markRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Mark not found"
                        )
                );
    }

    // ============================================================
    // UPDATE MARK
    // ============================================================

    @Transactional
    public Mark updateMark(
            Long id,
            Double marks
    ) {

        if (marks == null) {
            throw new RuntimeException(
                    "Marks are required"
            );
        }

        if (marks < 0 || marks > 100) {
            throw new RuntimeException(
                    "Marks must be between 0 and 100"
            );
        }

        Mark mark = getMarkById(id);

        mark.setMarks(marks);

        return markRepository.save(mark);
    }

    // ============================================================
    // CALCULATE TERM RESULTS
    // ============================================================

    public MarkCalculationResponse calculateTermResults(
            Long enrollmentId,
            Term term
    ) {

        StudentEnrollment enrollment =
                enrollmentRepository.findById(enrollmentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Student enrollment not found"
                                )
                        );

        if (term == null) {
            throw new RuntimeException(
                    "Term is required"
            );
        }

        List<Mark> marks =
                markRepository.findByStudentEnrollmentAndTerm(
                        enrollment,
                        term
                );

        if (marks.isEmpty()) {
            throw new RuntimeException(
                    "No marks found for this student and term"
            );
        }

        double total = marks.stream()
                .mapToDouble(Mark::getMarks)
                .sum();

        int subjectCount = marks.size();

        double average = total / subjectCount;

        String studentNumber =
                enrollment
                        .getStudent()
                        .getStudentNumber();

        String studentName =
                enrollment
                        .getStudent()
                        .getFirstName()
                        + " "
                        + enrollment
                        .getStudent()
                        .getLastName();

        double roundedAverage =
                Math.round(average * 100.0) / 100.0;

        return new MarkCalculationResponse(
                enrollmentId,
                studentNumber,
                studentName,
                term.name(),
                subjectCount,
                total,
                roundedAverage
        );
    }

    // ============================================================
    // CALCULATE CLASS RANKING
    // ============================================================

    public MarkRankingResponse calculateClassRanking(
            Long enrollmentId,
            Term term
    ) {

        StudentEnrollment selectedEnrollment =
                enrollmentRepository.findById(enrollmentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Student enrollment not found"
                                )
                        );

        if (term == null) {
            throw new RuntimeException(
                    "Term is required"
            );
        }

        Long classId =
                selectedEnrollment
                        .getAcademicClass()
                        .getId();

        List<StudentEnrollment> enrollments =
                enrollmentRepository
                        .findByAcademicClassIdAndActiveTrue(
                                classId
                        );

        if (enrollments.isEmpty()) {
            throw new RuntimeException(
                    "No active students found in this class"
            );
        }

        List<StudentResult> results =
                enrollments.stream()
                        .map(enrollment ->
                                calculateStudentResult(
                                        enrollment,
                                        term
                                )
                        )
                        .filter(result ->
                                result.subjectCount > 0
                        )
                        .sorted((a, b) ->
                                Double.compare(
                                        b.average,
                                        a.average
                                )
                        )
                        .toList();

        if (results.isEmpty()) {
            throw new RuntimeException(
                    "No students have marks for this term"
            );
        }

        int place = 0;

        for (int i = 0; i < results.size(); i++) {

            if (results.get(i)
                    .enrollmentId
                    .equals(enrollmentId)) {

                place = i + 1;
                break;
            }
        }

        if (place == 0) {
            throw new RuntimeException(
                    "Selected student has no marks for this term"
            );
        }

        StudentResult selectedResult =
                results.get(place - 1);

        return new MarkRankingResponse(
                selectedResult.enrollmentId,
                selectedResult.studentNumber,
                selectedResult.studentName,
                term.name(),
                selectedResult.total,
                selectedResult.average,
                place,
                results.size()
        );
    }

    // ============================================================
    // CALCULATE INDIVIDUAL STUDENT TERM RESULT
    // ============================================================

    private StudentResult calculateStudentResult(
            StudentEnrollment enrollment,
            Term term
    ) {

        List<Mark> marks =
                markRepository.findByStudentEnrollmentAndTerm(
                        enrollment,
                        term
                );

        if (marks.isEmpty()) {

            return new StudentResult(
                    enrollment.getId(),
                    enrollment.getStudent()
                            .getStudentNumber(),
                    enrollment.getStudent()
                            .getFirstName()
                            + " "
                            + enrollment.getStudent()
                            .getLastName(),
                    0,
                    0.0,
                    0.0
            );
        }

        double total = marks.stream()
                .mapToDouble(Mark::getMarks)
                .sum();

        int subjectCount = marks.size();

        double average =
                total / subjectCount;

        double roundedAverage =
                Math.round(average * 100.0) / 100.0;

        return new StudentResult(
                enrollment.getId(),
                enrollment.getStudent()
                        .getStudentNumber(),
                enrollment.getStudent()
                        .getFirstName()
                        + " "
                        + enrollment.getStudent()
                        .getLastName(),
                subjectCount,
                total,
                roundedAverage
        );
    }

    // ============================================================
    // CALCULATE YEARLY RESULTS
    // ============================================================

    public MarkYearlyResultResponse calculateYearlyResults(
            Long enrollmentId
    ) {

        StudentEnrollment enrollment =
                enrollmentRepository.findById(enrollmentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Student enrollment not found"
                                )
                        );

        MarkCalculationResponse term1 =
                calculateTermResultOrEmpty(
                        enrollmentId,
                        Term.TERM_1
                );

        MarkCalculationResponse term2 =
                calculateTermResultOrEmpty(
                        enrollmentId,
                        Term.TERM_2
                );

        MarkCalculationResponse term3 =
                calculateTermResultOrEmpty(
                        enrollmentId,
                        Term.TERM_3
                );

        double overallTotal =
                term1.getTotal()
                        + term2.getTotal()
                        + term3.getTotal();

        int termsWithMarks = 0;

        if (term1.getSubjectCount() > 0) {
            termsWithMarks++;
        }

        if (term2.getSubjectCount() > 0) {
            termsWithMarks++;
        }

        if (term3.getSubjectCount() > 0) {
            termsWithMarks++;
        }

        if (termsWithMarks == 0) {
            throw new RuntimeException(
                    "No marks found for this student"
            );
        }

        double overallAverage =
                (term1.getAverage()
                        + term2.getAverage()
                        + term3.getAverage())
                        / termsWithMarks;

        overallAverage =
                Math.round(overallAverage * 100.0) / 100.0;

        return new MarkYearlyResultResponse(
                enrollmentId,
                enrollment.getStudent().getStudentNumber(),
                enrollment.getStudent().getFirstName()
                        + " "
                        + enrollment.getStudent().getLastName(),

                term1.getTotal(),
                term1.getAverage(),

                term2.getTotal(),
                term2.getAverage(),

                term3.getTotal(),
                term3.getAverage(),

                overallTotal,
                overallAverage
        );
    }

    // ============================================================
    // CALCULATE TERM RESULT OR EMPTY
    // ============================================================

    private MarkCalculationResponse calculateTermResultOrEmpty(
            Long enrollmentId,
            Term term
    ) {

        StudentEnrollment enrollment =
                enrollmentRepository.findById(enrollmentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Student enrollment not found"
                                )
                        );

        List<Mark> marks =
                markRepository.findByStudentEnrollmentAndTerm(
                        enrollment,
                        term
                );

        if (marks.isEmpty()) {

            return new MarkCalculationResponse(
                    enrollmentId,
                    enrollment.getStudent().getStudentNumber(),
                    enrollment.getStudent().getFirstName()
                            + " "
                            + enrollment.getStudent().getLastName(),
                    term.name(),
                    0,
                    0.0,
                    0.0
            );
        }

        double total = marks.stream()
                .mapToDouble(Mark::getMarks)
                .sum();

        int subjectCount = marks.size();

        double average =
                total / subjectCount;

        double roundedAverage =
                Math.round(average * 100.0) / 100.0;

        return new MarkCalculationResponse(
                enrollmentId,
                enrollment.getStudent().getStudentNumber(),
                enrollment.getStudent().getFirstName()
                        + " "
                        + enrollment.getStudent().getLastName(),
                term.name(),
                subjectCount,
                total,
                roundedAverage
        );
    }

    // ============================================================
    // CALCULATE OVERALL YEARLY CLASS RANKING
    // ============================================================

    public MarkYearlyRankingResponse calculateYearlyClassRanking(
            Long enrollmentId
    ) {

        StudentEnrollment selectedEnrollment =
                enrollmentRepository.findById(enrollmentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Student enrollment not found"
                                )
                        );

        Long classId =
                selectedEnrollment
                        .getAcademicClass()
                        .getId();

        List<StudentEnrollment> enrollments =
                enrollmentRepository
                        .findByAcademicClassIdAndActiveTrue(
                                classId
                        );

        if (enrollments.isEmpty()) {
            throw new RuntimeException(
                    "No active students found in this class"
            );
        }

        List<YearlyStudentResult> results =
                enrollments.stream()
                        .map(enrollment -> {

                            List<Mark> allMarks =
                                    markRepository
                                            .findByStudentEnrollment(
                                                    enrollment
                                            );

                            if (allMarks.isEmpty()) {
                                return null;
                            }

                            MarkYearlyResultResponse yearly =
                                    calculateYearlyResults(
                                            enrollment.getId()
                                    );

                            return new YearlyStudentResult(
                                    enrollment.getId(),
                                    yearly.getStudentNumber(),
                                    yearly.getStudentName(),
                                    yearly.getOverallTotal(),
                                    yearly.getOverallAverage()
                            );
                        })
                        .filter(result ->
                                result != null
                        )
                        .sorted((a, b) ->
                                Double.compare(
                                        b.overallAverage,
                                        a.overallAverage
                                )
                        )
                        .toList();

        if (results.isEmpty()) {
            throw new RuntimeException(
                    "No students have marks for this class"
            );
        }

        int place = 0;

        for (int i = 0; i < results.size(); i++) {

            if (results.get(i)
                    .enrollmentId
                    .equals(enrollmentId)) {

                place = i + 1;
                break;
            }
        }

        if (place == 0) {
            throw new RuntimeException(
                    "Selected student has no marks"
            );
        }

        YearlyStudentResult selectedResult =
                results.get(place - 1);

        return new MarkYearlyRankingResponse(
                selectedResult.enrollmentId,
                selectedResult.studentNumber,
                selectedResult.studentName,
                selectedResult.overallTotal,
                selectedResult.overallAverage,
                place,
                results.size()
        );
    }

    // ============================================================
    // CHECK STUDENT ENROLLMENT OWNERSHIP
    // ============================================================

    public void checkStudentAccess(
            StudentEnrollment enrollment
    ) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null) {
            throw new RuntimeException(
                    "User is not authenticated"
            );
        }

        String username =
                authentication.getName();

        String enrollmentUsername =
                enrollment
                        .getStudent()
                        .getUser()
                        .getUsername();

        if (!username.equals(enrollmentUsername)) {
            throw new RuntimeException(
                    "You can only access your own student records"
            );
        }
    }

    // ============================================================
    // INTERNAL STUDENT RESULT CLASS
    // ============================================================

    private static class StudentResult {

        private final Long enrollmentId;
        private final String studentNumber;
        private final String studentName;
        private final int subjectCount;
        private final double total;
        private final double average;

        public StudentResult(
                Long enrollmentId,
                String studentNumber,
                String studentName,
                int subjectCount,
                double total,
                double average
        ) {

            this.enrollmentId = enrollmentId;
            this.studentNumber = studentNumber;
            this.studentName = studentName;
            this.subjectCount = subjectCount;
            this.total = total;
            this.average = average;
        }
    }

    // ============================================================
    // INTERNAL YEARLY STUDENT RESULT CLASS
    // ============================================================

    private static class YearlyStudentResult {

        private final Long enrollmentId;
        private final String studentNumber;
        private final String studentName;
        private final double overallTotal;
        private final double overallAverage;

        public YearlyStudentResult(
                Long enrollmentId,
                String studentNumber,
                String studentName,
                double overallTotal,
                double overallAverage
        ) {

            this.enrollmentId = enrollmentId;
            this.studentNumber = studentNumber;
            this.studentName = studentName;
            this.overallTotal = overallTotal;
            this.overallAverage = overallAverage;
        }
    }
}