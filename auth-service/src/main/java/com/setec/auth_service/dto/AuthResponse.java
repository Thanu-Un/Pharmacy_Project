package com.setec.auth_service.dto;

import lombok.Data;

@Data
public class AuthResponse {
    private String message;
    private String token;
    private String username;
    private java.util.List<String> permissions;
    private Long warehouseId;
}
