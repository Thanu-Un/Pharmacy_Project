package com.setec.operation_service.service;

import com.setec.operation_service.model.Product;
import com.setec.operation_service.model.Sale;
import com.setec.operation_service.model.SaleItem;
import com.setec.operation_service.model.Stock;
import com.setec.operation_service.repository.ProductRepository;
import com.setec.operation_service.repository.SaleRepository;
import com.setec.operation_service.repository.StockRepository;
import com.setec.operation_service.repository.UnitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class SaleService {

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private UnitRepository unitRepository;

    @Autowired
    private TelegramBotService telegramBotService;

    public List<Sale> getAllSales() {
        return saleRepository.findAll();
    }

    public Optional<Sale> getSaleById(Long id) {
        return saleRepository.findById(id);
    }

    @Transactional
    public Sale createSale(Sale sale) {
        // Link items to sale
        if (sale.getItems() != null) {
            for (SaleItem item : sale.getItems()) {
                item.setSale(sale);
            }
        }

        Sale savedSale = saleRepository.save(sale);

        // Deduct stock for each item sold
        updateStock(savedSale);

        // Send Telegram Notification
        try {
            String paymentName = savedSale.getPaymentMethod() != null ? savedSale.getPaymentMethod() : "Cash";
            String dateStr = savedSale.getDate() != null
                    ? savedSale.getDate().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy hh:mm a"))
                    : "N/A";

            String message = "✅ <b>ការលក់ថ្មីជោគជ័យ!</b>\n"
                    + "=======================\n"
                    + "👉 វិក្កយបត្រ: " + savedSale.getReferenceNo() + "\n"
                    + "📅 កាលបរិច្ឆេទ: " + dateStr + "\n"
                    + "💰 ទឹកប្រាក់សរុប: $" + savedSale.getGrandTotal() + "\n"
                    + "💳 ការទូទាត់: " + paymentName + "\n"
                    + "=======================\n"
                    + "🙏 <i>សូមអរគុណ!</i>";
                    

            telegramBotService.sendMessage(message);
        } catch (Exception e) {
            System.err.println("Error sending telegram notification: " + e.getMessage());
        }

        return savedSale;
    }

    @Transactional
    public void deleteSale(Long id) {
        Sale existing = saleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sale not found"));

        // Revert stock when a sale is deleted
        if (existing.getItems() != null) {
            for (SaleItem item : existing.getItems()) {
                if (item.getProduct() != null && item.getQuantity() != null) {
                    Product product = productRepository.findById(item.getProduct().getId()).orElse(null);
                    if (product != null) {
                        BigDecimal oldQty = product.getQuantity() != null ? product.getQuantity() : BigDecimal.ZERO;
                        BigDecimal baseUnits = item.getQuantity()
                                .multiply(calculateBaseUnitsMultiplier(item.getUnit()));
                        product.setQuantity(oldQty.add(baseUnits)); // add back to global stock
                        productRepository.save(product);

                        // Revert Warehouse Stock if warehouse is specified
                        if (existing.getWarehouse() != null && existing.getWarehouse().getId() != null) {
                            Stock stock = stockRepository.findByProductIdAndWarehouseId(product.getId(), existing.getWarehouse().getId()).orElse(null);
                            if (stock != null) {
                                BigDecimal currentStock = stock.getQuantity() != null ? stock.getQuantity() : BigDecimal.ZERO;
                                stock.setQuantity(currentStock.add(baseUnits));
                                stockRepository.save(stock);
                            }
                        }
                    }
                }
            }
        }

        saleRepository.deleteById(id);
    }

    private void updateStock(Sale sale) {
        if (sale.getItems() == null)
            return;

        for (SaleItem item : sale.getItems()) {
            if (item.getProduct() != null && item.getQuantity() != null
                    && item.getQuantity().compareTo(BigDecimal.ZERO) > 0) {
                Product product = productRepository.findById(item.getProduct().getId()).orElse(null);

                if (product != null) {
                    BigDecimal oldQty = product.getQuantity() != null ? product.getQuantity() : BigDecimal.ZERO;
                    BigDecimal baseUnits = item.getQuantity().multiply(calculateBaseUnitsMultiplier(item.getUnit()));

                    BigDecimal newQty = oldQty.subtract(baseUnits);
                    if (newQty.compareTo(BigDecimal.ZERO) < 0) {
                        newQty = BigDecimal.ZERO; // Prevent negative stock
                    }

                    product.setQuantity(newQty);
                    productRepository.save(product);

                    // Deduct from specific Warehouse Stock if warehouse is specified
                    if (sale.getWarehouse() != null && sale.getWarehouse().getId() != null) {
                        Stock stock = stockRepository.findByProductIdAndWarehouseId(product.getId(), sale.getWarehouse().getId())
                            .orElseGet(() -> {
                                Stock s = new Stock();
                                s.setProduct(product);
                                s.setWarehouse(sale.getWarehouse());
                                s.setQuantity(BigDecimal.ZERO);
                                return s;
                            });
                        BigDecimal currentStock = stock.getQuantity() != null ? stock.getQuantity() : BigDecimal.ZERO;
                        BigDecimal newStockQty = currentStock.subtract(baseUnits);
                        if (newStockQty.compareTo(BigDecimal.ZERO) < 0) {
                            newStockQty = BigDecimal.ZERO;
                        }
                        stock.setQuantity(newStockQty);
                        stockRepository.save(stock);
                    }
                }
            }
        }
    }

    private BigDecimal calculateBaseUnitsMultiplier(com.setec.operation_service.model.Unit unit) {
        if (unit == null || unit.getId() == null)
            return BigDecimal.ONE;

        BigDecimal totalMultiplier = BigDecimal.ONE;
        Long currentUnitId = unit.getId();

        while (currentUnitId != null) {
            com.setec.operation_service.model.Unit dbUnit = unitRepository.findById(currentUnitId).orElse(null);
            if (dbUnit == null)
                break;

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
                    // Ignore parsing error
                }
            }

            currentUnitId = dbUnit.getBaseUnitId();
        }

        return totalMultiplier;
    }
}
