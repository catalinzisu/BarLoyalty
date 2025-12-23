package org.example.bespringboot.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.bespringboot.dto.TransactionRequest;
import org.example.bespringboot.entity.Transaction;
import org.example.bespringboot.service.TransactionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * TransactionController - Handles transaction endpoints
 * Manages QR code generation and loyalty point transactions
 */
@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    /**
     * Create a new transaction
     * Initiates QR code generation and points calculation
     *
     * @param transactionRequest Transaction details (userId, barId, amount)
     * @return Created transaction with QR code hash
     */
    @PostMapping
    public ResponseEntity<Transaction> createTransaction(@RequestBody TransactionRequest transactionRequest) {
        log.info("Received transaction request for userId: {}, barId: {}, amount: {}",
                transactionRequest.getUserId(),
                transactionRequest.getBarId(),
                transactionRequest.getAmount());

        try {
            Transaction transaction = transactionService.createTransaction(transactionRequest);
            log.info("Transaction created successfully with id: {}", transaction.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(transaction);

        } catch (IllegalArgumentException e) {
            log.error("Invalid transaction request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();

        } catch (RuntimeException e) {
            log.error("Transaction processing failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
