package com.gradexa.backend.dto;

import com.gradexa.backend.entity.RegistrationStatus;
import com.gradexa.backend.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String username;
    private Role role;
    private boolean active;
    private RegistrationStatus registrationStatus;
    private LocalDateTime createdAt;
}