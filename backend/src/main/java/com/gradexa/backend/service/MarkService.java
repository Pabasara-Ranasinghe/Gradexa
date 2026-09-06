package com.gradexa.backend.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gradexa.backend.entity.Mark;
import com.gradexa.backend.entity.MarkStatus;
import com.gradexa.backend.entity.Student;
import com.gradexa.backend.entity.StudentEnrollment;
import com.gradexa.backend.entity.Subject;
import com.gradexa.backend.entity.Teacher;
import com.gradexa.backend.entity.Term;
import com.gradexa.backend.repository.MarkRepository;
import com.gradexa.backend.repository.StudentEnrollmentRepository;
import com.gradexa.backend.repository.SubjectRepository;
import com.gradexa.backend.repository.TeacherRepository;

@Service
public class MarkService {

    private final MarkRepository markRepository;
    private final StudentEnrollmentRepository enrollmentRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherRepository teacherRepository;

    public MarkService(
            MarkRepository markRepository,
            StudentEnrollmentRepository enrollmentRepository,
            SubjectRepository subjectRepository,
            TeacherRepository teacherRepository
    ) {
        this.markRepository = markRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.subjectRepository = subjectRepository;
        this.teacherRepository = teacherRepository;
    }

    // ==========================================================
    // ADD MARK
    // ==========================================================

    @Transactional
    public Mark addMark(
            Long enrollmentId,
            Long subjectId,
            Term term,
            Double marks,
            Boolean absent
    ) {

        boolean isAbsent = Boolean.TRUE.equals(absent);

        if (isAbsent) {
            marks = 0.0;
        } else {
            validateMarks(marks);
        }

        StudentEnrollment enrollment =
                enrollmentRepository
                        .findById(enrollmentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Student enrollment not found."
                                )
                        );

