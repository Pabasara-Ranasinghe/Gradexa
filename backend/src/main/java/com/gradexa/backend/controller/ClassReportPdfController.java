package com.gradexa.backend.controller;

import com.gradexa.backend.service.ClassReportPdfService;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
public class ClassReportPdfController {

    private final ClassReportPdfService classReportPdfService;

    public ClassReportPdfController(
            ClassReportPdfService classReportPdfService
    ) {
        this.classReportPdfService =
                classReportPdfService;
    }

    @PreAuthorize(
            "hasAnyRole('ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'SECTION_HEAD')"
    )
    @GetMapping(
            value = "/class/{classId}/pdf",
            produces = MediaType.APPLICATION_PDF_VALUE
    )
    public ResponseEntity<byte[]> generateClassReport(
            @PathVariable Long classId
    ) {

        byte[] pdf =
                classReportPdfService.generateClassReport(
                        classId
                );

        HttpHeaders headers =
                new HttpHeaders();

        headers.setContentType(
                MediaType.APPLICATION_PDF
        );

        headers.setContentDisposition(
                ContentDisposition
                        .attachment()
                        .filename(
                                "class_report_"
                                        + classId
                                        + ".pdf"
                        )
                        .build()
        );

        return ResponseEntity
                .ok()
                .headers(headers)
                .body(pdf);
    }
}