package com.gradexa.backend.service;

import com.gradexa.backend.entity.RegistrationStatus;
import com.gradexa.backend.entity.Role;
import com.gradexa.backend.entity.User;
import com.gradexa.backend.repository.UserRepository;
import com.gradexa.backend.security.JwtService;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    // ===============================
    // REGISTER
    // ===============================

    public User register(
            String username,
            String password,
            Role role
    ) {

        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException(
                    "Username already exists"
            );
        }

        User user = new User();

        user.setUsername(username);

        user.setPassword(
                passwordEncoder.encode(password)
        );

        user.setRole(role);

        // New users must wait for admin approval
        user.setActive(false);

        user.setRegistrationStatus(
                RegistrationStatus.PENDING
        );

        return userRepository.save(user);
    }

    // ===============================
    // LOGIN
    // ===============================

    public String login(
            String username,
            String password
    ) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invalid username or password"
                        )
                );

        // User must be approved by an admin
        if (user.getRegistrationStatus()
                != RegistrationStatus.APPROVED) {

            throw new RuntimeException(
                    "Your registration is not approved"
            );
        }

        // User must be active
        if (!user.isActive()) {

            throw new RuntimeException(
                    "Your account is inactive"
            );
        }

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                username,
                                password
                        )
                );

        if (!authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "Invalid username or password"
            );
        }

        return jwtService.generateToken(username);
    }
}