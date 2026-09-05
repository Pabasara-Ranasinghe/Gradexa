package com.gradexa.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gradexa.backend.entity.Teacher;
import com.gradexa.backend.service.TeacherService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/teachers")
@RequiredArgsConstructor
public class TeacherController {

    private final TeacherService teacherService;

    @GetMapping("/me")
    public ResponseEntity<Teacher> getMyProfile(
            Authentication authentication
    ) {

        String username =
                authentication.getName();

        Teacher teacher =
                teacherService.getTeacherByUsername(
                        username
                );

        return ResponseEntity.ok(teacher);
    }
}