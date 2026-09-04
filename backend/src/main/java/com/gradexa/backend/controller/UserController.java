package com.gradexa.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gradexa.backend.dto.RoleUpdateRequest;
import com.gradexa.backend.dto.UserResponse;
import com.gradexa.backend.entity.RegistrationStatus;
import com.gradexa.backend.entity.User;
import com.gradexa.backend.exception.ResourceNotFoundException;
import com.gradexa.backend.repository.UserRepository;

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

        User user =
                userRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User not found"
                                )
                        );

        return ResponseEntity.ok(
                toResponse(user)
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

        User user =
                userRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User not found"
                                )
                        );

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
    }

    // ===============================
    // APPROVE USER
    // ADMIN ONLY
    // ===============================

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveUser(
            @PathVariable Long id
    ) {

        User user =
                userRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User not found"
                                )
                        );

        if (user.getRegistrationStatus()
                == RegistrationStatus.APPROVED) {

            return ResponseEntity
                    .badRequest()
                    .body("User is already approved");
        }

        user.setRegistrationStatus(
                RegistrationStatus.APPROVED
        );

        user.setActive(true);

        userRepository.save(user);

        return ResponseEntity.ok(
                "User approved successfully"
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