package org.example.bespringboot.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.bespringboot.service.JwtService;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * JWT Authentication Filter
 * Filters incoming HTTP requests to validate JWT tokens from the Authorization header.
 * Extends OncePerRequestFilter to ensure the filter is executed only once per request.
 *
 * Workflow:
 * 1. Extract JWT token from Authorization header (format: "Bearer <token>")
 * 2. Validate token and extract username (email)
 * 3. Load UserDetails from database
 * 4. Validate token signature and expiration
 * 5. Create and set authentication in SecurityContextHolder
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    /**
     * Filter internal method called for each HTTP request
     * Validates JWT token and sets authentication context if token is valid
     */
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        try {
            // Extract JWT token from Authorization header
            final String authHeader = request.getHeader("Authorization");

            // Check if Authorization header exists and starts with "Bearer "
            if (!StringUtils.hasText(authHeader) || !authHeader.startsWith("Bearer ")) {
                log.debug("No valid Authorization header found. Continuing filter chain.");
                filterChain.doFilter(request, response);
                return;
            }

            // Extract the JWT token (remove "Bearer " prefix)
            final String jwt = authHeader.substring(7);
            log.debug("JWT token extracted from Authorization header");

            // Extract username (email) from the token
            final String userEmail = jwtService.extractUsername(jwt);

            // Check if user is not already authenticated in SecurityContextHolder
            if (StringUtils.hasText(userEmail) && SecurityContextHolder.getContext().getAuthentication() == null) {
                log.debug("Processing JWT token for user: {}", userEmail);

                // Load the UserDetails from the database
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

                // Validate the token using JwtService
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    log.info("JWT token is valid for user: {}", userEmail);

                    // Create authentication token
                    UsernamePasswordAuthenticationToken authenticationToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    // Set authentication details using WebAuthenticationDetailsSource
                    authenticationToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );

                    // Update SecurityContextHolder with the authenticated token
                    SecurityContext context = SecurityContextHolder.createEmptyContext();
                    context.setAuthentication(authenticationToken);
                    SecurityContextHolder.setContext(context);

                    log.info("Authentication set in SecurityContextHolder for user: {}", userEmail);
                } else {
                    log.warn("Invalid JWT token for user: {}", userEmail);
                }
            } else if (StringUtils.hasText(userEmail)) {
                log.debug("User {} is already authenticated. Skipping JWT validation.", userEmail);
            }

        } catch (Exception e) {
            log.error("Cannot set user authentication in security context: {}", e.getMessage(), e);
            // Continue filter chain even if token validation fails
            // This allows subsequent filters/handlers to decide how to respond
        }

        // Continue the filter chain
        filterChain.doFilter(request, response);
    }
}

