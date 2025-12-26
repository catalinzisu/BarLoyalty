package org.example.bespringboot.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * AuthenticationResponse DTO
 * Used to send authentication token and user info to frontend
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthenticationResponse {
    private String token;
    private Long userId;
    private String username;
    private String email;
    private String role;
}

