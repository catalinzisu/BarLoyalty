package org.example.bespringboot.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.bespringboot.dto.LoginRequest;
import org.example.bespringboot.entity.User;
import org.example.bespringboot.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        log.info("Login attempt for user: {}", loginRequest.getUsername());

        Optional<User> user = userRepository.findByUsername(loginRequest.getUsername());

        if (user.isEmpty()) {
            log.warn("Login failed: User not found - {}", loginRequest.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Invalid username or password"));
        }

        User foundUser = user.get();
        if (!passwordEncoder.matches(loginRequest.getPassword(), foundUser.getPassword())) {
            log.warn("Login failed: Invalid password for user - {}", loginRequest.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Invalid username or password"));
        }

        log.info("Login successful for user: {}", loginRequest.getUsername());
        return ResponseEntity.ok(createLoginResponse(foundUser));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody LoginRequest loginRequest) {
        log.info("Registration attempt for user: {}", loginRequest.getUsername());

        if (userRepository.findByUsername(loginRequest.getUsername()).isPresent()) {
            log.warn("Registration failed: User already exists - {}", loginRequest.getUsername());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(createErrorResponse("Username already exists"));
        }

        User newUser = new User();
        newUser.setUsername(loginRequest.getUsername());
        newUser.setPassword(passwordEncoder.encode(loginRequest.getPassword()));
        newUser.setEmail(loginRequest.getUsername() + "@barloyalty.com");
        newUser.setRole("USER");
        newUser.setPointsBalance(0L);

        User savedUser = userRepository.save(newUser);
        log.info("User registered successfully: {}", loginRequest.getUsername());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(createLoginResponse(savedUser));
    }

    private Map<String, Object> createLoginResponse(User user) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Authentication successful");
        response.put("user", Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "pointsBalance", user.getPointsBalance()
        ));
        return response;
    }

    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return response;
    }
}
