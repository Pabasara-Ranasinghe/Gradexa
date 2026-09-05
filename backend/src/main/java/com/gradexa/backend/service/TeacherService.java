package com.gradexa.backend.service;

import org.springframework.stereotype.Service;

import com.gradexa.backend.entity.Teacher;
import com.gradexa.backend.repository.TeacherRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TeacherService {

    private final TeacherRepository teacherRepository;

    public Teacher getTeacherByUsername(String username) {

        return teacherRepository
                .findByUserUsername(username)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Teacher profile not found."
                        )
                );
    }
}