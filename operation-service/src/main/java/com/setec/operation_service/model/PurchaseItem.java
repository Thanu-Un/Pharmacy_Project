package com.setec.operation_service.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
import java.math.BigDecimal;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "purchase_items")
@Data
@ToString(exclude = "purchase")
public class PurchaseItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_id", nullable = false)
    @JsonBackReference
    private Purchase purchase;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "product_code")
    private String productCode;

    @Column(name = "product_name")
    private String productName;

    @Column(name = "unit_cost", precision = 15, scale = 2)
    private BigDecimal unitCost = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal quantity = BigDecimal.ZERO;

    @Column(name = "quantity_received", precision = 10, scale = 2)
    private BigDecimal quantityReceived = BigDecimal.ZERO;

    @Column(name = "quantity_balance", precision = 10, scale = 2)
    private BigDecimal quantityBalance = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    private LocalDate expiry;
}
