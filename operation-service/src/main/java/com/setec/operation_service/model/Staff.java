package com.setec.operation_service.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "staffs")
@Data
public class Staff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 20)
    private String gender;

    @Column(length = 30)
    private String phone;

    @Column(length = 100)
    private String email;

    @Column(length = 50)
    private String role; // Pharmacist, Cashier, Manager, Stock Keeper

    @Column(precision = 15, scale = 2)
    private BigDecimal salary = BigDecimal.ZERO;

    @Column(length = 20)
    private String status = "Active"; // Active, Inactive

    @Column(name = "joined_date")
    private LocalDate joinedDate;
}
