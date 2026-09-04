package com.gradexa.backend.entity;

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
@Table(name = "teachers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Teacher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(
            name = "user_id",
            nullable = false,
            unique = true
    )
    private User user;

    @Column(
            name = "teacher_number",
            nullable = false,
            unique = true,
            length = 30
    )
    private String teacherNumber;

    @Column(
            name = "first_name",
            nullable = false,
            length = 50
    )
    private String firstName;

    @Column(
            name = "last_name",
            nullable = false,
            length = 50
    )
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "school_section",
            nullable = false,
            length = 20
    )
    private SchoolSection schoolSection;

    @Column(
            nullable = false,
            length = 100
    )
    private String subject;

    @Column(nullable = false)
    private boolean active = true;
}