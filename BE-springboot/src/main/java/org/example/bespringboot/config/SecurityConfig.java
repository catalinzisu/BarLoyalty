package org.example.bespringboot.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) {
        try {
            http
                    .csrf(AbstractHttpConfigurer::disable)
                    .cors(Customizer.withDefaults())

                    // 1. Dezactivam Auth-ul vechi care facea probleme
                    .httpBasic(AbstractHttpConfigurer::disable)
                    .formLogin(AbstractHttpConfigurer::disable)

                    .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                    .authorizeHttpRequests(authz -> authz
                            // 2. PERMITEM TOATE RUTELE PUBLICE + EROAREA
                            .requestMatchers("/api/v1/auth/**").permitAll()
                            .requestMatchers("/error").permitAll() // <--- ASTA LIPSEA! Fara ea nu vezi erorile.
                            .requestMatchers("/ws/**", "/api/bars/**", "/api/transactions/**", "/actuator/**").permitAll()
                            .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()

                            // Allow authenticated users to access user endpoints (GET requests for profile data)
                            .requestMatchers(HttpMethod.GET, "/api/v1/users/**").authenticated()

                            .anyRequest().authenticated()
                    )
                    // Add JWT Authentication Filter before UsernamePasswordAuthenticationFilter
                    .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

            return http.build();
        } catch (Exception e) {
            throw new RuntimeException("Failed to configure security filter chain", e);
        }
    }
}