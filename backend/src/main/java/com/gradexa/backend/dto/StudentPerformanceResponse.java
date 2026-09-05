package com.gradexa.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class StudentPerformanceResponse {

    private Long enrollmentId;
    private String studentNumber;
    private String studentName;

    // ===============================
    // TERM 1
    // ===============================

    private double term1Total;
    private double term1Average;
    private int term1Place;
    private int term1TotalStudents;
    private int term1ParticipatedSubjects;
    private int term1AbsentSubjects;

    // ===============================
    // TERM 2
    // ===============================

    private double term2Total;
    private double term2Average;
    private int term2Place;
    private int term2TotalStudents;
    private int term2ParticipatedSubjects;
    private int term2AbsentSubjects;

    // ===============================
    // TERM 3
    // ===============================

    private double term3Total;
    private double term3Average;
    private int term3Place;
    private int term3TotalStudents;
    private int term3ParticipatedSubjects;
    private int term3AbsentSubjects;

    // ===============================
    // OVERALL
    // ===============================

    private double overallTotal;
    private double overallAverage;
}