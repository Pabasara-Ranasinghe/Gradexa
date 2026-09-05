package com.gradexa.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gradexa.backend.entity.Mark;
import com.gradexa.backend.entity.MarkStatus;
import com.gradexa.backend.entity.StudentEnrollment;
import com.gradexa.backend.entity.Term;

public interface MarkRepository
        extends JpaRepository<Mark, Long> {

    List<Mark> findByStudentEnrollment(
            StudentEnrollment studentEnrollment
    );

    List<Mark> findByStudentEnrollmentAndTerm(
            StudentEnrollment studentEnrollment,
            Term term
    );

    List<Mark> findBySubjectIdAndTerm(
            Long subjectId,
            Term term
    );

    Optional<Mark> findByStudentEnrollmentAndSubjectIdAndTerm(
            StudentEnrollment studentEnrollment,
            Long subjectId,
            Term term
    );

    boolean existsByStudentEnrollmentAndSubjectIdAndTerm(
            StudentEnrollment studentEnrollment,
            Long subjectId,
            Term term
    );

    // ============================================================
    // SUBMITTED MARKS
    // ============================================================

    List<Mark> findByStudentEnrollmentAndStatus(
            StudentEnrollment studentEnrollment,
            MarkStatus status
    );

    List<Mark> findByStudentEnrollmentAndTermAndStatus(
            StudentEnrollment studentEnrollment,
            Term term,
            MarkStatus status
    );

    List<Mark> findBySubjectIdAndTermAndStatus(
            Long subjectId,
            Term term,
            MarkStatus status
    );

    // ============================================================
    // DRAFT MARKS
    // ============================================================

    List<Mark> findByStudentEnrollmentAndStatusOrderByIdAsc(
            StudentEnrollment studentEnrollment,
            MarkStatus status
    );
}