package com.setec.operation_service.service;

import com.setec.operation_service.model.Warehouse;
import com.setec.operation_service.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class WarehouseService {

    @Autowired
    private WarehouseRepository warehouseRepository;

    public List<Warehouse> getAllWarehouses() {
        return warehouseRepository.findAll();
    }

    public Optional<Warehouse> getWarehouseById(Long id) {
        return warehouseRepository.findById(id);
    }

    public Warehouse createWarehouse(Warehouse warehouse) {
        return warehouseRepository.save(warehouse);
    }

    public Warehouse updateWarehouse(Long id, Warehouse updated) {
        return warehouseRepository.findById(id).map(w -> {
            w.setCode(updated.getCode());
            w.setName(updated.getName());
            w.setAddress(updated.getAddress());
            w.setPhone(updated.getPhone());
            return warehouseRepository.save(w);
        }).orElseThrow(() -> new RuntimeException("Warehouse not found"));
    }

    public void deleteWarehouse(Long id) {
        warehouseRepository.deleteById(id);
    }
}
