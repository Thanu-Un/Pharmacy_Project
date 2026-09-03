package com.setec.operation_service.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Data
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 1. Basic Information
    @Column(unique = true, nullable = false)
    private String code;

    @Column(nullable = false)
    private String name;



    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    // 2. Units & Custom Prices
    @ManyToOne
    @JoinColumn(name = "unit_id")
    private Unit unit;

    @ManyToOne
    @JoinColumn(name = "sale_unit_id")
    private Unit saleUnit;

    @ManyToOne
    @JoinColumn(name = "purchase_unit_id")
    private Unit purchaseUnit;

    @ManyToOne
    @JoinColumn(name = "base_unit_1_id")
    private Unit baseUnit1;
    @Column(name = "price_base_unit_1")
    private BigDecimal priceBaseUnit1;

    @ManyToOne
    @JoinColumn(name = "base_unit_2_id")
    private Unit baseUnit2;
    @Column(name = "price_base_unit_2")
    private BigDecimal priceBaseUnit2;

    @ManyToOne
    @JoinColumn(name = "base_unit_3_id")
    private Unit baseUnit3;
    @Column(name = "price_base_unit_3")
    private BigDecimal priceBaseUnit3;

    @ManyToOne
    @JoinColumn(name = "base_unit_4_id")
    private Unit baseUnit4;
    @Column(name = "price_base_unit_4")
    private BigDecimal priceBaseUnit4;

    @ManyToOne
    @JoinColumn(name = "base_unit_5_id")
    private Unit baseUnit5;
    @Column(name = "price_base_unit_5")
    private BigDecimal priceBaseUnit5;

    // 3. Costs & Pricing
    @Column(nullable = false)
    private BigDecimal cost = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal price = BigDecimal.ZERO;


    @Column(name = "alert_quantity")
    private BigDecimal alertQuantity = BigDecimal.ZERO;

    @Column(name = "track_quantity")
    private Boolean trackQuantity = true;

    @Transient
    private BigDecimal quantity = BigDecimal.ZERO;

    @Transient
    private java.util.List<Stock> stocks;

    @Column(columnDefinition = "TEXT")
    private String image;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
