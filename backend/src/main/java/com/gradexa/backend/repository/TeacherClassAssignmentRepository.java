package com.gradexa.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gradexa.backend.entity.Teacher;
import com.gradexa.backend.entity.TeacherClassAssignment;

public interface TeacherClassAssignmentRepository
        extends JpaRepository<TeacherClassAssignment, Long> {

    List<TeacherClassAssignment> findByTeacher(
            Teacher teacher
    );

    List<TeacherClassAssignment> findByTeacherAndActiveTrue(
            Teacher teacher
    );

    List<TeacherClassAssignment> findByAcademicClassId(
            Long academicClassId
    );

    List<TeacherClassAssignment> findByAcademicClassIdAndActiveTrue(
            Long academicClassId
    );

    List<TeacherClassAssignment> findByTeacherIdAndActiveTrue(
            Long teacherId
    );

    boolean existsByTeacherIdAndAcademicClassIdAndSubjectId(
            Long teacherId,
            Long academicClassId,
            Long subjectId
    );
}