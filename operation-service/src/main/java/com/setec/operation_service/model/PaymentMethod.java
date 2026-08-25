package com.setec.operation_service.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "payment_methods")
@Data
public class PaymentMethod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String name; // e.g. Cash, ABA, ACLEDA, Wing, KHQR

    @Column(name = "account_name", length = 100)
    private String accountName;

    @Column(name = "account_number", length = 50)
    private String accountNumber;

    @Column(name = "qr_code_url", length = 500)
    private String qrCodeUrl;

    @Column(length = 20)
    private String status = "Active"; // Active, Inactive
}
