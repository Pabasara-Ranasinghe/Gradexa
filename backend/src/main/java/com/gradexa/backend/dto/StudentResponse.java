package com.gradexa.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class StudentResponse {

    private Long id;

    private String studentNumber;

    private String firstName;

    private String lastName;

    private LocalDate dateOfBirth;

    private boolean active;
}