package com.gradexa.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gradexa.backend.dto.StudentPerformanceResponse;
import com.gradexa.backend.service.StudentPerformanceService;

@RestController
@RequestMapping("/api/reports")
public class StudentPerformanceController {

    private final StudentPerformanceService
            studentPerformanceService;

    public StudentPerformanceController(
            StudentPerformanceService studentPerformanceService
    ) {
        this.studentPerformanceService =
                studentPerformanceService;
    }

    // ==========================================================
    // CLASS PERFORMANCE
    // ==========================================================

    @PreAuthorize(
            "hasAnyRole('ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'SECTION_HEAD')"
    )
    @GetMapping("/class/{classId}/performance")
    public ResponseEntity<List<StudentPerformanceResponse>>
    getClassPerformance(
            @PathVariable Long classId
    ) {

        List<StudentPerformanceResponse> response =
                studentPerformanceService
                        .getClassPerformance(classId);

        return ResponseEntity.ok(response);
    }

    // ==========================================================
    // CURRENT STUDENT PERFORMANCE
    // ==========================================================

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/me/performance")
    public ResponseEntity<StudentPerformanceResponse>
    getCurrentStudentPerformance() {

        StudentPerformanceResponse response =
                studentPerformanceService
                        .getCurrentStudentPerformance();

        return ResponseEntity.ok(response);
    }
}