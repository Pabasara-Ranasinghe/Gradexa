package com.gradexa.backend.repository;

import com.gradexa.backend.entity.Mark;
import com.gradexa.backend.entity.StudentEnrollment;
import com.gradexa.backend.entity.Term;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

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
}