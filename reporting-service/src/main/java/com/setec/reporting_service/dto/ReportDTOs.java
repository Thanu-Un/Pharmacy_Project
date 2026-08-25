package com.setec.reporting_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

public class ReportDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SalesSummary {
        private BigDecimal totalRevenue;
        private BigDecimal totalCost;
        private BigDecimal netProfit;
        private Long invoiceCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InventoryStatus {
        private BigDecimal totalStockValue;
        private Long totalItems;
        private Long lowStockItems;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopSellingMedicine {
        private String medicineName;
        private Long quantitySold;
        private BigDecimal totalRevenue;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailySales {
        private String date; // YYYY-MM-DD format
        private BigDecimal revenue;
        private Long invoices;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductReport {
        private String productCode;
        private String productName;
        private Long purchasedQty;
        private BigDecimal purchasedAmt;
        private Long soldQty;
        private BigDecimal soldAmt;
        private Long stockQty;
        private BigDecimal stockAmt;
        private BigDecimal profitLoss;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryReport {
        private String categoryCode;
        private String categoryName;
        private Long purchasedQty;
        private BigDecimal purchasedAmt;
        private Long soldQty;
        private BigDecimal soldAmt;
        private BigDecimal profitLoss;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PurchaseItemReport {
        private String date;
        private String referenceNo;
        private String supplier;
        private String productCode;
        private String product;
        private Long quantity;
        private BigDecimal price;
        private BigDecimal total;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProfitLossReport {
        private String date;
        private BigDecimal revenue;
        private BigDecimal cost;
        private BigDecimal profit;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyProfitLossReport {
        private String month; // January, February, etc.
        private BigDecimal totalSale = BigDecimal.ZERO;
        private BigDecimal totalDiscount = BigDecimal.ZERO;
        private BigDecimal totalNetIncome = BigDecimal.ZERO;
        private BigDecimal costOfGoodsSold = BigDecimal.ZERO;
        private BigDecimal grossProfit = BigDecimal.ZERO;
        private BigDecimal electricity = BigDecimal.ZERO;
        private BigDecimal rental = BigDecimal.ZERO;
        private BigDecimal security = BigDecimal.ZERO;
        private BigDecimal staffSalary = BigDecimal.ZERO;
        private BigDecimal waterExpense = BigDecimal.ZERO;
        private BigDecimal gas = BigDecimal.ZERO;
        private BigDecimal internetExpense = BigDecimal.ZERO;
        private BigDecimal officeSupplyExpense = BigDecimal.ZERO;
        private BigDecimal repairMaintenance = BigDecimal.ZERO;
        private BigDecimal fixedAssets = BigDecimal.ZERO;
        private BigDecimal otherExpenses = BigDecimal.ZERO;
        private BigDecimal otherCosting = BigDecimal.ZERO;
        private BigDecimal totalExpenses = BigDecimal.ZERO;
        private BigDecimal netProfit = BigDecimal.ZERO;
    }
}
