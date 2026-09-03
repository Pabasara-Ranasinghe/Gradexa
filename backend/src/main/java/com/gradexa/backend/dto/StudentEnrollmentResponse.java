package com.gradexa.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class StudentEnrollmentResponse {

    private Long id;

    private Long studentId;

    private String studentNumber;

    private String firstName;

    private String lastName;

    private Long classId;

    private Integer grade;

    private String sectionName;

    private Integer academicYear;

    private boolean active;
}