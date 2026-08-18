package com.gradexa.backend.controller;

import com.gradexa.backend.dto.UserResponse;
import com.gradexa.backend.entity.RegistrationStatus;
import com.gradexa.backend.entity.User;
import com.gradexa.backend.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/registrations")
public class AdminRegistrationController {

    private final UserRepository userRepository;

    public AdminRegistrationController(
            UserRepository userRepository
    ) {
        this.userRepository = userRepository;
    }

    // ===============================
    // GET PENDING REGISTRATION REQUESTS
    // ADMIN ONLY
    // ===============================

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/pending")
    public ResponseEntity<List<UserResponse>> getPendingRegistrations() {

        List<UserResponse> pendingUsers =
                userRepository
                        .findByRegistrationStatus(
                                RegistrationStatus.PENDING
                        )
                        .stream()
                        .map(this::toResponse)
                        .toList();

        return ResponseEntity.ok(pendingUsers);
    }

    // ===============================
    // APPROVE REGISTRATION
    // ADMIN ONLY
    // ===============================

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveRegistration(
            @PathVariable Long id
    ) {

        return userRepository.findById(id)
                .map(user -> {

                    if (user.getRegistrationStatus()
                            != RegistrationStatus.PENDING) {

                        return ResponseEntity
                                .badRequest()
                                .body(
                                        "Registration is not pending"
                                );
                    }

                    user.setRegistrationStatus(
                            RegistrationStatus.APPROVED
                    );

                    user.setActive(true);

                    userRepository.save(user);

                    return ResponseEntity.ok(
                            "Registration approved successfully"
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