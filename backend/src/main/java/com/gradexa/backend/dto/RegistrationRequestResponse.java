package com.gradexa.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.gradexa.backend.entity.RegistrationStatus;
import com.gradexa.backend.entity.Role;
import com.gradexa.backend.entity.SchoolSection;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RegistrationRequestResponse {

    private Long id;

    private String username;

    private Role role;

    private boolean active;

    private RegistrationStatus registrationStatus;

    private String firstName;

    private String lastName;

    // Student details
    private String studentId;

    private LocalDate dateOfBirth;

    private SchoolSection requestedSection;

    private Integer requestedGrade;

    // Teacher details
    private String teacherId;

    private SchoolSection teacherSection;

    private String subject;

    private LocalDateTime createdAt;
}