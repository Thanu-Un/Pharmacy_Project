package com.setec.operation_service.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.util.HashMap;
import java.util.Map;

@Service
public class TelegramBotService {

    @Value("${telegram.bot.token:}")
    private String botToken;

    @Value("${telegram.bot.chatId:}")
    private String chatId;

    public void sendMessage(String message) {
        if (botToken == null || botToken.isEmpty() || "ENTER_YOUR_BOT_TOKEN_HERE".equals(botToken)) {
            System.out.println("Telegram Bot Token is not configured. Skipping message: " + message);
            return;
        }

        try {
            String urlString = String.format("https://api.telegram.org/bot%s/sendMessage", botToken);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, Object> body = new HashMap<>();
            body.put("chat_id", chatId);
            body.put("text", message);
            body.put("parse_mode", "HTML");
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            
            RestTemplate restTemplate = new RestTemplate();
            restTemplate.postForObject(urlString, request, String.class);
            System.out.println("Telegram message sent successfully!");
        } catch (Exception e) {
            System.err.println("Failed to send Telegram message: " + e.getMessage());
        }
    }
}
