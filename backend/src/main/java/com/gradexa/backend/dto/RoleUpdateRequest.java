package com.gradexa.backend.dto;

import com.gradexa.backend.entity.Role;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RoleUpdateRequest {

    private Role role;
}