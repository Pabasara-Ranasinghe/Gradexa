package com.gradexa.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gradexa.backend.entity.Mark;
import com.gradexa.backend.entity.StudentEnrollment;
import com.gradexa.backend.entity.Term;
import com.gradexa.backend.service.MarkService;

@RestController
@RequestMapping("/api/marks")
public class MarkController {

    private final MarkService markService;

    public MarkController(MarkService markService) {
        this.markService = markService;
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
    // ADD TEACHER DRAFT MARK
    // ============================================================

    @PreAuthorize("hasRole('TEACHER')")
    @PostMapping("/teacher/draft")
    public ResponseEntity<Mark> addTeacherDraftMark(
            @RequestParam Long enrollmentId,
            @RequestParam Long subjectId,
            @RequestParam Term term,
            @RequestParam Double marks
    ) {

        Mark mark = markService.addTeacherDraftMark(
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
                markService.getEnrollmentForController(
                        enrollmentId
                );

        checkStudentAccessIfNeeded(enrollment);

        return ResponseEntity.ok(
                markService.getMarksByEnrollment(
                        enrollmentId
                )
        );
    }

    // ============================================================
    // GET SUBMITTED MARKS FOR ENROLLMENT
    // ============================================================

    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT')")
    @GetMapping("/enrollment/{enrollmentId}/submitted")
    public ResponseEntity<List<Mark>> getSubmittedMarks(
            @PathVariable Long enrollmentId
    ) {

        StudentEnrollment enrollment =
                markService.getEnrollmentForController(
                        enrollmentId
                );

        checkStudentAccessIfNeeded(enrollment);

        return ResponseEntity.ok(
                markService.getSubmittedMarksByEnrollment(
                        enrollmentId
                )
        );
    }

    // ============================================================
    // GET DRAFT MARKS
    // ============================================================

    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    @GetMapping("/enrollment/{enrollmentId}/drafts")
    public ResponseEntity<List<Mark>> getDraftMarks(
            @PathVariable Long enrollmentId
    ) {

        return ResponseEntity.ok(
                markService.getDraftMarksByEnrollment(
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
                markService.getEnrollmentForController(
                        enrollmentId
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
    // GET SUBMITTED MARKS BY TERM
    // ============================================================

    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT')")
    @GetMapping("/enrollment/{enrollmentId}/term/{term}/submitted")
    public ResponseEntity<List<Mark>> getSubmittedMarksByTerm(
            @PathVariable Long enrollmentId,
            @PathVariable Term term
    ) {

        StudentEnrollment enrollment =
                markService.getEnrollmentForController(
                        enrollmentId
                );

        checkStudentAccessIfNeeded(enrollment);

        return ResponseEntity.ok(
                markService.getSubmittedMarksByEnrollmentAndTerm(
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

        Mark mark = markService.getMarkById(id);

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
    // UPDATE TEACHER DRAFT MARK
    // ============================================================

    @PreAuthorize("hasRole('TEACHER')")
    @PutMapping("/teacher/draft/{id}")
    public ResponseEntity<Mark> updateTeacherDraftMark(
            @PathVariable Long id,
            @RequestParam Double marks
    ) {

        return ResponseEntity.ok(
                markService.updateTeacherDraftMark(
                        id,
                        marks
                )
        );
    }

    // ============================================================
    // SUBMIT TEACHER DRAFT MARK
    // ============================================================

    @PreAuthorize("hasRole('TEACHER')")
    @PutMapping("/teacher/draft/{id}/submit")
    public ResponseEntity<Mark> submitTeacherDraftMark(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                markService.submitTeacherDraftMark(id)
        );
    }

    // ============================================================
    // TERM RESULT
    // ============================================================

    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT')")
    @GetMapping("/enrollment/{enrollmentId}/term/{term}/results")
    public ResponseEntity<MarkService.MarkCalculationResult>
    calculateTermResult(
            @PathVariable Long enrollmentId,
            @PathVariable Term term
    ) {

        StudentEnrollment enrollment =
                markService.getEnrollmentForController(
                        enrollmentId
                );

        checkStudentAccessIfNeeded(enrollment);

        return ResponseEntity.ok(
                markService.calculateTermResult(
                        enrollmentId,
                        term
                )
        );
    }

    // ============================================================
    // CLASS RANKING
    // ============================================================

    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT')")
    @GetMapping("/enrollment/{enrollmentId}/term/{term}/ranking")
    public ResponseEntity<List<MarkService.MarkRankingResult>>
    calculateClassRanking(
            @PathVariable Long enrollmentId,
            @PathVariable Term term
    ) {

        StudentEnrollment enrollment =
                markService.getEnrollmentForController(
                        enrollmentId
                );

        checkStudentAccessIfNeeded(enrollment);

        Long classId =
                enrollment
                        .getAcademicClass()
                        .getId();

        return ResponseEntity.ok(
                markService.calculateClassRanking(
                        classId,
                        term
                )
        );
    }

    // ============================================================
    // YEARLY RESULT
    // ============================================================

    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT')")
    @GetMapping("/enrollment/{enrollmentId}/yearly")
    public ResponseEntity<MarkService.MarkYearlyResult>
    calculateYearlyResult(
            @PathVariable Long enrollmentId
    ) {

        StudentEnrollment enrollment =
                markService.getEnrollmentForController(
                        enrollmentId
                );

        checkStudentAccessIfNeeded(enrollment);

        return ResponseEntity.ok(
                markService.calculateYearlyResult(
                        enrollmentId
                )
        );
    }

    // ============================================================
    // YEARLY CLASS RANKING
    // ============================================================

    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT')")
    @GetMapping("/enrollment/{enrollmentId}/yearly/ranking")
    public ResponseEntity<List<MarkService.MarkYearlyRankingResult>>
    calculateYearlyClassRanking(
            @PathVariable Long enrollmentId
    ) {

        StudentEnrollment enrollment =
                markService.getEnrollmentForController(
                        enrollmentId
                );

        checkStudentAccessIfNeeded(enrollment);

        Long classId =
                enrollment
                        .getAcademicClass()
                        .getId();

        return ResponseEntity.ok(
                markService.calculateYearlyRanking(
                        classId
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
                                authority
                                        .getAuthority()
                                        .equals("ROLE_STUDENT")
                        );

        if (isStudent) {

            markService.checkStudentAccess(
                    enrollment
            );
        }
    }
}