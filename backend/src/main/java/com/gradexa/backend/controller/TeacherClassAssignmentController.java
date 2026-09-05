package com.gradexa.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gradexa.backend.entity.Teacher;
import com.gradexa.backend.entity.TeacherClassAssignment;
import com.gradexa.backend.service.TeacherClassAssignmentService;
import com.gradexa.backend.service.TeacherService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/teacher-assignments")
@RequiredArgsConstructor
public class TeacherClassAssignmentController {

    private final TeacherClassAssignmentService assignmentService;
    private final TeacherService teacherService;


    /*
     * ADMIN:
     * Assign a teacher to a class and subject.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TeacherClassAssignment> assignTeacher(
            @RequestParam Long teacherId,
            @RequestParam Long academicClassId,
            @RequestParam Long subjectId
    ) {

        TeacherClassAssignment assignment =
                assignmentService.assignTeacher(
                        teacherId,
                        academicClassId,
                        subjectId
                );

        return ResponseEntity.ok(assignment);
    }


    /*
     * TEACHER:
     * Get the assignments belonging to the
     * currently logged-in teacher.
     */
    @GetMapping("/me")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<TeacherClassAssignment>>
    getMyAssignments(
            Authentication authentication
    ) {

        String username =
                authentication.getName();

        Teacher teacher =
                teacherService.getTeacherByUsername(
                        username
                );

        return ResponseEntity.ok(
                assignmentService.getTeacherAssignments(
                        teacher.getId()
                )
        );
    }


    /*
     * ADMIN:
     * Get all active assignments for a teacher.
     */
    @GetMapping("/teacher/{teacherId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TeacherClassAssignment>>
    getTeacherAssignments(
            @PathVariable Long teacherId
    ) {

        return ResponseEntity.ok(
                assignmentService.getTeacherAssignments(
                        teacherId
                )
        );
    }


    /*
     * ADMIN:
     * Get all active teacher assignments for a class.
     */
    @GetMapping("/class/{academicClassId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TeacherClassAssignment>>
    getClassAssignments(
            @PathVariable Long academicClassId
    ) {

        return ResponseEntity.ok(
                assignmentService.getClassAssignments(
                        academicClassId
                )
        );
    }


    /*
     * ADMIN:
     * Deactivate an existing teacher assignment.
     */
    @PutMapping("/{assignmentId}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deactivateAssignment(
            @PathVariable Long assignmentId
    ) {

        assignmentService.deactivateAssignment(
                assignmentId
        );

        return ResponseEntity.ok(
                "Teacher assignment deactivated successfully."
        );
    }
}