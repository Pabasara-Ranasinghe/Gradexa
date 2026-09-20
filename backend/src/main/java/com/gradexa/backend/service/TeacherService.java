package com.gradexa.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.gradexa.backend.entity.Teacher;
import com.gradexa.backend.repository.TeacherRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TeacherService {

    private final TeacherRepository teacherRepository;

    /*
     * Get the teacher profile of the currently
     * logged-in teacher.
     */
    public Teacher getTeacherByUsername(String username) {

        return teacherRepository
                .findByUserUsername(username)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Teacher profile not found."
                        )
                );
    }

    /*
     * ADMIN:
     * Get all teachers.
     *
     * This will be used by the Admin Teacher
     * Assignment page.
     */
    public List<Teacher> getAllTeachers() {

        return teacherRepository.findAll();
    }
}