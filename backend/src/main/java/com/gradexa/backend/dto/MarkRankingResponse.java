package com.gradexa.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MarkRankingResponse {

    private Long enrollmentId;

    private String studentNumber;

    private String studentName;

    private String term;

    private double total;

    private double average;

    private int place;

    private int totalStudents;
}