package com.gradexa.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ClassSummaryResponse {

    private Long classId;
    private Integer academicYear;
    private Integer grade;
    private String sectionName;

    private int totalStudents;
    private int studentsWithMarks;

    private double classAverage;
    private double highestAverage;
    private double lowestAverage;
}