package com.gradexa.backend.service;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;

import com.gradexa.backend.entity.AcademicClass;
import com.gradexa.backend.entity.Mark;
import com.gradexa.backend.entity.StudentEnrollment;
import com.gradexa.backend.exception.ResourceNotFoundException;
import com.gradexa.backend.repository.AcademicClassRepository;
import com.gradexa.backend.repository.MarkRepository;
import com.gradexa.backend.repository.StudentEnrollmentRepository;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

@Service
public class ClassReportPdfService {

    private final StudentEnrollmentRepository enrollmentRepository;
    private final MarkRepository markRepository;
    private final AcademicClassRepository academicClassRepository;

    public ClassReportPdfService(
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

    public byte[] generateClassReport(
            Long classId
    ) {

        // ==========================================
        // Check whether the class exists
        // ==========================================

        AcademicClass academicClass =
                academicClassRepository
                        .findById(classId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Class not found"
                                )
                        );

        // ==========================================
        // Get all active students in this class
        // ==========================================

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

        List<StudentRanking> rankings =
                new ArrayList<>();

        int studentsWithMarks = 0;

        double totalOfAverages = 0;

        double highestAverage = 0;
        double lowestAverage = Double.MAX_VALUE;

        // ==========================================
        // Calculate student results
        // ==========================================

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

            double total = 0;

            for (Mark mark : marks) {
                total += mark.getMarks();
            }

            double average =
                    total / marks.size();

            studentsWithMarks++;

            totalOfAverages += average;

            if (average > highestAverage) {
                highestAverage = average;
            }

            if (average < lowestAverage) {
                lowestAverage = average;
            }

            rankings.add(
                    new StudentRanking(
                            enrollment,
                            total,
                            average
                    )
            );
        }

        // ==========================================
        // Calculate class average
        // ==========================================

        double classAverage =
                studentsWithMarks == 0
                        ? 0
                        : totalOfAverages
                        / studentsWithMarks;

        if (studentsWithMarks == 0) {
            lowestAverage = 0;
        }

        // ==========================================
        // Sort ranking
        // ==========================================

        rankings.sort(
                Comparator.comparingDouble(
                        StudentRanking::getAverage
                ).reversed()
        );

        // ==========================================
        // Create PDF
        // ==========================================

        ByteArrayOutputStream outputStream =
                new ByteArrayOutputStream();

        Document document =
                new Document(PageSize.A4);

