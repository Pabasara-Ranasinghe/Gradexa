package com.gradexa.backend.repository;

import com.gradexa.backend.entity.Student;
import com.gradexa.backend.entity.StudentEnrollment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentEnrollmentRepository
        extends JpaRepository<StudentEnrollment, Long> {

    List<StudentEnrollment> findByStudent(Student student);

    List<StudentEnrollment> findByAcademicYear(
            Integer academicYear
    );

    List<StudentEnrollment> findByAcademicYearAndActiveTrue(
            Integer academicYear
    );

    List<StudentEnrollment> findByAcademicClassId(
            Long classId
    );

    List<StudentEnrollment> findByAcademicClassIdAndActiveTrue(
            Long classId
    );

    Optional<StudentEnrollment> findByStudentAndAcademicYear(
            Student student,
            Integer academicYear
    );

    Optional<StudentEnrollment> findByStudentAndActiveTrue(
            Student student
    );

    boolean existsByStudentAndAcademicYear(
            Student student,
            Integer academicYear
    );
}