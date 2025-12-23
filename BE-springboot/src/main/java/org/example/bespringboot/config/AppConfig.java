package org.example.bespringboot.config;

import java.time.Duration;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Application Configuration for BarLoyalty
 * Defines beans for HTTP communication with microservices
 */
@Configuration
public class AppConfig {

    /**
     * RestTemplate bean for making HTTP calls to Python microservice
     * @param builder RestTemplateBuilder for easy configuration
     * @return configured RestTemplate instance
     */
    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofSeconds(5))
                .setReadTimeout(Duration.ofSeconds(10))
                .build();
    }
}
