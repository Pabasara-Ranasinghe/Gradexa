package com.gradexa.backend.repository;

import com.gradexa.backend.entity.Student;
import com.gradexa.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudentRepository
        extends JpaRepository<Student, Long> {

    Optional<Student> findByUser(User user);

    Optional<Student> findByStudentNumber(String studentNumber);

    boolean existsByUser(User user);

    boolean existsByStudentNumber(String studentNumber);
}