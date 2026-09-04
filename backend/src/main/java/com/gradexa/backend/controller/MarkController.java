package com.gradexa.backend.controller;

import com.gradexa.backend.dto.MarkCalculationResponse;
import com.gradexa.backend.dto.MarkRankingResponse;
import com.gradexa.backend.dto.MarkYearlyRankingResponse;
import com.gradexa.backend.dto.MarkYearlyResultResponse;
import com.gradexa.backend.entity.Mark;
import com.gradexa.backend.entity.StudentEnrollment;
import com.gradexa.backend.entity.Term;
import com.gradexa.backend.repository.StudentEnrollmentRepository;
import com.gradexa.backend.service.MarkService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marks")
public class MarkController {

    private final MarkService markService;
    private final StudentEnrollmentRepository enrollmentRepository;

    public MarkController(
            MarkService markService,
            StudentEnrollmentRepository enrollmentRepository
    ) {
        this.markService = markService;
        this.enrollmentRepository = enrollmentRepository;
    }

    // ============================================================
    // ADD MARK
    // ============================================================

    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    @PostMapping
    public ResponseEntity<Mark> addMark(
            @RequestParam Long enrollmentId,
            @RequestParam Long subjectId,
            @RequestParam Term term,
            @RequestParam Double marks
    ) {

        Mark mark = markService.addMark(
                enrollmentId,
                subjectId,
                term,
                marks
        );

        return ResponseEntity.ok(mark);
    }

    // ============================================================
    // GET ALL MARKS FOR ENROLLMENT
    // ============================================================

    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT')")
    @GetMapping("/enrollment/{enrollmentId}")
    public ResponseEntity<List<Mark>> getMarksByEnrollment(
            @PathVariable Long enrollmentId
    ) {

        StudentEnrollment enrollment =
                enrollmentRepository.findById(enrollmentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Student enrollment not found"
                                )
                        );

        checkStudentAccessIfNeeded(enrollment);

        return ResponseEntity.ok(
                markService.getMarksByEnrollment(
                        enrollmentId
                )
        );
    }

    // ============================================================
    // GET MARKS BY TERM
    // ============================================================

    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT')")
    @GetMapping("/enrollment/{enrollmentId}/term/{term}")
    public ResponseEntity<List<Mark>> getMarksByEnrollmentAndTerm(
            @PathVariable Long enrollmentId,
            @PathVariable Term term
    ) {

        StudentEnrollment enrollment =
                enrollmentRepository.findById(enrollmentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Student enrollment not found"
                                )
                        );

        checkStudentAccessIfNeeded(enrollment);

        return ResponseEntity.ok(
                markService.getMarksByEnrollmentAndTerm(
                        enrollmentId,
                        term
                )
        );
    }

    // ============================================================
    // GET SINGLE MARK
    // ============================================================

    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT')")
    @GetMapping("/{id}")
    public ResponseEntity<Mark> getMark(
            @PathVariable Long id
    ) {

        Mark mark =
                markService.getMarkById(id);

        checkStudentAccessIfNeeded(
                mark.getStudentEnrollment()
        );

        return ResponseEntity.ok(mark);
    }

    // ============================================================
    // UPDATE MARK
    // ============================================================

    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    @PutMapping("/{id}")
    public ResponseEntity<Mark> updateMark(
            @PathVariable Long id,
            @RequestParam Double marks
    ) {

        return ResponseEntity.ok(
                markService.updateMark(
                        id,
                        marks
                )
        );
    }

    // ============================================================
    // TERM RESULTS
    // ============================================================

    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT')")
    @GetMapping("/enrollment/{enrollmentId}/term/{term}/results")
    public ResponseEntity<MarkCalculationResponse> calculateTermResults(
            @PathVariable Long enrollmentId,
            @PathVariable Term term
    ) {

        StudentEnrollment enrollment =
                enrollmentRepository.findById(enrollmentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Student enrollment not found"
                                )
                        );

        checkStudentAccessIfNeeded(enrollment);

        return ResponseEntity.ok(
                markService.calculateTermResults(
                        enrollmentId,
                        term
                )
        );
    }

    // ============================================================
    // TERM RANKING
    // ============================================================

    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT')")
    @GetMapping("/enrollment/{enrollmentId}/term/{term}/ranking")
    public ResponseEntity<MarkRankingResponse> calculateClassRanking(
            @PathVariable Long enrollmentId,
            @PathVariable Term term
    ) {

        StudentEnrollment enrollment =
                enrollmentRepository.findById(enrollmentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Student enrollment not found"
                                )
                        );

        checkStudentAccessIfNeeded(enrollment);

        return ResponseEntity.ok(
                markService.calculateClassRanking(
                        enrollmentId,
                        term
                )
        );
    }

    // ============================================================
    // YEARLY RESULTS
    // ============================================================

    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT')")
    @GetMapping("/enrollment/{enrollmentId}/yearly")
    public ResponseEntity<MarkYearlyResultResponse> calculateYearlyResults(
            @PathVariable Long enrollmentId
    ) {

        StudentEnrollment enrollment =
                enrollmentRepository.findById(enrollmentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Student enrollment not found"
                                )
                        );

        checkStudentAccessIfNeeded(enrollment);

        return ResponseEntity.ok(
                markService.calculateYearlyResults(
                        enrollmentId
                )
        );
    }

    // ============================================================
    // YEARLY CLASS RANKING
    // ============================================================

    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT')")
    @GetMapping("/enrollment/{enrollmentId}/yearly/ranking")
    public ResponseEntity<MarkYearlyRankingResponse> calculateYearlyClassRanking(
            @PathVariable Long enrollmentId
    ) {

        StudentEnrollment enrollment =
                enrollmentRepository.findById(enrollmentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Student enrollment not found"
                                )
                        );

        checkStudentAccessIfNeeded(enrollment);

        return ResponseEntity.ok(
                markService.calculateYearlyClassRanking(
                        enrollmentId
                )
        );
    }

    // ============================================================
    // STUDENT ACCESS CHECK
    // ============================================================

    private void checkStudentAccessIfNeeded(
            StudentEnrollment enrollment
    ) {

        var authentication =
                org.springframework.security.core.context
                        .SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null) {
            throw new RuntimeException(
                    "User is not authenticated"
            );
        }

        boolean isStudent =
                authentication.getAuthorities()
                        .stream()
                        .anyMatch(authority ->
                                authority.getAuthority()
                                        .equals("ROLE_STUDENT")
                        );

        if (isStudent) {
            markService.checkStudentAccess(
                    enrollment
            );
        }
    }
}