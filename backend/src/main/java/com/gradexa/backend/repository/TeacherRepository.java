package com.gradexa.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gradexa.backend.entity.Teacher;
import com.gradexa.backend.entity.User;

public interface TeacherRepository
        extends JpaRepository<Teacher, Long> {

    Optional<Teacher> findByUser(User user);

    Optional<Teacher> findByTeacherNumber(String teacherNumber);

    boolean existsByUser(User user);

    boolean existsByTeacherNumber(String teacherNumber);
}