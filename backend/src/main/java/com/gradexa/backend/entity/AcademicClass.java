package com.gradexa.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "academic_classes",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {
                                "academic_year",
                                "grade",
                                "section_name"
                        }
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AcademicClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ===============================
    // ACADEMIC YEAR
    // ===============================

    @Column(
            name = "academic_year",
            nullable = false
    )
    private Integer academicYear;

    // ===============================
    // SCHOOL SECTION
    // PRIMARY / UPPER
    // ===============================

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    private SchoolSection schoolSection;

    // ===============================
    // GRADE
    // 1 - 13
    // ===============================

    @Column(
            nullable = false
    )
    private Integer grade;

    // ===============================
    // CLASS SECTION
    // A / B / C / ...
    // ===============================

    @Column(
            name = "section_name",
            nullable = false,
            length = 10
    )
    private String sectionName;

    // ===============================
    // ACTIVE STATUS
    // ===============================

    @Column(
            nullable = false
    )
    private boolean active = true;
}