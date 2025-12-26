package org.example.bespringboot.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonBackReference;

/**
 * Reward Entity - Represents a reward redeemable at a specific bar
 * Maps to 'rewards' table in PostgreSQL
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "rewards")
public class Reward {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bar_id", nullable = false)
    @JsonBackReference(value = "bar-rewards")
    private Bar bar;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Long pointsCost;

    @Column
    private String imageUrl;
}

