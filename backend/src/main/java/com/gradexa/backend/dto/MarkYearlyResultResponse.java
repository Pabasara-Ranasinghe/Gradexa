package com.gradexa.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MarkYearlyResultResponse {

    private Long enrollmentId;

    private String studentNumber;

    private String studentName;

    private double term1Total;

    private double term1Average;

    private double term2Total;

    private double term2Average;

    private double term3Total;

    private double term3Average;

    private double overallTotal;

    private double overallAverage;
}