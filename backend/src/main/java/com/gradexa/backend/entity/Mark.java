package com.gradexa.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "marks",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {
                                "enrollment_id",
                                "subject_id",
                                "term"
                        }
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Mark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(
            name = "enrollment_id",
            nullable = false
    )
    private StudentEnrollment studentEnrollment;

    @ManyToOne(optional = false)
    @JoinColumn(
            name = "subject_id",
            nullable = false
    )
    private Subject subject;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 10
    )
    private Term term;

    @Column(
            nullable = false
    )
    private Double marks;
}