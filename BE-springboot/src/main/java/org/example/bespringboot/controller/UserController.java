package org.example.bespringboot.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.bespringboot.entity.User;
import org.example.bespringboot.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * UserController - Handles user-related endpoints
 * Provides user profile information for authenticated users
 */
@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class UserController {

    private final UserRepository userRepository;

    /**
     * Get user by ID
     * @param id User ID
     * @return User details if found, 404 if not found
     */
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        log.info("Fetching user profile for id: {}", id);
        return userRepository.findById(id)
                .map(user -> {
                    log.info("User profile found: {}", user.getUsername());
                    return ResponseEntity.ok(user);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}