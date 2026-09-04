package com.gradexa.backend.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.gradexa.backend.dto.RegistrationRequestResponse;
import com.gradexa.backend.entity.RegistrationStatus;
import com.gradexa.backend.entity.Student;
import com.gradexa.backend.entity.Teacher;
import com.gradexa.backend.entity.User;
import com.gradexa.backend.repository.StudentRepository;
import com.gradexa.backend.repository.TeacherRepository;
import com.gradexa.backend.repository.UserRepository;

@Service
public class RegistrationRequestService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;

    public RegistrationRequestService(
            UserRepository userRepository,
            StudentRepository studentRepository,
            TeacherRepository teacherRepository
    ) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
    }

    // ===============================
    // GET PENDING REGISTRATIONS
    // ===============================

    public List<RegistrationRequestResponse>
    getPendingRegistrations() {

        List<RegistrationRequestResponse> requests =
                new ArrayList<>();

        List<User> pendingUsers =
                userRepository.findAll()
                        .stream()
                        .filter(user ->
                                user.getRegistrationStatus()
                                        == RegistrationStatus.PENDING
                        )
                        .toList();

        for (User user : pendingUsers) {

            if (user.getRole().name().equals("STUDENT")) {

                Student student =
                        studentRepository
                                .findByUser(user)
                                .orElse(null);

                if (student != null) {

                    requests.add(
                            toStudentResponse(
                                    user,
                                    student
                            )
                    );
                }
            }

            if (user.getRole().name().equals("TEACHER")) {

                Teacher teacher =
                        teacherRepository
                                .findByUser(user)
                                .orElse(null);

                if (teacher != null) {

                    requests.add(
                            toTeacherResponse(
                                    user,
                                    teacher
                            )
                    );
                }
            }
        }

        return requests;
    }

    // ===============================
    // STUDENT RESPONSE
    // ===============================

    private RegistrationRequestResponse
    toStudentResponse(
            User user,
            Student student
    ) {

        return new RegistrationRequestResponse(

                user.getId(),

                user.getUsername(),

                user.getRole(),

                // Correct order
                user.isActive(),

                user.getRegistrationStatus(),

                student.getFirstName(),

                student.getLastName(),

                student.getStudentNumber(),

                student.getDateOfBirth(),

                student.getRequestedSection(),

                student.getRequestedGrade(),

                null,

                null,

                null,

                user.getCreatedAt()
        );
    }

    // ===============================
    // TEACHER RESPONSE
    // ===============================

    private RegistrationRequestResponse
    toTeacherResponse(
            User user,
            Teacher teacher
    ) {

        return new RegistrationRequestResponse(

                user.getId(),

                user.getUsername(),

                user.getRole(),

                // Correct order
                user.isActive(),

                user.getRegistrationStatus(),

                teacher.getFirstName(),

                teacher.getLastName(),

                null,

                null,

                null,

                null,

                teacher.getTeacherNumber(),

                teacher.getSchoolSection(),

                teacher.getSubject(),

                user.getCreatedAt()
        );
    }
}