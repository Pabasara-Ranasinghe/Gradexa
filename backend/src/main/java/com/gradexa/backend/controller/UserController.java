package com.gradexa.backend.controller;

import com.gradexa.backend.dto.RoleUpdateRequest;
import com.gradexa.backend.dto.UserResponse;
import com.gradexa.backend.entity.User;
import com.gradexa.backend.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
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
    // GET USER BY ID
    // ADMIN ONLY
    // ===============================

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(
            @PathVariable Long id
    ) {

        return userRepository.findById(id)
                .map(user -> ResponseEntity.ok(
                        toResponse(user)
                ))
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    // ===============================
    // UPDATE USER ROLE
    // ADMIN ONLY
    // ===============================

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable Long id,
            @RequestBody RoleUpdateRequest request
    ) {

        return userRepository.findById(id)
                .map(user -> {

                    if (request.getRole() == null) {

                        return ResponseEntity
                                .badRequest()
                                .body("Role is required");
                    }

                    user.setRole(request.getRole());

                    userRepository.save(user);

                    return ResponseEntity.ok(
                            "User role updated successfully"
                    );
                })
                .orElseGet(() ->
                        ResponseEntity
                                .notFound()
                                .build()
                );
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