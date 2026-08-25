package com.setec.operation_service.service;

import com.setec.operation_service.model.Supplier;
import com.setec.operation_service.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class SupplierService {

    @Autowired
    private SupplierRepository supplierRepository;

    public Supplier createSupplier(Supplier supplier) {
        return supplierRepository.save(supplier);
    }

    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }

    public Optional<Supplier> getSupplierById(Long id) {
        return supplierRepository.findById(id);
    }

    public Supplier updateSupplier(Long id, Supplier updatedSupplier) {
        return supplierRepository.findById(id).map(existing -> {
            existing.setCompany(updatedSupplier.getCompany());
            existing.setName(updatedSupplier.getName());
            existing.setEmailAddress(updatedSupplier.getEmailAddress());
            existing.setPhone(updatedSupplier.getPhone());
            existing.setAddress(updatedSupplier.getAddress());
            existing.setCity(updatedSupplier.getCity());
            return supplierRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Supplier not found with ID: " + id));
    }

    public void deleteSupplier(Long id) {
        if (!supplierRepository.existsById(id)) {
            throw new RuntimeException("Supplier not found with ID: " + id);
        }
        supplierRepository.deleteById(id);
    }
}
