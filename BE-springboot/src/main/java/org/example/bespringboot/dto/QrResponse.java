
package org.example.bespringboot.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * QrResponse DTO
 * Maps Python microservice QR code generation response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QrResponse {
    @JsonProperty("qr_code_base64")
    private String qrCodeBase64;

    @JsonProperty("hash")
    private String hash;
}

