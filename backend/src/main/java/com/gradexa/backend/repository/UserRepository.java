package com.gradexa.backend.repository;

import com.gradexa.backend.entity.RegistrationStatus;
import com.gradexa.backend.entity.Role;
import com.gradexa.backend.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository
        extends JpaRepository<User, Long> {

    // ===============================
    // FIND BY USERNAME
    // ===============================

    Optional<User> findByUsername(
            String username
    );

    // ===============================
    // CHECK USERNAME
    // ===============================

    boolean existsByUsername(
            String username
    );

    // ===============================
    // REGISTRATION STATUS
    // ===============================

    List<User> findByRegistrationStatus(
            RegistrationStatus registrationStatus
    );

    long countByRegistrationStatus(
            RegistrationStatus registrationStatus
    );

    // ===============================
    // ROLE
    // ===============================

    long countByRole(
            Role role
    );

    // ===============================
    // ACTIVE STATUS
    // ===============================

    long countByActiveTrue();

    long countByActiveFalse();
}