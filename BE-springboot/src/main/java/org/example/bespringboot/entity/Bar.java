package org.example.bespringboot.entity;

import jakarta.persistence.*;
import lombok.Data;

/**
 * Bar Entity - Represents a bar in the loyalty system
 * Maps to 'bars' table in PostgreSQL
 */
@Data
@Entity
@Table(name = "bars")
public class Bar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String location;
}

