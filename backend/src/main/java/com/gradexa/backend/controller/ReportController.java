package com.gradexa.backend.controller;

import com.gradexa.backend.dto.ReportResponse;
import com.gradexa.backend.service.ReportService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(
            ReportService reportService
    ) {
        this.reportService = reportService;
    }

    // ===============================
    // GET REPORT SUMMARY
    // ADMIN ONLY
    // ===============================

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/summary")
    public ResponseEntity<ReportResponse> getReportSummary() {

        ReportResponse response =
                reportService.getReportSummary();

        return ResponseEntity.ok(response);
    }
}