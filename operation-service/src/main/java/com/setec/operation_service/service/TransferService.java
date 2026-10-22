package com.setec.operation_service.service;

import com.setec.operation_service.model.*;
import com.setec.operation_service.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TransferService {

    @Autowired
    private TransferRepository transferRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private UnitRepository unitRepository;

    public List<Transfer> getAllTransfers() {
        return transferRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "id"));
    }

    public Optional<Transfer> getTransferById(Long id) {
        return transferRepository.findById(id);
    }

    @Transactional
    public Transfer createTransfer(Transfer transfer) {
        if (transfer.getFromWarehouse() == null || transfer.getFromWarehouse().getId() == null) {
            throw new RuntimeException("Source warehouse (From Warehouse) is required");
        }
        if (transfer.getToWarehouse() == null || transfer.getToWarehouse().getId() == null) {
            throw new RuntimeException("Destination warehouse (To Warehouse) is required");
        }
        if (transfer.getFromWarehouse().getId().equals(transfer.getToWarehouse().getId())) {
            throw new RuntimeException("Source and destination warehouses cannot be the same!");
        }

        Warehouse fromWh = warehouseRepository.findById(transfer.getFromWarehouse().getId())
                .orElseThrow(() -> new RuntimeException("Source warehouse not found"));
        Warehouse toWh = warehouseRepository.findById(transfer.getToWarehouse().getId())
                .orElseThrow(() -> new RuntimeException("Destination warehouse not found"));

        transfer.setFromWarehouse(fromWh);
        transfer.setToWarehouse(toWh);

        if (transfer.getReferenceNo() == null || transfer.getReferenceNo().trim().isEmpty()) {
            transfer.setReferenceNo("TRF-" + (System.currentTimeMillis() % 1000000));
        }
        if (transfer.getDate() == null) {
            transfer.setDate(LocalDateTime.now());
        }

        BigDecimal totalItemsCount = BigDecimal.ZERO;

        if (transfer.getItems() != null && !transfer.getItems().isEmpty()) {
            for (TransferItem item : transfer.getItems()) {
                item.setTransfer(transfer);

                if (item.getProduct() == null || item.getProduct().getId() == null) {
                    throw new RuntimeException("Transfer item product is required");
                }

                Product product = productRepository.findById(item.getProduct().getId())
                        .orElseThrow(() -> new RuntimeException("Product not found: ID " + item.getProduct().getId()));

                item.setProduct(product);
                item.setProductCode(product.getCode());
                item.setProductName(product.getName());

                BigDecimal multiplier = calculateBaseUnitsMultiplier(item.getUnit());
                BigDecimal transferBaseQty = item.getQuantity() != null 
                        ? item.getQuantity().multiply(multiplier) 
                        : BigDecimal.ZERO;

                if (transferBaseQty.compareTo(BigDecimal.ZERO) <= 0) {
                    throw new RuntimeException("Transfer quantity must be greater than 0 for " + product.getName());
                }

                // 1. Check & Deduct from source warehouse stock
                Stock fromStock = stockRepository.findByProductIdAndWarehouseId(product.getId(), fromWh.getId())
                        .orElseThrow(() -> new RuntimeException("Product " + product.getName() + " has no stock in " + fromWh.getName()));

                BigDecimal availableQty = fromStock.getQuantity() != null ? fromStock.getQuantity() : BigDecimal.ZERO;
                if (availableQty.compareTo(transferBaseQty) < 0) {
                    throw new RuntimeException("Insufficient stock in " + fromWh.getName() + " for " + product.getName() + ". Available: " + availableQty + ", Requested: " + transferBaseQty);
                }

                fromStock.setQuantity(availableQty.subtract(transferBaseQty));
                stockRepository.save(fromStock);

                // 2. Add to destination warehouse stock
                Stock toStock = stockRepository.findByProductIdAndWarehouseId(product.getId(), toWh.getId())
                        .orElseGet(() -> {
                            Stock s = new Stock();
                            s.setProduct(product);
                            s.setWarehouse(toWh);
                            s.setQuantity(BigDecimal.ZERO);
                            return s;
                        });

                BigDecimal currentToQty = toStock.getQuantity() != null ? toStock.getQuantity() : BigDecimal.ZERO;
                toStock.setQuantity(currentToQty.add(transferBaseQty));
                stockRepository.save(toStock);

                // Calculate subtotal cost
                BigDecimal itemCost = product.getCost() != null ? product.getCost() : BigDecimal.ZERO;
                item.setSubtotalCost(itemCost.multiply(transferBaseQty));

                totalItemsCount = totalItemsCount.add(item.getQuantity());
            }
        } else {
            throw new RuntimeException("Transfer must have at least one product item");
        }

        transfer.setTotalItems(totalItemsCount);
        transfer.setStatus("completed");

        return transferRepository.save(transfer);
    }

    @Transactional
    public void deleteTransfer(Long id) {
        Transfer transfer = transferRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transfer not found"));

        Warehouse fromWh = transfer.getFromWarehouse();
        Warehouse toWh = transfer.getToWarehouse();

        // Revert stock: Add back to source, deduct from destination
        if (transfer.getItems() != null) {
            for (TransferItem item : transfer.getItems()) {
                if (item.getProduct() != null && item.getQuantity() != null) {
                    BigDecimal multiplier = calculateBaseUnitsMultiplier(item.getUnit());
                    BigDecimal transferBaseQty = item.getQuantity().multiply(multiplier);

                    // Revert to source warehouse
                    Stock fromStock = stockRepository.findByProductIdAndWarehouseId(item.getProduct().getId(), fromWh.getId()).orElse(null);
                    if (fromStock != null) {
                        BigDecimal curr = fromStock.getQuantity() != null ? fromStock.getQuantity() : BigDecimal.ZERO;
                        fromStock.setQuantity(curr.add(transferBaseQty));
                        stockRepository.save(fromStock);
                    }

                    // Deduct from destination warehouse
                    Stock toStock = stockRepository.findByProductIdAndWarehouseId(item.getProduct().getId(), toWh.getId()).orElse(null);
                    if (toStock != null) {
                        BigDecimal curr = toStock.getQuantity() != null ? toStock.getQuantity() : BigDecimal.ZERO;
                        BigDecimal newQty = curr.subtract(transferBaseQty);
                        if (newQty.compareTo(BigDecimal.ZERO) < 0) newQty = BigDecimal.ZERO;
                        toStock.setQuantity(newQty);
                        stockRepository.save(toStock);
                    }
                }
            }
        }

        transferRepository.deleteById(id);
    }

    private BigDecimal calculateBaseUnitsMultiplier(Unit unit) {
        if (unit == null || unit.getId() == null) {
            return BigDecimal.ONE;
        }

        BigDecimal totalMultiplier = BigDecimal.ONE;
        Long currentUnitId = unit.getId();

        while (currentUnitId != null) {
            Unit dbUnit = unitRepository.findById(currentUnitId).orElse(null);
            if (dbUnit == null) break;

            String op = dbUnit.getOperator();
            String valStr = dbUnit.getOperationValue();
            if (valStr == null || valStr.trim().isEmpty()) {
                valStr = dbUnit.getUnitValue();
            }

            if (valStr != null && !valStr.trim().isEmpty()) {
                try {
                    BigDecimal val = new BigDecimal(valStr.trim());
                    if ("/".equals(op) && val.compareTo(BigDecimal.ZERO) != 0) {
                        totalMultiplier = totalMultiplier.divide(val, 4, java.math.RoundingMode.HALF_UP);
                    } else if ("*".equals(op) || op == null || op.trim().isEmpty()) {
                        totalMultiplier = totalMultiplier.multiply(val);
                    }
                } catch (Exception e) {
                    // Ignore parse error
                }
            }

            currentUnitId = dbUnit.getBaseUnitId();
        }

        return totalMultiplier;
    }
}
