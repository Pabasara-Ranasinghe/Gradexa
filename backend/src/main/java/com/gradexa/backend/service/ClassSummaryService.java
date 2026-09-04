package com.gradexa.backend.service;

import com.gradexa.backend.dto.ClassSummaryResponse;
import com.gradexa.backend.entity.AcademicClass;
import com.gradexa.backend.entity.Mark;
import com.gradexa.backend.entity.StudentEnrollment;
import com.gradexa.backend.exception.ResourceNotFoundException;
import com.gradexa.backend.repository.AcademicClassRepository;
import com.gradexa.backend.repository.MarkRepository;
import com.gradexa.backend.repository.StudentEnrollmentRepository;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ClassSummaryService {

    private final StudentEnrollmentRepository enrollmentRepository;
    private final MarkRepository markRepository;
    private final AcademicClassRepository academicClassRepository;

    public ClassSummaryService(
            StudentEnrollmentRepository enrollmentRepository,
            MarkRepository markRepository,
            AcademicClassRepository academicClassRepository
    ) {
        this.enrollmentRepository =
                enrollmentRepository;

        this.markRepository =
                markRepository;

        this.academicClassRepository =
                academicClassRepository;
    }

    public ClassSummaryResponse getClassSummary(
            Long classId
    ) {

        // Check whether the class exists
        AcademicClass academicClass =
                academicClassRepository
                        .findById(classId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Class not found"
                                )
                        );

        // Get all active students in this class
        List<StudentEnrollment> enrollments =
                enrollmentRepository
                        .findByAcademicClassIdAndActiveTrue(
                                classId
                        );

        if (enrollments.isEmpty()) {
            throw new RuntimeException(
                    "No students found in this class"
            );
        }

        int totalStudents =
                enrollments.size();

        int studentsWithMarks = 0;

        List<Double> studentAverages =
                new ArrayList<>();

        // Calculate each student's average
        for (StudentEnrollment enrollment :
                enrollments) {

            List<Mark> marks =
                    markRepository
                            .findByStudentEnrollment(
                                    enrollment
                            );

            if (marks.isEmpty()) {
                continue;
            }

            studentsWithMarks++;

            double total = 0;

            for (Mark mark : marks) {
                total += mark.getMarks();
            }

            double average =
                    total / marks.size();

            studentAverages.add(average);
        }

        // If nobody has marks yet
        if (studentAverages.isEmpty()) {

            return new ClassSummaryResponse(
                    classId,
                    academicClass.getAcademicYear(),
                    academicClass.getGrade(),
                    academicClass.getSectionName(),
                    totalStudents,
                    0,
                    0,
                    0,
                    0
            );
        }

        // Calculate class average
        double totalAverage = 0;

        for (double average :
                studentAverages) {

            totalAverage += average;
        }

        double classAverage =
                totalAverage /
                        studentAverages.size();

        // Find highest and lowest
        double highestAverage =
                studentAverages.stream()
                        .mapToDouble(
                                Double::doubleValue
                        )
                        .max()
                        .orElse(0);

        double lowestAverage =
                studentAverages.stream()
                        .mapToDouble(
                                Double::doubleValue
                        )
                        .min()
                        .orElse(0);

        return new ClassSummaryResponse(
                classId,
                academicClass.getAcademicYear(),
                academicClass.getGrade(),
                academicClass.getSectionName(),
                totalStudents,
                studentsWithMarks,
                classAverage,
                highestAverage,
                lowestAverage
        );
    }
}