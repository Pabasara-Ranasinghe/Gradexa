package com.gradexa.backend.service;

import com.gradexa.backend.entity.Mark;
import com.gradexa.backend.entity.StudentEnrollment;
import com.gradexa.backend.entity.Term;
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

import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class MarksheetService {

    private final StudentEnrollmentRepository enrollmentRepository;
    private final MarkRepository markRepository;

    public MarksheetService(
            StudentEnrollmentRepository enrollmentRepository,
            MarkRepository markRepository
    ) {
        this.enrollmentRepository =
                enrollmentRepository;

        this.markRepository =
                markRepository;
    }

    public byte[] generateMarksheet(
            Long enrollmentId
    ) {

        StudentEnrollment enrollment =
                enrollmentRepository.findById(enrollmentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Student enrollment not found"
                                )
                        );

        List<Mark> allMarks =
                markRepository.findByStudentEnrollment(
                        enrollment
                );

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

            // ==============================
            // Fonts
            // ==============================

            Font titleFont =
                    FontFactory.getFont(
                            FontFactory.HELVETICA_BOLD,
                            20
                    );

            Font headingFont =
                    FontFactory.getFont(
                            FontFactory.HELVETICA_BOLD,
                            12
                    );

            Font normalFont =
                    FontFactory.getFont(
                            FontFactory.HELVETICA,
                            11
                    );

            // ==============================
            // Title
            // ==============================

            Paragraph title =
                    new Paragraph(
                            "GRADEXA - STUDENT MARKSHEET",
                            titleFont
                    );

            title.setAlignment(
                    Element.ALIGN_CENTER
            );

            document.add(title);

            document.add(
                    new Paragraph(" ")
            );

            // ==============================
            // Student Information
            // ==============================

            Paragraph studentHeading =
                    new Paragraph(
                            "Student Information",
                            headingFont
                    );

            document.add(studentHeading);

            document.add(
                    new Paragraph(
                            "Student Number: "
                                    + enrollment
                                    .getStudent()
                                    .getStudentNumber(),
                            normalFont
                    )
            );

            document.add(
                    new Paragraph(
                            "Student Name: "
                                    + enrollment
                                    .getStudent()
                                    .getFirstName()
                                    + " "
                                    + enrollment
                                    .getStudent()
                                    .getLastName(),
                            normalFont
                    )
            );

            document.add(
                    new Paragraph(
                            "Grade: "
                                    + enrollment
                                    .getAcademicClass()
                                    .getGrade(),
                            normalFont
                    )
            );

            document.add(
                    new Paragraph(
                            "Section: "
                                    + enrollment
                                    .getAcademicClass()
                                    .getSectionName(),
                            normalFont
                    )
            );

            document.add(
                    new Paragraph(
                            "Academic Year: "
                                    + enrollment
                                    .getAcademicYear(),
                            normalFont
                    )
            );

            document.add(
                    new Paragraph(" ")
            );

            // ==============================
            // Term 1
            // ==============================

            addTermSection(
                    document,
                    enrollment,
                    Term.TERM_1
            );

            // ==============================
            // Term 2
            // ==============================

            addTermSection(
                    document,
                    enrollment,
                    Term.TERM_2
            );

            // ==============================
            // Term 3
            // ==============================

            addTermSection(
                    document,
                    enrollment,
                    Term.TERM_3
            );

            // ==============================
            // Yearly Result
            // ==============================

            MarksheetYearlyResult yearlyResult =
                    calculateYearlyResult(
                            allMarks
                    );

            Paragraph yearlyHeading =
                    new Paragraph(
                            "Yearly Result",
                            headingFont
                    );

            document.add(yearlyHeading);

            document.add(
                    new Paragraph(
                            "Overall Total: "
                                    + formatNumber(
                                    yearlyResult.overallTotal
                            ),
                            normalFont
                    )
            );

            document.add(
                    new Paragraph(
                            "Overall Average: "
                                    + formatNumber(
                                    yearlyResult.overallAverage
                            ),
                            normalFont
                    )
            );

            document.add(
                    new Paragraph(" ")
            );

            // ==============================
            // Footer
            // ==============================

            Font footerFont =
                    FontFactory.getFont(
                            FontFactory.HELVETICA,
                            9
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

            // Close PDF
            document.close();

            return outputStream.toByteArray();

        } catch (Exception e) {

            if (document.isOpen()) {
                document.close();
            }

            throw new RuntimeException(
                    "Failed to generate marksheet PDF",
                    e
            );
        }
    }

    // ==========================================================
    // Add Term Section
    // ==========================================================

    private void addTermSection(
            Document document,
            StudentEnrollment enrollment,
            Term term
    ) {

        Font headingFont =
                FontFactory.getFont(
                        FontFactory.HELVETICA_BOLD,
                        12
                );

        Paragraph termHeading =
                new Paragraph(
                        termName(term),
                        headingFont
                );

        document.add(termHeading);

        List<Mark> marks =
                markRepository
                        .findByStudentEnrollmentAndTerm(
                                enrollment,
                                term
                        );

        // No marks for this term
        if (marks.isEmpty()) {

            document.add(
                    new Paragraph(
                            "No marks entered for this term."
                    )
            );

            document.add(
                    new Paragraph(" ")
            );

            return;
        }

        // ==============================
        // Table
        // ==============================

        PdfPTable table =
                new PdfPTable(2);

        table.setWidthPercentage(100);

        table.setWidths(
                new float[]{
                        70,
                        30
                }
        );

        // Header cells
        addHeaderCell(
                table,
                "Subject"
        );

        addHeaderCell(
                table,
                "Marks"
        );

        double total = 0;

        // ==============================
        // Add Marks
        // ==============================

        for (Mark mark : marks) {

            /*
             * Subject entity uses:
             *
             * private String subjectName;
             *
             * Therefore Lombok generates:
             *
             * getSubjectName()
             */
            table.addCell(
                    new PdfPCell(
                            new Phrase(
                                    mark.getSubject()
                                            .getSubjectName()
                            )
                    )
            );

            table.addCell(
                    new PdfPCell(
                            new Phrase(
                                    formatNumber(
                                            mark.getMarks()
                                    )
                            )
                    )
            );

            total += mark.getMarks();
        }

        // ==============================
        // Average
        // ==============================

        double average =
                marks.isEmpty()
                        ? 0
                        : total / marks.size();

        document.add(table);

        document.add(
                new Paragraph(
                        "Total: "
                                + formatNumber(total)
                )
        );

        document.add(
                new Paragraph(
                        "Average: "
                                + formatNumber(average)
                )
        );

        document.add(
                new Paragraph(" ")
        );
    }

    // ==========================================================
    // Calculate Yearly Result
    // ==========================================================

    private MarksheetYearlyResult calculateYearlyResult(
            List<Mark> allMarks
    ) {

        double term1Total = 0;
        double term2Total = 0;
        double term3Total = 0;

        int term1Count = 0;
        int term2Count = 0;
        int term3Count = 0;

        for (Mark mark : allMarks) {

            switch (mark.getTerm()) {

                case TERM_1:

                    term1Total += mark.getMarks();
                    term1Count++;

                    break;

                case TERM_2:

                    term2Total += mark.getMarks();
                    term2Count++;

                    break;

                case TERM_3:

                    term3Total += mark.getMarks();
                    term3Count++;

                    break;
            }
        }

        double overallTotal =
                term1Total
                        + term2Total
                        + term3Total;

        int totalCount =
                term1Count
                        + term2Count
                        + term3Count;

        double overallAverage =
                totalCount == 0
                        ? 0
                        : overallTotal / totalCount;

        return new MarksheetYearlyResult(
                overallTotal,
                overallAverage
        );
    }

    // ==========================================================
    // Add Table Header Cell
    // ==========================================================

    private void addHeaderCell(
            PdfPTable table,
            String text
    ) {

        Font headerFont =
                FontFactory.getFont(
                        FontFactory.HELVETICA_BOLD,
                        10
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

    // ==========================================================
    // Convert Term Enum to Display Name
    // ==========================================================

    private String termName(Term term) {

        return switch (term) {

            case TERM_1 ->
                    "Term 1";

            case TERM_2 ->
                    "Term 2";

            case TERM_3 ->
                    "Term 3";
        };
    }

    // ==========================================================
    // Format Numbers
    // ==========================================================

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

    // ==========================================================
    // Yearly Result Helper Class
    // ==========================================================

    private static class MarksheetYearlyResult {

        private final double overallTotal;
        private final double overallAverage;

        public MarksheetYearlyResult(
                double overallTotal,
                double overallAverage
        ) {

            this.overallTotal =
                    overallTotal;

            this.overallAverage =
                    overallAverage;
        }
    }
}