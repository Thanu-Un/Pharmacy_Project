package com.setec.operation_service.service;

import com.setec.operation_service.model.Warehouse;
import com.setec.operation_service.repository.WarehouseRepository;
import com.setec.operation_service.repository.TransferRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class WarehouseService {

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired(required = false)
    private TransferRepository transferRepository;

    public List<Warehouse> getAllWarehouses() {
        return warehouseRepository.findAll();
    }

    public Optional<Warehouse> getWarehouseById(Long id) {
        return warehouseRepository.findById(id);
    }

    public Warehouse createWarehouse(Warehouse warehouse) {
        if (warehouse.getCode() == null || warehouse.getCode().trim().isEmpty()) {
            throw new IllegalArgumentException("Warehouse code is required.");
        }
        if (warehouse.getName() == null || warehouse.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Warehouse name is required.");
        }

        String cleanCode = warehouse.getCode().trim();
        if (warehouseRepository.existsByCodeIgnoreCase(cleanCode)) {
            throw new IllegalArgumentException("Warehouse code '" + cleanCode + "' already exists! Please choose a different code.");
        }

        warehouse.setCode(cleanCode);
        warehouse.setName(warehouse.getName().trim());
        if (warehouse.getAddress() != null) warehouse.setAddress(warehouse.getAddress().trim());
        if (warehouse.getPhone() != null) warehouse.setPhone(warehouse.getPhone().trim());

        return warehouseRepository.save(warehouse);
    }

    public Warehouse updateWarehouse(Long id, Warehouse updated) {
        return warehouseRepository.findById(id).map(w -> {
            if (updated.getCode() == null || updated.getCode().trim().isEmpty()) {
                throw new IllegalArgumentException("Warehouse code is required.");
            }
            if (updated.getName() == null || updated.getName().trim().isEmpty()) {
                throw new IllegalArgumentException("Warehouse name is required.");
            }

            String cleanCode = updated.getCode().trim();
            if (warehouseRepository.existsByCodeIgnoreCaseAndIdNot(cleanCode, id)) {
                throw new IllegalArgumentException("Warehouse code '" + cleanCode + "' is already used by another warehouse.");
            }

            w.setCode(cleanCode);
            w.setName(updated.getName().trim());
            w.setAddress(updated.getAddress() != null ? updated.getAddress().trim() : null);
            w.setPhone(updated.getPhone() != null ? updated.getPhone().trim() : null);
            return warehouseRepository.save(w);
        }).orElseThrow(() -> new IllegalArgumentException("Warehouse not found with ID: " + id));
    }

    public void deleteWarehouse(Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Warehouse not found with ID: " + id));

        // Check if warehouse is part of any stock transfers
        if (transferRepository != null) {
            try {
                if (!transferRepository.findByFromWarehouseIdOrToWarehouseId(id, id).isEmpty()) {
                    throw new IllegalStateException("Cannot delete warehouse '" + warehouse.getName() + "' because it has transfer records associated with it.");
                }
            } catch (Exception ignored) {
                // Ignore if method not supported
            }
        }

        try {
            warehouseRepository.deleteById(id);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new IllegalStateException("Cannot delete warehouse '" + warehouse.getName() + "' because it is currently linked to existing inventory, staff, or transaction records.");
        }
    }
}
