package com.gradexa.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "subjects",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {
                                "academic_class_id",
                                "subject_name"
                        }
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(
            name = "academic_class_id",
            nullable = false
    )
    private AcademicClass academicClass;

    @Column(
            name = "subject_name",
            nullable = false,
            length = 100
    )
    private String subjectName;

    @Column(
            nullable = false
    )
    private boolean active = true;
}