package com.setec.operation_service.controller;

import com.setec.operation_service.model.PaymentMethod;
import com.setec.operation_service.repository.PaymentMethodRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/operation/payment-methods")
@CrossOrigin(origins = "*")
public class PaymentMethodController {

    @Autowired
    private PaymentMethodRepository paymentMethodRepository;

    @GetMapping
    public ResponseEntity<List<PaymentMethod>> getAllPaymentMethods() {
        return ResponseEntity.ok(paymentMethodRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<PaymentMethod> createPaymentMethod(@RequestBody PaymentMethod method) {
        return ResponseEntity.ok(paymentMethodRepository.save(method));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PaymentMethod> updatePaymentMethod(@PathVariable Long id, @RequestBody PaymentMethod method) {
        PaymentMethod existing = paymentMethodRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment method not found: " + id));

        if (method.getName() != null) existing.setName(method.getName());
        if (method.getAccountName() != null) existing.setAccountName(method.getAccountName());
        if (method.getAccountNumber() != null) existing.setAccountNumber(method.getAccountNumber());
        if (method.getQrCodeUrl() != null) existing.setQrCodeUrl(method.getQrCodeUrl());
        if (method.getStatus() != null) existing.setStatus(method.getStatus());

        return ResponseEntity.ok(paymentMethodRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePaymentMethod(@PathVariable Long id) {
        paymentMethodRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