        try {

            PdfWriter.getInstance(
                    document,
                    outputStream
            );

            document.open();

            // ======================================
            // Fonts
            // ======================================

            Font titleFont =
                    FontFactory.getFont(
                            FontFactory.HELVETICA_BOLD,
                            20
                    );

            Font headingFont =
                    FontFactory.getFont(
                            FontFactory.HELVETICA_BOLD,
                            13
                    );

            Font normalFont =
                    FontFactory.getFont(
                            FontFactory.HELVETICA,
                            10
                    );

            Font smallFont =
                    FontFactory.getFont(
                            FontFactory.HELVETICA,
                            9
                    );

            // ======================================
            // Title
            // ======================================

            Paragraph title =
                    new Paragraph(
                            "GRADEXA - CLASS PERFORMANCE REPORT",
                            titleFont
                    );

            title.setAlignment(
                    Element.ALIGN_CENTER
            );

            document.add(title);

            document.add(
                    new Paragraph(" ")
            );

            // ======================================
            // Class Information
            // ======================================

            StudentEnrollment firstEnrollment =
                    enrollments.get(0);

            Paragraph classHeading =
                    new Paragraph(
                            "Class Information",
                            headingFont
                    );

            document.add(classHeading);

            document.add(
                    new Paragraph(
                            "Grade: "
                                    + firstEnrollment
                                    .getAcademicClass()
                                    .getGrade(),
                            normalFont
                    )
            );

            document.add(
                    new Paragraph(
                            "Section: "
                                    + firstEnrollment
                                    .getAcademicClass()
                                    .getSectionName(),
                            normalFont
                    )
            );

            document.add(
                    new Paragraph(
                            "Academic Year: "
                                    + firstEnrollment
                                    .getAcademicYear(),
                            normalFont
                    )
            );

            document.add(
                    new Paragraph(
                            "Total Students: "
                                    + enrollments.size(),
                            normalFont
                    )
            );

            document.add(
                    new Paragraph(
                            "Students With Marks: "
                                    + studentsWithMarks,
                            normalFont
                    )
            );

            document.add(
                    new Paragraph(" ")
            );

            // ======================================
            // Class Summary
            // ======================================

            Paragraph summaryHeading =
                    new Paragraph(
                            "Class Summary",
                            headingFont
                    );

            document.add(summaryHeading);

            PdfPTable summaryTable =
                    new PdfPTable(2);

            summaryTable.setWidthPercentage(100);

            addHeaderCell(
                    summaryTable,
                    "Performance"
            );

            addHeaderCell(
                    summaryTable,
                    "Value"
            );

            addTableRow(
                    summaryTable,
                    "Class Average",
                    formatNumber(classAverage)
            );

            addTableRow(
                    summaryTable,
                    "Highest Average",
                    formatNumber(highestAverage)
            );

            addTableRow(
                    summaryTable,
                    "Lowest Average",
                    formatNumber(lowestAverage)
            );

            document.add(summaryTable);

            document.add(
                    new Paragraph(" ")
            );

            // ======================================
            // Ranking
            // ======================================

            Paragraph rankingHeading =
                    new Paragraph(
                            "Student Ranking",
                            headingFont
                    );

            document.add(rankingHeading);

            if (rankings.isEmpty()) {

                document.add(
                        new Paragraph(
                                "No marks have been entered for this class.",
                                normalFont
                        )
                );

            } else {

                PdfPTable rankingTable =
                        new PdfPTable(5);

                rankingTable.setWidthPercentage(100);

                rankingTable.setWidths(
                        new float[]{
                                10,
                                22,
                                28,
                                20,
                                20
                        }
                );

                addHeaderCell(
                        rankingTable,
                        "Place"
                );

                addHeaderCell(
                        rankingTable,
                        "Student No."
                );

                addHeaderCell(
                        rankingTable,
                        "Student Name"
                );

                addHeaderCell(
                        rankingTable,
                        "Total"
                );

                addHeaderCell(
                        rankingTable,
                        "Average"
                );

                // ==================================
                // Add students
                // ==================================

                for (int i = 0;
                     i < rankings.size();
                     i++) {

                    StudentRanking ranking =
                            rankings.get(i);

                    StudentEnrollment enrollment =
                            ranking.enrollment;

                    String studentName =
                            enrollment
                                    .getStudent()
                                    .getFirstName()
                                    + " "
                                    + enrollment
                                    .getStudent()
                                    .getLastName();

                    rankingTable.addCell(
                            new PdfPCell(
                                    new Phrase(
                                            String.valueOf(
                                                    i + 1
                                            ),
                                            smallFont
                                    )
                            )
                    );

                    rankingTable.addCell(
                            new PdfPCell(
                                    new Phrase(
                                            enrollment
                                                    .getStudent()
                                                    .getStudentNumber(),
                                            smallFont
                                    )
                            )
                    );

                    rankingTable.addCell(
                            new PdfPCell(
                                    new Phrase(
                                            studentName,
                                            smallFont
                                    )
                            )
                    );

                    rankingTable.addCell(
                            new PdfPCell(
                                    new Phrase(
                                            formatNumber(
                                                    ranking.total
                                            ),
                                            smallFont
                                    )
                            )
                    );

                    rankingTable.addCell(
                            new PdfPCell(
                                    new Phrase(
                                            formatNumber(
                                                    ranking.average
                                            ),
                                            smallFont
                                    )
                            )
                    );
                }

                document.add(rankingTable);
            }

            document.add(
                    new Paragraph(" ")
            );

            // ======================================
            // Footer
            // ======================================

            Font footerFont =
                    FontFactory.getFont(
                            FontFactory.HELVETICA,
                            8
                    );

            Paragraph footer =
                    new Paragraph(
                            "Generated by Gradexa Student Marks Management System",
                            footerFont
                    );

            footer.setAlignment(
                    Element.ALIGN_CENTER
            );

            document.add(footer);

            document.close();

            return outputStream.toByteArray();

        } catch (Exception e) {

            if (document.isOpen()) {
                document.close();
            }

            throw new RuntimeException(
                    "Failed to generate class report PDF",
                    e
            );
        }
    }

    // ==============================================
    // Add Header Cell
    // ==============================================

    private void addHeaderCell(
            PdfPTable table,
            String text
    ) {

        Font headerFont =
                FontFactory.getFont(
                        FontFactory.HELVETICA_BOLD,
                        9
                );

        PdfPCell cell =
                new PdfPCell(
                        new Phrase(
                                text,
                                headerFont
                        )
                );

        cell.setHorizontalAlignment(
                Element.ALIGN_CENTER
        );

        table.addCell(cell);
    }

    // ==============================================
    // Add Summary Row
    // ==============================================

    private void addTableRow(
            PdfPTable table,
            String label,
            String value
    ) {

        table.addCell(
                new PdfPCell(
                        new Phrase(label)
                )
        );

        PdfPCell valueCell =
                new PdfPCell(
                        new Phrase(value)
                );

        valueCell.setHorizontalAlignment(
                Element.ALIGN_CENTER
        );

        table.addCell(valueCell);
    }

    // ==============================================
    // Format Number
    // ==============================================

    private String formatNumber(
            double number
    ) {

        if (number == (long) number) {

            return String.valueOf(
                    (long) number
            );
        }

        return String.format(
                "%.2f",
                number
        );
    }

    // ==============================================
    // Student Ranking Helper
    // ==============================================

    private static class StudentRanking {

        private final StudentEnrollment enrollment;
        private final double total;
        private final double average;

        public StudentRanking(
                StudentEnrollment enrollment,
                double total,
                double average
        ) {

            this.enrollment = enrollment;
            this.total = total;
            this.average = average;
        }

        public double getAverage() {
            return average;
        }
    }
}