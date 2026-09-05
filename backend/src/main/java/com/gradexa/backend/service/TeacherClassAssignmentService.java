package com.gradexa.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gradexa.backend.entity.AcademicClass;
import com.gradexa.backend.entity.Subject;
import com.gradexa.backend.entity.Teacher;
import com.gradexa.backend.entity.TeacherClassAssignment;
import com.gradexa.backend.repository.AcademicClassRepository;
import com.gradexa.backend.repository.SubjectRepository;
import com.gradexa.backend.repository.TeacherClassAssignmentRepository;
import com.gradexa.backend.repository.TeacherRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TeacherClassAssignmentService {

    private final TeacherClassAssignmentRepository assignmentRepository;
    private final TeacherRepository teacherRepository;
    private final AcademicClassRepository academicClassRepository;
    private final SubjectRepository subjectRepository;

    @Transactional
    public TeacherClassAssignment assignTeacher(
            Long teacherId,
            Long academicClassId,
            Long subjectId
    ) {

        Teacher teacher = teacherRepository
                .findById(teacherId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Teacher not found."
                        )
                );

        AcademicClass academicClass = academicClassRepository
                .findById(academicClassId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Academic class not found."
                        )
                );

        Subject subject = subjectRepository
                .findById(subjectId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Subject not found."
                        )
                );

        if (!teacher.isActive()) {
            throw new RuntimeException(
                    "Teacher is not active."
            );
        }

        if (!academicClass.isActive()) {
            throw new RuntimeException(
                    "Academic class is not active."
            );
        }

        if (!subject.isActive()) {
            throw new RuntimeException(
                    "Subject is not active."
            );
        }

        if (!subject.getAcademicClass().getId()
                .equals(academicClassId)) {

            throw new RuntimeException(
                    "Subject does not belong to the selected class."
            );
        }

        boolean alreadyAssigned =
                assignmentRepository
                        .existsByTeacherIdAndAcademicClassIdAndSubjectId(
                                teacherId,
                                academicClassId,
                                subjectId
                        );

        if (alreadyAssigned) {
            throw new RuntimeException(
                    "Teacher is already assigned to this class and subject."
            );
        }

        TeacherClassAssignment assignment =
                new TeacherClassAssignment();

        assignment.setTeacher(teacher);
        assignment.setAcademicClass(academicClass);
        assignment.setSubject(subject);
        assignment.setActive(true);

        return assignmentRepository.save(assignment);
    }

    public List<TeacherClassAssignment> getTeacherAssignments(
            Long teacherId
    ) {

        return assignmentRepository
                .findByTeacherIdAndActiveTrue(teacherId);
    }

    public List<TeacherClassAssignment> getClassAssignments(
            Long academicClassId
    ) {

        return assignmentRepository
                .findByAcademicClassIdAndActiveTrue(
                        academicClassId
                );
    }

    @Transactional
    public void deactivateAssignment(Long assignmentId) {

        TeacherClassAssignment assignment =
                assignmentRepository
                        .findById(assignmentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Teacher assignment not found."
                                )
                        );

        assignment.setActive(false);

        assignmentRepository.save(assignment);
    }
}