        Subject subject =
                subjectRepository
                        .findById(subjectId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Subject not found."
                                )
                        );

        validateEnrollmentAndSubject(
                enrollment,
                subject
        );

        if (markRepository
                .existsByStudentEnrollmentAndSubjectIdAndTerm(
                        enrollment,
                        subjectId,
                        term
                )) {

            throw new RuntimeException(
                    "A mark already exists for this student, subject and term."
            );
        }

        Mark mark = new Mark();

        mark.setStudentEnrollment(enrollment);
        mark.setSubject(subject);
        mark.setTerm(term);
        mark.setMarks(marks);
        mark.setAbsent(isAbsent);
        mark.setStatus(MarkStatus.SUBMITTED);

        return markRepository.save(mark);
    }

    // ==========================================================
    // ADD TEACHER DRAFT MARK
    // ==========================================================

    @Transactional
    public Mark addTeacherDraftMark(
            Long enrollmentId,
            Long subjectId,
            Term term,
            Double marks,
            Boolean absent
    ) {

        boolean isAbsent = Boolean.TRUE.equals(absent);

        if (isAbsent) {
            marks = 0.0;
        } else {
            validateMarks(marks);
        }

        validateTeacher();

        StudentEnrollment enrollment =
                enrollmentRepository
                        .findById(enrollmentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Student enrollment not found."
                                )
                        );

        Subject subject =
                subjectRepository
                        .findById(subjectId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Subject not found."
                                )
                        );

        validateEnrollmentAndSubject(
                enrollment,
                subject
        );

        if (markRepository
                .existsByStudentEnrollmentAndSubjectIdAndTerm(
                        enrollment,
                        subjectId,
                        term
                )) {

            throw new RuntimeException(
                    "A mark already exists for this student, subject and term."
            );
        }

        Mark mark = new Mark();

        mark.setStudentEnrollment(enrollment);
        mark.setSubject(subject);
        mark.setTerm(term);
        mark.setMarks(marks);
        mark.setAbsent(isAbsent);
        mark.setStatus(MarkStatus.DRAFT);

        return markRepository.save(mark);
    }

    // ==========================================================
    // GET ALL MARKS BY ENROLLMENT
    // ==========================================================

    public List<Mark> getMarksByEnrollment(
            Long enrollmentId
    ) {

        StudentEnrollment enrollment =
                getEnrollment(enrollmentId);

        return markRepository
                .findByStudentEnrollment(enrollment);
    }

    // ==========================================================
    // GET SUBMITTED MARKS BY ENROLLMENT
    // ==========================================================

    public List<Mark> getSubmittedMarksByEnrollment(
            Long enrollmentId
    ) {

        StudentEnrollment enrollment =
                getEnrollment(enrollmentId);

        return markRepository
                .findByStudentEnrollmentAndStatus(
                        enrollment,
                        MarkStatus.SUBMITTED
                );
    }

    // ==========================================================
    // GET MARKS BY ENROLLMENT AND TERM
    // ==========================================================

    public List<Mark> getMarksByEnrollmentAndTerm(
            Long enrollmentId,
            Term term
    ) {

        StudentEnrollment enrollment =
                getEnrollment(enrollmentId);

        return markRepository
                .findByStudentEnrollmentAndTerm(
                        enrollment,
                        term
                );
    }

    // ==========================================================
    // GET SUBMITTED MARKS BY ENROLLMENT AND TERM
    // ==========================================================

    public List<Mark> getSubmittedMarksByEnrollmentAndTerm(
            Long enrollmentId,
            Term term
    ) {

        StudentEnrollment enrollment =
                getEnrollment(enrollmentId);

        return markRepository
                .findByStudentEnrollmentAndTermAndStatus(
                        enrollment,
                        term,
                        MarkStatus.SUBMITTED
                );
    }

    // ==========================================================
    // GET DRAFT MARKS
    // ==========================================================

    public List<Mark> getDraftMarksByEnrollment(
            Long enrollmentId
    ) {

        StudentEnrollment enrollment =
                getEnrollment(enrollmentId);

        return markRepository
                .findByStudentEnrollmentAndStatus(
                        enrollment,
                        MarkStatus.DRAFT
                );
    }

    // ==========================================================
    // GET ENROLLMENT FOR CONTROLLER
    // ==========================================================

    public StudentEnrollment getEnrollmentForController(
            Long enrollmentId
    ) {

        return getEnrollment(enrollmentId);
    }

    // ==========================================================
    // GET MARK BY ID
    // ==========================================================

    public Mark getMarkById(Long id) {

        return markRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Mark not found."
                        )
                );
    }

    // ==========================================================
    // UPDATE MARK
    // ==========================================================

    @Transactional
    public Mark updateMark(
            Long id,
            Double marks,
            Boolean absent
    ) {

        Mark mark =
                getMarkById(id);

        boolean isAbsent =
                Boolean.TRUE.equals(absent);

        if (isAbsent) {
            marks = 0.0;
        } else {
            validateMarks(marks);
        }

        mark.setMarks(marks);
        mark.setAbsent(isAbsent);

        return markRepository.save(mark);
    }

    // ==========================================================
    // UPDATE TEACHER DRAFT MARK
    // ==========================================================

    @Transactional
    public Mark updateTeacherDraftMark(
            Long id,
            Double marks,
            Boolean absent
    ) {

        Mark mark =
                markRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Mark not found."
                                )
                        );

        if (mark.getStatus() != MarkStatus.DRAFT) {

            throw new RuntimeException(
                    "Only draft marks can be edited."
            );
        }

        validateTeacher();

        boolean isAbsent =
                Boolean.TRUE.equals(absent);

        if (isAbsent) {
            marks = 0.0;
        } else {
            validateMarks(marks);
        }

        mark.setMarks(marks);
        mark.setAbsent(isAbsent);

        return markRepository.save(mark);
    }

    // ==========================================================
    // SUBMIT TEACHER DRAFT MARK
    // ==========================================================

    @Transactional
    public Mark submitTeacherDraftMark(
            Long markId
    ) {

        Mark mark =
                markRepository
                        .findById(markId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Mark not found."
                                )
                        );

        if (mark.getStatus() != MarkStatus.DRAFT) {

            throw new RuntimeException(
                    "Only draft marks can be submitted."
            );
        }

        validateTeacher();

        mark.setStatus(MarkStatus.SUBMITTED);

        return markRepository.save(mark);
    }

    // ==========================================================
    // PUBLISH ALL CLASS MARKS
    // ==========================================================

    @Transactional
    public void publishClassMarks(
            Long classId,
            Term term
    ) {

        validateTeacher();

        List<StudentEnrollment> enrollments =
                enrollmentRepository
                        .findByAcademicClassIdAndActiveTrue(
                                classId
                        );

        if (enrollments.isEmpty()) {

            throw new RuntimeException(
                    "No active students found in this class."
            );
        }

        List<Subject> classSubjects =
                subjectRepository
                        .findByAcademicClassIdAndActiveTrueOrderByDisplayOrderAsc(
                                classId
                        );

        if (classSubjects.isEmpty()) {

            throw new RuntimeException(
                    "No active subjects found for this class."
            );
        }

        // ======================================================
        // SEPARATE SUBJECT CATEGORIES
        // ======================================================

        List<Subject> coreSubjects =
                classSubjects.stream()
                        .filter(subject -> {

                            String category =
                                    String.valueOf(
                                            subject.getCategory()
                                    );

                            return category.equals("CORE") ||
                                   category.equals("PRIMARY");
                        })
                        .toList();

        List<Subject> basket1Subjects =
                classSubjects.stream()
                        .filter(subject ->
                                String.valueOf(
                                        subject.getCategory()
                                ).equals("BASKET_01")
                        )
                        .toList();

        List<Subject> basket2Subjects =
                classSubjects.stream()
                        .filter(subject ->
                                String.valueOf(
                                        subject.getCategory()
                                ).equals("BASKET_02")
                        )
                        .toList();

        List<Subject> basket3Subjects =
                classSubjects.stream()
                        .filter(subject ->
                                String.valueOf(
                                        subject.getCategory()
                                ).equals("BASKET_03")
                        )
                        .toList();

        // ======================================================
        // FIRST: VALIDATE EVERYTHING
        // ======================================================

        for (StudentEnrollment enrollment :
                enrollments) {

            List<Mark> studentMarks =
                    markRepository
                            .findByStudentEnrollmentAndTerm(
                                    enrollment,
                                    term
                            );

            String studentName =
                    enrollment.getStudent().getFirstName()
                            + " "
                            + enrollment.getStudent().getLastName();

            // --------------------------------------------------
            // CORE / PRIMARY SUBJECTS
            // --------------------------------------------------

            for (Subject subject :
                    coreSubjects) {

                boolean hasMark =
                        studentMarks.stream()
                                .anyMatch(mark ->
                                        mark.getSubject()
                                                .getId()
                                                .equals(
                                                        subject.getId()
                                                )
                                        &&
                                        isCompletedMark(mark)
                                );

                if (!hasMark) {

                    throw new RuntimeException(
                            "Marks are missing for "
                                    + studentName
                                    + " - "
                                    + subject.getSubjectName()
                    );
                }
            }

            // --------------------------------------------------
            // BASKET 1
            // --------------------------------------------------

            if (!basket1Subjects.isEmpty()) {

                boolean hasBasket1Mark =
                        basket1Subjects.stream()
                                .anyMatch(subject ->
                                        studentMarks.stream()
                                                .anyMatch(mark ->
                                                        mark.getSubject()
                                                                .getId()
                                                                .equals(
                                                                        subject.getId()
                                                                )
                                                        &&
                                                        isCompletedMark(mark)
                                                )
                                );

                if (!hasBasket1Mark) {

                    throw new RuntimeException(
                            "Basket 1 mark is missing for "
                                    + studentName
                    );
                }
            }

            // --------------------------------------------------
            // BASKET 2
            // --------------------------------------------------

            if (!basket2Subjects.isEmpty()) {

                boolean hasBasket2Mark =
                        basket2Subjects.stream()
                                .anyMatch(subject ->
                                        studentMarks.stream()
                                                .anyMatch(mark ->
                                                        mark.getSubject()
                                                                .getId()
                                                                .equals(
                                                                        subject.getId()
                                                                )
                                                        &&
                                                        isCompletedMark(mark)
                                                )
                                );

                if (!hasBasket2Mark) {

                    throw new RuntimeException(
                            "Basket 2 mark is missing for "
                                    + studentName
                    );
                }
            }

            // --------------------------------------------------
            // BASKET 3
            // --------------------------------------------------

            if (!basket3Subjects.isEmpty()) {

                boolean hasBasket3Mark =
                        basket3Subjects.stream()
                                .anyMatch(subject ->
                                        studentMarks.stream()
                                                .anyMatch(mark ->
                                                        mark.getSubject()
                                                                .getId()
                                                                .equals(
                                                                        subject.getId()
                                                                )
                                                        &&
                                                        isCompletedMark(mark)
                                                )
                                );

                if (!hasBasket3Mark) {

                    throw new RuntimeException(
                            "Basket 3 mark is missing for "
                                    + studentName
                    );
                }
            }
        }

        // ======================================================
        // SECOND: PUBLISH
        // ======================================================

        for (StudentEnrollment enrollment :
                enrollments) {

            List<Mark> studentMarks =
                    markRepository
                            .findByStudentEnrollmentAndTerm(
                                    enrollment,
                                    term
                            );

            for (Mark mark :
                    studentMarks) {

                /*
                 * If a mark is marked absent, make sure its
                 * numerical value is always 0.
                 */
                if (mark.isAbsent()) {
                    mark.setMarks(0.0);
                }

                if (mark.getStatus() ==
                        MarkStatus.DRAFT) {

                    mark.setStatus(
                            MarkStatus.SUBMITTED
                    );
                }
            }

            markRepository.saveAll(
                    studentMarks
            );
        }
    }

    // ==========================================================
    // TERM RESULT
    // ==========================================================

    public MarkCalculationResult calculateTermResult(
            Long enrollmentId,
            Term term
    ) {

        StudentEnrollment enrollment =
                getEnrollment(enrollmentId);

        List<Mark> marks =
                markRepository
                        .findByStudentEnrollmentAndTermAndStatus(
                                enrollment,
                                term,
                                MarkStatus.SUBMITTED
                        );

        double total = 0;

        for (Mark mark :
                marks) {

            /*
             * AB is stored as 0, so it naturally contributes
             * zero to the total.
             */
            total += getCalculationValue(mark);
        }

        double average =
                marks.isEmpty()
                        ? 0
                        : total / marks.size();

        return new MarkCalculationResult(
                total,
                average,
                marks.size()
        );
    }

    // ==========================================================
    // CLASS RANKING
    // ==========================================================

    public List<MarkRankingResult> calculateClassRanking(
            Long classId,
            Term term
    ) {

        List<StudentEnrollment> enrollments =
                enrollmentRepository
                        .findByAcademicClassIdAndActiveTrue(
                                classId
                        );

        List<MarkRankingResult> results =
                new ArrayList<>();

        for (StudentEnrollment enrollment :
                enrollments) {

            List<Mark> marks =
                    markRepository
                            .findByStudentEnrollmentAndTermAndStatus(
                                    enrollment,
                                    term,
                                    MarkStatus.SUBMITTED
                            );

            if (marks.isEmpty()) {
                continue;
            }

            double total = 0;

            for (Mark mark :
                    marks) {

                total += getCalculationValue(mark);
            }

            double average =
                    total / marks.size();

            Student student =
                    enrollment.getStudent();

            results.add(
                    new MarkRankingResult(
                            enrollment.getId(),
                            student.getStudentNumber(),
                            student.getFirstName()
                                    + " "
                                    + student.getLastName(),
                            total,
                            average,
                            marks.size()
                    )
            );
        }

        results.sort(
                Comparator.comparingDouble(
                        MarkRankingResult::average
                ).reversed()
        );

        return results;
    }

    // ==========================================================
    // YEARLY RESULT
    // ==========================================================

    public MarkYearlyResult calculateYearlyResult(
            Long enrollmentId
    ) {

        getEnrollment(enrollmentId);

        Map<Term, MarkCalculationResult> termResults =
                new HashMap<>();

        for (Term term :
                Term.values()) {

            MarkCalculationResult result =
                    calculateTermResult(
                            enrollmentId,
                            term
                    );

            if (result.participatedSubjects() > 0) {

                termResults.put(
                        term,
                        result
                );
            }
        }

        double yearlyAverage = 0;

        if (!termResults.isEmpty()) {

            double totalAverage = 0;

            for (MarkCalculationResult result :
                    termResults.values()) {

                totalAverage += result.average();
            }

            yearlyAverage =
                    totalAverage / termResults.size();
        }

        return new MarkYearlyResult(
                enrollmentId,
                termResults,
                yearlyAverage
        );
    }

    // ==========================================================
    // YEARLY RANKING
    // ==========================================================

    public List<MarkYearlyRankingResult>
    calculateYearlyRanking(
            Long classId
    ) {

        List<StudentEnrollment> enrollments =
                enrollmentRepository
                        .findByAcademicClassIdAndActiveTrue(
                                classId
                        );

        List<MarkYearlyRankingResult> results =
                new ArrayList<>();

        for (StudentEnrollment enrollment :
                enrollments) {

            MarkYearlyResult yearlyResult =
                    calculateYearlyResult(
                            enrollment.getId()
                    );

            if (yearlyResult.yearlyAverage() <= 0) {
                continue;
            }

            Student student =
                    enrollment.getStudent();

            results.add(
                    new MarkYearlyRankingResult(
                            enrollment.getId(),
                            student.getStudentNumber(),
                            student.getFirstName()
                                    + " "
                                    + student.getLastName(),
                            yearlyResult.yearlyAverage()
                    )
            );
        }

        results.sort(
                Comparator.comparingDouble(
                        MarkYearlyRankingResult::yearlyAverage
                ).reversed()
        );

        return results;
    }

    // ==========================================================
    // STUDENT ACCESS CHECK
    // ==========================================================

    public void checkStudentAccess(
            StudentEnrollment enrollment
    ) {

        String username =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        String studentUsername =
                enrollment
                        .getStudent()
                        .getUser()
                        .getUsername();

        if (!username.equals(studentUsername)) {

            throw new RuntimeException(
                    "You do not have access to this student's marks."
            );
        }
    }

    // ==========================================================
    // VALIDATE TEACHER
    // ==========================================================

    private Teacher validateTeacher() {

        var authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                authentication.getName() == null) {

            throw new RuntimeException(
                    "Teacher is not authenticated."
            );
        }

        String username =
                authentication.getName();

        Teacher teacher =
                teacherRepository
                        .findByUserUsername(username)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Teacher profile not found."
                                )
                        );

        if (!teacher.isActive()) {

            throw new RuntimeException(
                    "Teacher account is inactive."
            );
        }

        return teacher;
    }

    // ==========================================================
    // VALIDATE MARKS
    // ==========================================================

    private void validateMarks(Double marks) {

        if (marks == null) {

            throw new RuntimeException(
                    "Marks are required."
            );
        }

        if (marks < 0 || marks > 100) {

            throw new RuntimeException(
                    "Marks must be between 0 and 100."
            );
        }
    }

    // ==========================================================
    // CHECK WHETHER MARK IS COMPLETE
    // ==========================================================

    private boolean isCompletedMark(Mark mark) {

        /*
         * A normal mark is complete when it has a numerical value.
         *
         * An absent mark is also complete, even though its
         * numerical value is 0.
         */
        return mark.isAbsent()
                || mark.getMarks() != null;
    }

    // ==========================================================
    // GET CALCULATION VALUE
    // ==========================================================

    private double getCalculationValue(Mark mark) {

        /*
         * AB always contributes 0.
         */
        if (mark.isAbsent()) {
            return 0.0;
        }

        return mark.getMarks() == null
                ? 0.0
                : mark.getMarks();
    }

    // ==========================================================
    // VALIDATE ENROLLMENT + SUBJECT
    // ==========================================================

    private void validateEnrollmentAndSubject(
            StudentEnrollment enrollment,
            Subject subject
    ) {

        if (!enrollment.isActive()) {

            throw new RuntimeException(
                    "Student enrollment is inactive."
            );
        }

        if (!enrollment
                .getStudent()
                .isActive()) {

            throw new RuntimeException(
                    "Student is inactive."
            );
        }

        if (!subject.isActive()) {

            throw new RuntimeException(
                    "Subject is inactive."
            );
        }

        Long enrollmentClassId =
                enrollment
                        .getAcademicClass()
                        .getId();

        Long subjectClassId =
                subject
                        .getAcademicClass()
                        .getId();

        if (!enrollmentClassId.equals(subjectClassId)) {

            throw new RuntimeException(
                    "Subject does not belong to the student's class."
            );
        }
    }

    // ==========================================================
    // GET ENROLLMENT
    // ==========================================================

    private StudentEnrollment getEnrollment(
            Long enrollmentId
    ) {

        return enrollmentRepository
                .findById(enrollmentId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Student enrollment not found."
                        )
                );
    }

    // ==========================================================
    // RESULT RECORDS
    // ==========================================================

    public record MarkCalculationResult(
            double total,
            double average,
            int participatedSubjects
    ) {
    }

    public record MarkRankingResult(
            Long enrollmentId,
            String studentNumber,
            String studentName,
            double total,
            double average,
            int participatedSubjects
    ) {
    }

    public record MarkYearlyResult(
            Long enrollmentId,
            Map<Term, MarkCalculationResult> termResults,
            double yearlyAverage
    ) {
    }

    public record MarkYearlyRankingResult(
            Long enrollmentId,
            String studentNumber,
            String studentName,
            double yearlyAverage
    ) {
    }
}