
package org.example.bespringboot.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * TransactionRequest DTO
 * Used to receive transaction data from frontend
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionRequest {
    private Long userId;
    private Long barId;
    private Long amount;
}