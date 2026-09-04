package com.gradexa.backend.controller;

import com.gradexa.backend.dto.ClassRankingResponse;
import com.gradexa.backend.service.ClassRankingService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ClassRankingController {

    private final ClassRankingService classRankingService;

    public ClassRankingController(
            ClassRankingService classRankingService
    ) {
        this.classRankingService =
                classRankingService;
    }

    @PreAuthorize(
            "hasAnyRole('ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'SECTION_HEAD')"
    )
    @GetMapping("/class/{classId}/ranking")
    public ResponseEntity<List<ClassRankingResponse>> getClassRanking(
            @PathVariable Long classId
    ) {

        List<ClassRankingResponse> response =
                classRankingService.getClassRanking(
                        classId
                );

        return ResponseEntity.ok(response);
    }
}