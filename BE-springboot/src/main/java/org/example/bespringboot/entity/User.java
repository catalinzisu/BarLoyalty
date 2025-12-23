package org.example.bespringboot.entity;

import jakarta.persistence.*;
import lombok.Data;

/**
 * User Entity - Represents a bar loyalty customer
 * Maps to 'users' table in PostgreSQL
 */
@Data
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private Long pointsBalance = 0L;
}
