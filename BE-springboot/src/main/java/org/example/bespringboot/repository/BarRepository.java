package org.example.bespringboot.repository;

import org.example.bespringboot.entity.Bar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for Bar entity
 * Provides database access operations for bars
 */
@Repository
public interface BarRepository extends JpaRepository<Bar, Long> {
}

