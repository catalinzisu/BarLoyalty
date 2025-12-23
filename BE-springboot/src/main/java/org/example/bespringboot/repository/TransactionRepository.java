package org.example.bespringboot.repository;

import org.example.bespringboot.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for Transaction entity
 * Provides database access operations for transactions
 */
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
}

