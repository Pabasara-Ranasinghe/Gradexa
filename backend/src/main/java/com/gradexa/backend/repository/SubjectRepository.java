package com.gradexa.backend.repository;

import com.gradexa.backend.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubjectRepository
        extends JpaRepository<Subject, Long> {

    List<Subject> findByAcademicClassId(
            Long academicClassId
    );

    List<Subject> findByAcademicClassIdAndActiveTrue(
            Long academicClassId
    );

    boolean existsByAcademicClassIdAndSubjectName(
            Long academicClassId,
            String subjectName
    );

    long countByAcademicClassIdAndActiveTrue(
            Long academicClassId
    );
}