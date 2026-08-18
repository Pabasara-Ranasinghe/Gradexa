package com.gradexa.backend.repository;

import com.gradexa.backend.entity.RegistrationStatus;
import com.gradexa.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    List<User> findByRegistrationStatus(
            RegistrationStatus registrationStatus
    );
}