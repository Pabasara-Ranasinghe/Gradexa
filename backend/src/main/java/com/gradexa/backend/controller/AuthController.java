package com.gradexa.backend.controller;

import com.gradexa.backend.dto.LoginRequest;
import com.gradexa.backend.dto.LoginResponse;
import com.gradexa.backend.dto.RegisterRequest;
import com.gradexa.backend.entity.User;
import com.gradexa.backend.service.AuthService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(
            AuthService authService
    ) {
        this.authService = authService;
    }

    // ===============================
    // REGISTER
    // ===============================

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request
    ) {

        try {

            authService.register(
                    request.getUsername(),
                    request.getPassword(),
                    request.getRole(),
                    request.getFirstName(),
                    request.getLastName(),
                    request.getStudentId(),
                    request.getTeacherId(),
                    request.getDateOfBirth(),
                    request.getSection(),
                    request.getGrade(),
                    request.getSubject()
            );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            "Registration submitted successfully. " +
                            "Please wait for administrator approval."
                    );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // ===============================
    // LOGIN
    // ===============================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request
    ) {

        try {

            User user = authService.login(
                    request.getUsername(),
                    request.getPassword()
            );

            String token =
                    authService.generateToken(
                            user.getUsername()
                    );

            return ResponseEntity.ok(
                    new LoginResponse(
                            token,
                            user.getUsername(),
                            user.getRole()
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            "Invalid username or password"
                    );
        }
    }
}