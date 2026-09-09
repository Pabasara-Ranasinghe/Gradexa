package com.gradexa.backend.service;

import java.io.ByteArrayOutputStream;
import java.util.List;

import org.springframework.stereotype.Service;

import com.gradexa.backend.dto.StudentPerformanceResponse;
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

@Service
public class MarksheetService {

    private final StudentEnrollmentRepository enrollmentRepository;
    private final MarkRepository markRepository;
    private final StudentPerformanceService performanceService;

    public MarksheetService(
            StudentEnrollmentRepository enrollmentRepository,
            MarkRepository markRepository,
            StudentPerformanceService performanceService
    ) {
        this.enrollmentRepository =
                enrollmentRepository;

        this.markRepository =
                markRepository;

        this.performanceService =
                performanceService;
    }

    // ==========================================================
    // GENERATE MARKSHEET
    // ==========================================================

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

            // ==================================================
            // FONTS
            // ==================================================

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

            // ==================================================
            // TITLE
            // ==================================================

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

            // ==================================================
            // STUDENT INFORMATION
            // ==================================================

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
                                    + enrollment.getAcademicYear(),
                            normalFont
                    )
            );

            document.add(
                    new Paragraph(" ")
            );

            // ==================================================
            // TERM 1
            // ==================================================

            addTermSection(
                    document,
                    enrollment,
                    Term.TERM_1
            );

            // ==================================================
            // TERM 2
            // ==================================================

            addTermSection(
                    document,
                    enrollment,
                    Term.TERM_2
            );

            // ==================================================
            // TERM 3
            // ==================================================

            addTermSection(
                    document,
                    enrollment,
                    Term.TERM_3
            );

            // ==================================================
            // FOOTER
            // ==================================================

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

            // ==================================================
            // CLOSE PDF
            // ==================================================

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
    // ADD TERM SECTION
    // ==========================================================

    private void addTermSection(
            Document document,
            StudentEnrollment enrollment,
            Term term
    ) {

        List<Mark> marks =
                markRepository
                        .findByStudentEnrollmentAndTerm(
                                enrollment,
                                term
                        );

        /*
         * If there are no marks for this term,
         * completely skip the term.
         *
         * We do NOT display:
         *
         * "Term 3"
         * "No marks entered for this term."
         */

        if (marks.isEmpty()) {
            return;
        }

        // ==================================================
        // TERM HEADING
        // ==================================================

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

        // ==================================================
        // TABLE
        // ==================================================

        PdfPTable table =
                new PdfPTable(2);

        table.setWidthPercentage(100);

        table.setWidths(
                new float[]{
                        70,
                        30
                }
        );

        // ==================================================
        // TABLE HEADERS
        // ==================================================

        addHeaderCell(
                table,
                "Subject"
        );

        addHeaderCell(
                table,
                "Marks"
        );

        // ==================================================
        // MARKS
        // ==================================================

        double total = 0;

        int participatedCount = 0;

        for (Mark mark : marks) {

            // ----------------------------------------------
            // SUBJECT
            // ----------------------------------------------

            String subjectName =
                    mark.getSubject()
                            .getSubjectName();

            table.addCell(
                    new PdfPCell(
                            new Phrase(
                                    subjectName
                            )
                    )
            );

            // ----------------------------------------------
            // MARK
            // ----------------------------------------------

            String displayedMark;

            /*
             * IMPORTANT:
             *
             * We check the absent field first.
             *
             * absent = true
             *      -> AB
             *
             * absent = false + marks = 0
             *      -> 0
             *
             * Therefore a genuine zero is NOT treated
             * as an absence.
             */

            if (mark.isAbsent()) {

                displayedMark = "AB";

            } else {

                displayedMark =
                        formatNumber(
                                mark.getMarks()
                        );

                /*
                 * Only participated marks are included
                 * in the term total and average.
                 */
                total += mark.getMarks();

                participatedCount++;
            }

            PdfPCell marksCell =
                    new PdfPCell(
                            new Phrase(
                                    displayedMark
                            )
                    );

            marksCell.setHorizontalAlignment(
                    Element.ALIGN_CENTER
            );

            table.addCell(marksCell);
        }

        // ==================================================
        // ADD TABLE
        // ==================================================

        document.add(table);

        // ==================================================
        // TERM TOTAL
        // ==================================================

        document.add(
                new Paragraph(
                        "Total: "
                                + formatNumber(total)
                )
        );

        // ==================================================
        // TERM AVERAGE
        // ==================================================

        double average =
                participatedCount == 0
                        ? 0
                        : total / participatedCount;

        document.add(
                new Paragraph(
                        "Average: "
                                + formatNumber(average)
                )
        );

        // ==================================================
        // POSITION / CLASS SIZE
        // ==================================================

        addPositionInformation(
                document,
                enrollment,
                term
        );

        document.add(
                new Paragraph(" ")
        );
    }

    // ==========================================================
    // ADD POSITION INFORMATION
    // ==========================================================

    private void addPositionInformation(
            Document document,
            StudentEnrollment enrollment,
            Term term
    ) {

        try {

            /*
             * Get the complete performance information
             * for the student's class.
             */
            List<StudentPerformanceResponse> classPerformance =
                    performanceService.getClassPerformance(
                            enrollment
                                    .getAcademicClass()
                                    .getId()
                    );

            /*
             * Find the current student's result.
             */
            StudentPerformanceResponse studentResult =
                    classPerformance
                            .stream()
                            .filter(result ->
                                    result.getEnrollmentId()
                                            .equals(
                                                    enrollment.getId()
                                            )
                            )
                            .findFirst()
                            .orElse(null);

            if (studentResult == null) {
                return;
            }

            int position;
            int classSize;

            // ==================================================
            // TERM 1
            // ==================================================

            if (term == Term.TERM_1) {

                position =
                        studentResult.getTerm1Place();

                classSize =
                        studentResult.getTerm1TotalStudents();

            }

            // ==================================================
            // TERM 2
            // ==================================================

            else if (term == Term.TERM_2) {

                position =
                        studentResult.getTerm2Place();

                classSize =
                        studentResult.getTerm2TotalStudents();

            }

            // ==================================================
            // TERM 3
            // ==================================================

            else {

                position =
                        studentResult.getTerm3Place();

                classSize =
                        studentResult.getTerm3TotalStudents();
            }

            /*
             * Only display position information when
             * the term has a valid class result.
             */
            if (position > 0) {

                document.add(
                        new Paragraph(
                                "Position: "
                                        + position
                        )
                );
        }

        if (classSize > 0) {

                document.add(
                        new Paragraph(
                                "Total No. of Students: "
                                        + classSize
                        )
                );
        }

        } catch (Exception e) {

            /*
             * Position information should not prevent
             * the marksheet itself from being generated.
             *
             * The marks table will still be included.
             */
            System.err.println(
                    "Unable to load position information: "
                            + e.getMessage()
            );
        }
    }

    // ==========================================================
    // ADD TABLE HEADER CELL
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
    // CONVERT TERM ENUM TO DISPLAY NAME
    // ==========================================================

    private String termName(
            Term term
    ) {

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
    // FORMAT NUMBERS
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
}