package com.gradexa.backend.service;

import org.springframework.stereotype.Service;

import com.gradexa.backend.dto.ReportResponse;
import com.gradexa.backend.entity.RegistrationStatus;
import com.gradexa.backend.entity.Role;
import com.gradexa.backend.repository.UserRepository;

@Service
public class ReportService {

    private final UserRepository userRepository;

    public ReportService(
            UserRepository userRepository
    ) {
        this.userRepository = userRepository;
    }

    // ===============================
    // GET REPORT SUMMARY
    // ===============================

    public ReportResponse getReportSummary() {

        long totalUsers =
                userRepository.count();

        long students =
                userRepository.countByRole(
                        Role.STUDENT
                );

        long teachers =
                userRepository.countByRole(
                        Role.TEACHER
                );

        long admins =
                userRepository.countByRole(
                        Role.ADMIN
                );

        long sectionHeads =
                userRepository.countByRole(
                        Role.SECTION_HEAD
                );

        long vicePrincipals =
                userRepository.countByRole(
                        Role.VICE_PRINCIPAL
                );

        long principals =
                userRepository.countByRole(
                        Role.PRINCIPAL
                );

        long activeUsers =
                userRepository.countByActiveTrue();

        long inactiveUsers =
                userRepository.countByActiveFalse();

        long pendingRegistrations =
                userRepository.countByRegistrationStatus(
                        RegistrationStatus.PENDING
                );

        long approvedUsers =
                userRepository.countByRegistrationStatus(
                        RegistrationStatus.APPROVED
                );

        return new ReportResponse(
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
    }
}