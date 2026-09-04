package com.gradexa.backend.dto;

import java.time.LocalDate;

import com.gradexa.backend.entity.Role;
import com.gradexa.backend.entity.SchoolSection;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {

    private String username;

    private String password;

    private Role role;

    // Common details
    private String firstName;

    private String lastName;

    // Student details
    private String studentId;

    private LocalDate dateOfBirth;

    private SchoolSection section;

    private Integer grade;

    // Teacher details
    private String teacherId;

    private String subject;
}