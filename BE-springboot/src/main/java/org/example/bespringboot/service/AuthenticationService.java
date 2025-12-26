package org.example.bespringboot.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.bespringboot.dto.AuthenticationResponse;
import org.example.bespringboot.dto.LoginRequest;
import org.example.bespringboot.dto.RegisterRequest;
import org.example.bespringboot.entity.User;
import org.example.bespringboot.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Authentication Service for handling user login and registration
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    /**
     * Register a new user
     */
    public AuthenticationResponse register(RegisterRequest request) {
        log.info("Registration attempt for email: {}", request.getEmail());

        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            log.warn("Registration failed: Email already exists - {}", request.getEmail());
            throw new IllegalArgumentException("Email already exists");
        }

        // Create new User entity
        User newUser = new User();
        newUser.setUsername(request.getEmail()); // Use email as username
        newUser.setFirstname(request.getFirstname());
        newUser.setLastname(request.getLastname());
        newUser.setEmail(request.getEmail());
        newUser.setPassword(passwordEncoder.encode(request.getPassword())); // Encode password
        newUser.setRole("CLIENT"); // Set default role
        newUser.setPointsBalance(0L); // Initialize points balance

        // Save user to repository
        User savedUser = userRepository.save(newUser);
        log.info("User registered successfully: {}", request.getEmail());

        // Generate JWT token
        String token = jwtService.generateToken(savedUser);

        // Return authentication response
        return AuthenticationResponse.builder()
                .token(token)
                .userId(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .build();
    }

    /**
     * Authenticate user with login credentials
     */
    public AuthenticationResponse authenticate(LoginRequest request) {
        log.info("Login attempt for username: {}", request.getUsername());

        // Find user by username
        Optional<User> userOptional = userRepository.findByUsername(request.getUsername());

        if (userOptional.isEmpty()) {
            log.warn("Login failed: User not found - {}", request.getUsername());
            throw new IllegalArgumentException("Invalid username or password");
        }

        User user = userOptional.get();

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Login failed: Invalid password for user - {}", request.getUsername());
            throw new IllegalArgumentException("Invalid username or password");
        }

        log.info("Login successful for user: {}", request.getUsername());

        // Generate JWT token
        String token = jwtService.generateToken(user);

        // Return authentication response
        return AuthenticationResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}