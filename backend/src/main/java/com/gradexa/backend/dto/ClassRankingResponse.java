package com.gradexa.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ClassRankingResponse {

    private int place;

    private Long enrollmentId;

    private String studentNumber;

    private String studentName;

    private double overallTotal;

    private double overallAverage;
}