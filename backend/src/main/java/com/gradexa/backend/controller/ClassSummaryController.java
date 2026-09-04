package com.gradexa.backend.controller;

import com.gradexa.backend.dto.ClassSummaryResponse;
import com.gradexa.backend.service.ClassSummaryService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
public class ClassSummaryController {

    private final ClassSummaryService classSummaryService;

    public ClassSummaryController(
            ClassSummaryService classSummaryService
    ) {
        this.classSummaryService =
                classSummaryService;
    }

    @PreAuthorize(
            "hasAnyRole('ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'SECTION_HEAD')"
    )
    @GetMapping("/class/{classId}/summary")
    public ResponseEntity<ClassSummaryResponse> getClassSummary(
            @PathVariable Long classId
    ) {

        ClassSummaryResponse response =
                classSummaryService.getClassSummary(
                        classId
                );

        return ResponseEntity.ok(response);
    }
}