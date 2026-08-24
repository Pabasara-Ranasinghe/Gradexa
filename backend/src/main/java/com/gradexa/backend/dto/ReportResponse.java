package com.gradexa.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ReportResponse {

    private long totalUsers;

    private long students;

    private long teachers;

    private long admins;

    private long sectionHeads;

    private long vicePrincipals;

    private long principals;

    private long activeUsers;

    private long inactiveUsers;

    private long pendingRegistrations;

    private long approvedUsers;
}