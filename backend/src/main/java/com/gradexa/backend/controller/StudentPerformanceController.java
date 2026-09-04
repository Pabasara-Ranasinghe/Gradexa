package com.gradexa.backend.controller;

import com.gradexa.backend.dto.StudentPerformanceResponse;
import com.gradexa.backend.service.StudentPerformanceService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}