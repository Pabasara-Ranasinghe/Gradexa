package com.gradexa.backend.controller;

import com.gradexa.backend.entity.AcademicClass;
import com.gradexa.backend.entity.SchoolSection;
import com.gradexa.backend.service.AcademicClassService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classes")
public class AcademicClassController {

    private final AcademicClassService academicClassService;

    public AcademicClassController(
            AcademicClassService academicClassService
    ) {
        this.academicClassService = academicClassService;
    }

    // ===============================
    // CREATE CLASS
    // ADMIN / PRINCIPAL ONLY
    // ===============================

    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL')")
    @PostMapping
    public ResponseEntity<AcademicClass> createClass(
            @RequestParam Integer academicYear,
            @RequestParam Integer grade,
            @RequestParam String sectionName
    ) {

        AcademicClass academicClass =
                academicClassService.createClass(
                        academicYear,
                        grade,
                        sectionName
                );

        return ResponseEntity.ok(
                academicClass
        );
    }

    // ===============================
    // GET ALL ACTIVE CLASSES FOR YEAR
    // ===============================

    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    @GetMapping
    public ResponseEntity<List<AcademicClass>> getClassesByYear(
            @RequestParam Integer academicYear
    ) {

        return ResponseEntity.ok(
                academicClassService
                        .getClassesByYear(academicYear)
        );
    }

    // ===============================
    // GET CLASSES BY GRADE
    // ===============================

    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    @GetMapping("/grade/{grade}")
    public ResponseEntity<List<AcademicClass>> getClassesByGrade(
            @RequestParam Integer academicYear,
            @PathVariable Integer grade
    ) {

        return ResponseEntity.ok(
                academicClassService
                        .getClassesByGrade(
                                academicYear,
                                grade
                        )
        );
    }

    // ===============================
    // GET CLASSES BY SCHOOL SECTION
    // ===============================

    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    @GetMapping("/section/{schoolSection}")
    public ResponseEntity<List<AcademicClass>> getClassesBySchoolSection(
            @RequestParam Integer academicYear,
            @PathVariable SchoolSection schoolSection
    ) {

        return ResponseEntity.ok(
                academicClassService
                        .getClassesBySchoolSection(
                                academicYear,
                                schoolSection
                        )
        );
    }

    // ===============================
    // GET CLASS BY ID
    // ===============================

    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    @GetMapping("/{id}")
    public ResponseEntity<AcademicClass> getClassById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                academicClassService.getClassById(id)
        );
    }

    // ===============================
    // UPDATE CLASS SECTION
    // ADMIN / PRINCIPAL ONLY
    // ===============================

    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL')")
    @PutMapping("/{id}")
    public ResponseEntity<AcademicClass> updateClass(
            @PathVariable Long id,
            @RequestParam String sectionName
    ) {

        return ResponseEntity.ok(
                academicClassService.updateClassSection(
                        id,
                        sectionName
                )
        );
    }

    // ===============================
    // DEACTIVATE CLASS
    // ADMIN / PRINCIPAL ONLY
    // ===============================

    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL')")
    @DeleteMapping("/{id}")
    public ResponseEntity<AcademicClass> deactivateClass(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                academicClassService.deactivateClass(id)
        );
    }
}