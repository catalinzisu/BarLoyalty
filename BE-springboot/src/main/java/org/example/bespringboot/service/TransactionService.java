package org.example.bespringboot.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.bespringboot.dto.QrResponse;
import org.example.bespringboot.dto.TransactionRequest;
import org.example.bespringboot.entity.Bar;
import org.example.bespringboot.entity.Transaction;
import org.example.bespringboot.entity.User;
import org.example.bespringboot.repository.BarRepository;
import org.example.bespringboot.repository.TransactionRepository;
import org.example.bespringboot.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RequiredArgsConstructor
@Service
public class TransactionService {

    private final RestTemplate restTemplate;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final BarRepository barRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Value("${python.microservice.url:http://backend-python:5000}")
    private String pythonMicroserviceUrl;

    public Transaction createTransaction(TransactionRequest request) {
        log.info("Creating transaction for userId: {}, barId: {}, amount: {}",
                request.getUserId(), request.getBarId(), request.getAmount());

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + request.getUserId()));

        Bar bar = barRepository.findById(request.getBarId())
                .orElseThrow(() -> new IllegalArgumentException("Bar not found with id: " + request.getBarId()));

        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setBar(bar);
        transaction.setAmount(request.getAmount());
        transaction.setStatus("PENDING");

        Transaction savedTransaction = transactionRepository.save(transaction);
        log.info("Transaction saved with id: {}", savedTransaction.getId());

        try {
            QrResponse qrResponse = callPythonMicroservice(user.getId(), request.getAmount());

            savedTransaction.setQrCodeHash(qrResponse.getHash());

            Long pointsEarned = request.getAmount();
            savedTransaction.setPointsEarned(pointsEarned);
            savedTransaction.setStatus("COMPLETED");

            savedTransaction = transactionRepository.save(savedTransaction);
            log.info("Transaction completed with hash: {}", qrResponse.getHash());

            savedTransaction.setQrCodeImage(qrResponse.getQrCodeBase64());

            user.setPointsBalance(user.getPointsBalance() + pointsEarned);
            userRepository.save(user);
            log.info("User points updated. New balance: {}", user.getPointsBalance());

            notifyUserPointsUpdate(user.getId(), user.getPointsBalance());

            return savedTransaction;

        } catch (Exception e) {
            log.error("Error during transaction processing", e);
            savedTransaction.setStatus("FAILED");
            transactionRepository.save(savedTransaction);
            throw new RuntimeException("Failed to process transaction: " + e.getMessage(), e);
        }
    }

    private QrResponse callPythonMicroservice(Long userId, Long amount) {
        try {
            String url = pythonMicroserviceUrl + "/generate-qr";

            Map<String, Object> request = new HashMap<>();
            request.put("user_id", userId);
            request.put("amount", amount);

            log.info("Calling Python microservice at: {}", url);
            QrResponse response = restTemplate.postForObject(url, request, QrResponse.class);

            if (response == null) {
                throw new RuntimeException("Python microservice returned null response");
            }

            log.info("QR code generated successfully for user: {}", userId);
            return response;

        } catch (Exception e) {
            log.error("Failed to call Python microservice", e);
            throw new RuntimeException("Failed to generate QR code: " + e.getMessage(), e);
        }
    }

    private void notifyUserPointsUpdate(Long userId, Long newBalance) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("userId", userId);
            message.put("pointsBalance", newBalance);
            message.put("timestamp", System.currentTimeMillis());

            String destination = "/topic/points/" + userId;
            messagingTemplate.convertAndSend(destination, (Object) message);
            log.info("WebSocket notification sent to {}", destination);

        } catch (Exception e) {
            log.error("Failed to send WebSocket notification", e);
        }
    }
}