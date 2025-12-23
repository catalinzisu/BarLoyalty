package org.example.bespringboot.entity;

import jakarta.persistence.*;
import lombok.Data;

/**
 * Reward Entity - Represents a reward redeemable at a specific bar
 * Maps to 'rewards' table in PostgreSQL
 */
@Data
@Entity
@Table(name = "rewards")
public class Reward {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bar_id", nullable = false)
    private Bar bar;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Long pointsCost;

    @Column
    private String imageUrl;
}

