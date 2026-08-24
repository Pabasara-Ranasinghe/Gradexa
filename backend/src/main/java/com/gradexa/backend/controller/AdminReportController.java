package com.gradexa.backend.controller;

import com.gradexa.backend.dto.ReportResponse;
import com.gradexa.backend.entity.RegistrationStatus;
import com.gradexa.backend.entity.Role;
import com.gradexa.backend.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/reports")
public class AdminReportController {

    private final UserRepository userRepository;

    public AdminReportController(
            UserRepository userRepository
    ) {
        this.userRepository = userRepository;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ReportResponse> getAdminReport() {

        long totalUsers =
                userRepository.count();

        long students =
                userRepository
                        .findAll()
                        .stream()
                        .filter(user ->
                                user.getRole() == Role.STUDENT)
                        .count();

        long teachers =
                userRepository
                        .findAll()
                        .stream()
                        .filter(user ->
                                user.getRole() == Role.TEACHER)
                        .count();

        long admins =
                userRepository
                        .findAll()
                        .stream()
                        .filter(user ->
                                user.getRole() == Role.ADMIN)
                        .count();

        long sectionHeads =
                userRepository
                        .findAll()
                        .stream()
                        .filter(user ->
                                user.getRole() == Role.SECTION_HEAD)
                        .count();

        long vicePrincipals =
                userRepository
                        .findAll()
                        .stream()
                        .filter(user ->
                                user.getRole() == Role.VICE_PRINCIPAL)
                        .count();

        long principals =
                userRepository
                        .findAll()
                        .stream()
                        .filter(user ->
                                user.getRole() == Role.PRINCIPAL)
                        .count();

        long activeUsers =
                userRepository
                        .findAll()
                        .stream()
                        .filter(user -> user.isActive())
                        .count();

        long inactiveUsers =
                userRepository
                        .findAll()
                        .stream()
                        .filter(user -> !user.isActive())
                        .count();

        long pendingRegistrations =
                userRepository
                        .findByRegistrationStatus(
                                RegistrationStatus.PENDING)
                        .size();

        long approvedUsers =
                userRepository
                        .findByRegistrationStatus(
                                RegistrationStatus.APPROVED)
                        .size();

        ReportResponse response =
                new ReportResponse(
                        totalUsers,
                        students,
                        teachers,
                        admins,
                        sectionHeads,
                        vicePrincipals,
                        principals,
                        activeUsers,
                        inactiveUsers,
                        pendingRegistrations,
                        approvedUsers
                );

        return ResponseEntity.ok(response);
    }
}