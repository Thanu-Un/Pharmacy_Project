package com.setec.operation_service.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "units")
@Data
public class Unit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(name = "base_unit")
    private Long baseUnitId;

    @Column(length = 10)
    private String operator;

    @Column(name = "operation_value")
    private String operationValue;

    @Column(name = "unit_value")
    private String unitValue;
}
