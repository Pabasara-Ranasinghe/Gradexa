package com.gradexa.backend.controller;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gradexa.backend.entity.StudentEnrollment;
import com.gradexa.backend.exception.ResourceNotFoundException;
import com.gradexa.backend.repository.StudentEnrollmentRepository;
import com.gradexa.backend.service.MarkService;
import com.gradexa.backend.service.MarksheetService;

@RestController
@RequestMapping("/api/marksheets")
public class MarksheetController {

    private final MarksheetService marksheetService;
    private final StudentEnrollmentRepository enrollmentRepository;
    private final MarkService markService;

    public MarksheetController(
            MarksheetService marksheetService,
            StudentEnrollmentRepository enrollmentRepository,
            MarkService markService
    ) {
        this.marksheetService = marksheetService;
        this.enrollmentRepository = enrollmentRepository;
        this.markService = markService;
    }

    @PreAuthorize(
            "hasAnyRole('ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'SECTION_HEAD', 'TEACHER', 'STUDENT')"
    )
    @GetMapping(
            value = "/enrollment/{enrollmentId}/pdf",
            produces = MediaType.APPLICATION_PDF_VALUE
    )
    public ResponseEntity<byte[]> generateMarksheet(
            @PathVariable Long enrollmentId
    ) {

        StudentEnrollment enrollment =
                enrollmentRepository.findById(
                        enrollmentId
                ).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Student enrollment not found"
                        )
                );

        checkAccess(enrollment);

        byte[] pdf =
                marksheetService.generateMarksheet(
                        enrollmentId
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
                                "marksheet_"
                                        + enrollment
                                        .getStudent()
                                        .getStudentNumber()
                                        + ".pdf"
                        )
                        .build()
        );

        return ResponseEntity
                .ok()
                .headers(headers)
                .body(pdf);
    }

    private void checkAccess(
            StudentEnrollment enrollment
    ) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null) {
            throw new RuntimeException(
                    "User is not authenticated"
            );
        }

        boolean isStudent =
                authentication
                        .getAuthorities()
                        .stream()
                        .anyMatch(authority ->
                                authority
                                        .getAuthority()
                                        .equals(
                                                "ROLE_STUDENT"
                                        )
                        );

        if (isStudent) {
            markService.checkStudentAccess(enrollment);
        }
    }
}