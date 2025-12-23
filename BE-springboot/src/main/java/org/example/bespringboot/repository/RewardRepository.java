package org.example.bespringboot.repository;

import org.example.bespringboot.entity.Reward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repository for Reward entity
 * Provides database access operations for rewards
 */
@Repository
public interface RewardRepository extends JpaRepository<Reward, Long> {
    List<Reward> findByBarId(Long barId);
}

