package com.gradexa.backend.controller;

import com.gradexa.backend.entity.Subject;
import com.gradexa.backend.service.SubjectService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    private final SubjectService subjectService;

    public SubjectController(
            SubjectService subjectService
    ) {
        this.subjectService = subjectService;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    @PostMapping
    public ResponseEntity<Subject> createSubject(
            @RequestParam Long classId,
            @RequestParam String subjectName
    ) {

        Subject subject =
                subjectService.createSubject(
                        classId,
                        subjectName
                );

        return ResponseEntity.ok(subject);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    @GetMapping("/class/{classId}")
    public ResponseEntity<List<Subject>> getSubjectsByClass(
            @PathVariable Long classId
    ) {

        return ResponseEntity.ok(
                subjectService.getSubjectsByClass(
                        classId
                )
        );
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    @GetMapping("/{id}")
    public ResponseEntity<Subject> getSubject(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                subjectService.getSubjectById(id)
        );
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    @PutMapping("/{id}")
    public ResponseEntity<Subject> updateSubject(
            @PathVariable Long id,
            @RequestParam String subjectName
    ) {

        return ResponseEntity.ok(
                subjectService.updateSubject(
                        id,
                        subjectName
                )
        );
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Subject> deactivateSubject(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                subjectService.deactivateSubject(id)
        );
    }
}