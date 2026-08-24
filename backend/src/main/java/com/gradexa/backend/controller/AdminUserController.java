package com.gradexa.backend.controller;

import com.gradexa.backend.dto.UserResponse;
import com.gradexa.backend.entity.User;
import com.gradexa.backend.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final UserRepository userRepository;

    public AdminUserController(
            UserRepository userRepository
    ) {
        this.userRepository = userRepository;
    }

    // ===============================
    // GET ALL USERS
    // ADMIN ONLY
    // ===============================

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {

        List<UserResponse> users =
                userRepository.findAll()
                        .stream()
                        .map(this::toResponse)
                        .toList();

        return ResponseEntity.ok(users);
    }

    // ===============================
    // CONVERT USER TO RESPONSE
    // ===============================

    private UserResponse toResponse(User user) {

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getRole(),
                user.isActive(),
                user.getRegistrationStatus(),
                user.getCreatedAt()
        );
    }
}