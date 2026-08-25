package com.setec.operation_service.service;

import com.setec.operation_service.model.Product;
import com.setec.operation_service.model.Purchase;
import com.setec.operation_service.model.PurchaseItem;
import com.setec.operation_service.repository.ProductRepository;
import com.setec.operation_service.repository.PurchaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;

@Service
public class PurchaseService {

    @Autowired
    private PurchaseRepository purchaseRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<Purchase> getAllPurchases() {
        return purchaseRepository.findAll();
    }

    public Optional<Purchase> getPurchaseById(Long id) {
        return purchaseRepository.findById(id);
    }

    @Transactional
    public Purchase createPurchase(Purchase purchase) {
        // Link items to purchase
        if (purchase.getItems() != null) {
            for (PurchaseItem item : purchase.getItems()) {
                item.setPurchase(purchase);
            }
        }
        
        Purchase savedPurchase = purchaseRepository.save(purchase);
        
        if ("received".equalsIgnoreCase(savedPurchase.getStatus())) {
            updateStockAndCost(savedPurchase);
        }
        
        return savedPurchase;
    }

    @Transactional
    public Purchase updatePurchase(Long id, Purchase purchaseDetails) {
        Purchase existing = purchaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Purchase not found"));

        String oldStatus = existing.getStatus();
        
        existing.setReferenceNo(purchaseDetails.getReferenceNo());
        existing.setDate(purchaseDetails.getDate());
        existing.setSupplier(purchaseDetails.getSupplier());
        existing.setTotal(purchaseDetails.getTotal());
        existing.setGrandTotal(purchaseDetails.getGrandTotal());
        existing.setStatus(purchaseDetails.getStatus());
        existing.setPaymentStatus(purchaseDetails.getPaymentStatus());
        
        // Update items
        existing.getItems().clear();
        if (purchaseDetails.getItems() != null) {
            for (PurchaseItem item : purchaseDetails.getItems()) {
                item.setPurchase(existing);
                existing.getItems().add(item);
            }
        }
        
        Purchase savedPurchase = purchaseRepository.save(existing);
        
        // If status changed to received, update stock
        if (!"received".equalsIgnoreCase(oldStatus) && "received".equalsIgnoreCase(savedPurchase.getStatus())) {
            updateStockAndCost(savedPurchase);
        }
        // NOTE: Handle reverting stock if changed from 'received' to 'pending' as future enhancement if needed
        
        return savedPurchase;
    }

    @Transactional
    public void deletePurchase(Long id) {
        Purchase existing = purchaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Purchase not found"));
        // Avoid deleting if already received, or implement stock reverting
        purchaseRepository.deleteById(id);
    }

    private void updateStockAndCost(Purchase purchase) {
        if (purchase.getItems() == null) return;
        
        for (PurchaseItem item : purchase.getItems()) {
            if (item.getProduct() != null && item.getQuantityReceived() != null && item.getQuantityReceived().compareTo(BigDecimal.ZERO) > 0) {
                Product product = productRepository.findById(item.getProduct().getId()).orElse(null);
                
                if (product != null) {
                    BigDecimal oldQty = product.getQuantity() != null ? product.getQuantity() : BigDecimal.ZERO;
                    BigDecimal oldCost = product.getCost() != null ? product.getCost() : BigDecimal.ZERO;
                    
                    BigDecimal receivedQty = item.getQuantityReceived();
                    BigDecimal newUnitCost = item.getUnitCost() != null ? item.getUnitCost() : BigDecimal.ZERO;
                    
                    // Calculate New Average Cost: ((Old Qty * Old Cost) + (Received Qty * New Cost)) / (Old Qty + Received Qty)
                    BigDecimal totalOldValue = oldQty.multiply(oldCost);
                    BigDecimal totalNewValue = receivedQty.multiply(newUnitCost);
                    
                    BigDecimal newTotalQty = oldQty.add(receivedQty);
                    
                    BigDecimal newAverageCost = oldCost;
                    if (newTotalQty.compareTo(BigDecimal.ZERO) > 0) {
                        newAverageCost = totalOldValue.add(totalNewValue).divide(newTotalQty, 2, RoundingMode.HALF_UP);
                    }
                    
                    // Update Product
                    product.setQuantity(newTotalQty);
                    product.setCost(newAverageCost);
                    productRepository.save(product);
                }
            }
        }
    }
}
