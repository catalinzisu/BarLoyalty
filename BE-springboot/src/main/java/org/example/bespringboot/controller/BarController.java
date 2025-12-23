package org.example.bespringboot.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.bespringboot.entity.Bar;
import org.example.bespringboot.entity.Reward;
import org.example.bespringboot.repository.BarRepository;
import org.example.bespringboot.repository.RewardRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * BarController - Handles bar-related endpoints
 * Provides access to bars and their associated rewards
 */
@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/bars")
public class BarController {

    private final BarRepository barRepository;
    private final RewardRepository rewardRepository;

    /**
     * Get all bars
     * @return List of all bars in the system
     */
    @GetMapping
    public ResponseEntity<List<Bar>> getAllBars() {
        log.info("Fetching all bars");
        List<Bar> bars = barRepository.findAll();
        log.info("Found {} bars", bars.size());
        return ResponseEntity.ok(bars);
    }

    /**
     * Get rewards for a specific bar
     * @param barId Bar ID
     * @return List of rewards for the specified bar
     */
    @GetMapping("/{barId}/rewards")
    public ResponseEntity<List<Reward>> getBarRewards(@PathVariable Long barId) {
        log.info("Fetching rewards for bar: {}", barId);

        // Verify bar exists
        if (!barRepository.existsById(barId)) {
            log.warn("Bar not found with id: {}", barId);
            return ResponseEntity.notFound().build();
        }

        List<Reward> rewards = rewardRepository.findByBarId(barId);
        log.info("Found {} rewards for bar: {}", rewards.size(), barId);
        return ResponseEntity.ok(rewards);
    }
}