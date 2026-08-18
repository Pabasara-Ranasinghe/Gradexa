package com.gradexa.backend.dto;

import com.gradexa.backend.entity.Role;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {

    private String username;
    private String password;
    private Role role;
}