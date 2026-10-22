package com.setec.operation_service.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "transfer_items")
@Data
@ToString(exclude = "transfer")
public class TransferItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transfer_id", nullable = false)
    @JsonBackReference
    private Transfer transfer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "product_code")
    private String productCode;

    @Column(name = "product_name")
    private String productName;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "unit_id")
    private Unit unit;

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal quantity = BigDecimal.ZERO;

    @Column(name = "subtotal_cost", precision = 15, scale = 2)
    private BigDecimal subtotalCost = BigDecimal.ZERO;
}
