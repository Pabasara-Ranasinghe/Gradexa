package com.gradexa.backend.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "students")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ==========================================================
    // USER ACCOUNT
    // ==========================================================

    /*
     * A student can exist before creating a login account.
     *
     * Teacher creates the academic/student record first.
     * Later, the student can request an account and the
     * approved account can be linked to this Student.
     *
     * Therefore user_id must be allowed to be NULL.
     */
    @OneToOne
    @JoinColumn(
            name = "user_id",
            unique = true
    )
    private User user;

    // ==========================================================
    // STUDENT NUMBER
    // ==========================================================

    @Column(
            name = "student_number",
            nullable = false,
            unique = true,
            length = 30
    )
    private String studentNumber;

    // ==========================================================
    // FIRST NAME
    // ==========================================================

    @Column(
            name = "first_name",
            nullable = false,
            length = 50
    )
    private String firstName;

    // ==========================================================
    // LAST NAME
    // ==========================================================

    @Column(
            name = "last_name",
            nullable = false,
            length = 50
    )
    private String lastName;

    // ==========================================================
    // DATE OF BIRTH
    // ==========================================================

    @Column(
            name = "date_of_birth"
    )
    private LocalDate dateOfBirth;

    // ==========================================================
    // REQUESTED SCHOOL SECTION
    // ==========================================================

    @Enumerated(EnumType.STRING)
    @Column(
            name = "requested_section",
            length = 20
    )
    private SchoolSection requestedSection;

    // ==========================================================
    // REQUESTED GRADE
    // ==========================================================

    @Column(
            name = "requested_grade"
    )
    private Integer requestedGrade;

    // ==========================================================
    // STUDENT PROFILE ACTIVE
    // ==========================================================

    /*
     * This refers to the overall student profile.
     *
     * Class-specific activation/deactivation will be handled
     * through StudentEnrollment.active.
     */
    @Column(
            nullable = false
    )
    private boolean active = true;
}