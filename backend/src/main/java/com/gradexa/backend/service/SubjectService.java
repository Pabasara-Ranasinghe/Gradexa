package com.gradexa.backend.service;

import com.gradexa.backend.entity.AcademicClass;
import com.gradexa.backend.entity.Subject;
import com.gradexa.backend.repository.SubjectRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SubjectService {

    private static final int MAX_SUBJECTS_PER_CLASS = 15;

    private final SubjectRepository subjectRepository;
    private final AcademicClassService academicClassService;

    public SubjectService(
            SubjectRepository subjectRepository,
            AcademicClassService academicClassService
    ) {
        this.subjectRepository = subjectRepository;
        this.academicClassService = academicClassService;
    }

    public Subject createSubject(
            Long classId,
            String subjectName
    ) {

        AcademicClass academicClass =
                academicClassService.getClassById(classId);

        if (!academicClass.isActive()) {
            throw new RuntimeException(
                    "Cannot add a subject to an inactive class"
            );
        }

        if (subjectName == null ||
                subjectName.trim().isEmpty()) {

            throw new RuntimeException(
                    "Subject name is required"
            );
        }

        String normalizedSubjectName =
                subjectName.trim();

        long subjectCount =
                subjectRepository
                        .countByAcademicClassIdAndActiveTrue(
                                classId
                        );

        if (subjectCount >= MAX_SUBJECTS_PER_CLASS) {
            throw new RuntimeException(
                    "A class can have a maximum of 15 subjects"
            );
        }

        if (subjectRepository
                .existsByAcademicClassIdAndSubjectName(
                        classId,
                        normalizedSubjectName
                )) {

            throw new RuntimeException(
                    "This subject already exists for the selected class"
            );
        }

        Subject subject = new Subject();

        subject.setAcademicClass(academicClass);
        subject.setSubjectName(normalizedSubjectName);
        subject.setActive(true);

        return subjectRepository.save(subject);
    }

    public List<Subject> getSubjectsByClass(
            Long classId
    ) {

        academicClassService.getClassById(classId);

        return subjectRepository
                .findByAcademicClassIdAndActiveTrue(
                        classId
                );
    }

    public Subject getSubjectById(
            Long id
    ) {

        return subjectRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Subject not found"
                        )
                );
    }

    public Subject updateSubject(
            Long id,
            String subjectName
    ) {

        Subject subject =
                getSubjectById(id);

        if (!subject.isActive()) {
            throw new RuntimeException(
                    "Cannot update an inactive subject"
            );
        }

        if (subjectName == null ||
                subjectName.trim().isEmpty()) {

            throw new RuntimeException(
                    "Subject name is required"
            );
        }

        String normalizedSubjectName =
                subjectName.trim();

        Long classId =
                subject.getAcademicClass().getId();

        boolean duplicate =
                subjectRepository
                        .existsByAcademicClassIdAndSubjectName(
                                classId,
                                normalizedSubjectName
                        );

        if (duplicate &&
                !subject.getSubjectName()
                        .equalsIgnoreCase(
                                normalizedSubjectName
                        )) {

            throw new RuntimeException(
                    "This subject already exists for the selected class"
            );
        }

        subject.setSubjectName(
                normalizedSubjectName
        );

        return subjectRepository.save(subject);
    }

    public Subject deactivateSubject(
            Long id
    ) {

        Subject subject =
                getSubjectById(id);

        subject.setActive(false);

        return subjectRepository.save(subject);
    }
}