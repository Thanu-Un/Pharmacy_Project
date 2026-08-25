package com.setec.operation_service.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "system_settings")
@Data
public class SystemSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "setting_key", nullable = false, unique = true, length = 100)
    private String settingKey; // e.g. exchange_rate, base_currency, secondary_currency, currency_symbol

    @Column(name = "setting_value", length = 500)
    private String settingValue;
}
