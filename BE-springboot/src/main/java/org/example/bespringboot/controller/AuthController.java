package org.example.bespringboot.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.bespringboot.dto.AuthenticationResponse;
import org.example.bespringboot.dto.LoginRequest;
import org.example.bespringboot.dto.RegisterRequest;
import org.example.bespringboot.service.AuthenticationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication Controller
 * Handles user login and registration endpoints
 */
@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class AuthController {

    private final AuthenticationService authenticationService;

    /**
     * POST /api/auth/login
     * Authenticate user with username/email and password
     */
    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@RequestBody LoginRequest loginRequest) {
        try {
            log.info("Login attempt for user: {}", loginRequest.getUsername());
            AuthenticationResponse response = authenticationService.authenticate(loginRequest);
            log.info("Login successful for user: {}", loginRequest.getUsername());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.warn("Login failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            log.error("Login error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * POST /api/auth/register
     * Register a new user with email, password, and personal information
     */
    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@RequestBody RegisterRequest registerRequest) {
        try {
            log.info("Registration attempt for email: {}", registerRequest.getEmail());
            AuthenticationResponse response = authenticationService.register(registerRequest);
            log.info("Registration successful for email: {}", registerRequest.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            log.warn("Registration failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (Exception e) {
            log.error("Registration error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
