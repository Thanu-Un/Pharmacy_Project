package com.setec.operation_service.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.setec.operation_service.model.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByCode(String code);
}
