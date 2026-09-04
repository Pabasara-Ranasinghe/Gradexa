package com.gradexa.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MarkCalculationResponse {

    private Long enrollmentId;

    private String studentNumber;

    private String studentName;

    private String term;

    private int subjectCount;

    private double total;

    private double average;
}