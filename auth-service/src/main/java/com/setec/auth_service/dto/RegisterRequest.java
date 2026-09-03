package com.setec.auth_service.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String password;
    private String email;
    private String role;
    
    private String firstName;
    private String lastName;
    private String gender;
    private String profile;
    private String phone;
    private Long warehouseId;
}
