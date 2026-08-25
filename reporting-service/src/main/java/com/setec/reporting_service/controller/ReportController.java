package com.setec.reporting_service.controller;

import com.setec.reporting_service.dto.ReportDTOs.*;
import com.setec.reporting_service.repository.ReportRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reporting")
@CrossOrigin(origins = "*") // Handled by gateway, but good to have
public class ReportController {

    private final ReportRepository reportRepository;

    public ReportController(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    @GetMapping("/sales-summary")
    public ResponseEntity<SalesSummary> getSalesSummary(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        return ResponseEntity.ok(reportRepository.getSalesSummary(startDate, endDate));
    }

    @GetMapping("/inventory-status")
    public ResponseEntity<InventoryStatus> getInventoryStatus() {
        return ResponseEntity.ok(reportRepository.getInventoryStatus());
    }

    @GetMapping("/top-medicines")
    public ResponseEntity<List<TopSellingMedicine>> getTopSellingMedicines(
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(reportRepository.getTopSellingMedicines(startDate, endDate, limit));
    }

    @GetMapping("/daily-sales")
    public ResponseEntity<List<DailySales>> getDailySales(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        return ResponseEntity.ok(reportRepository.getDailySales(startDate, endDate));
    }

    @GetMapping("/products-report")
    public ResponseEntity<List<ProductReport>> getProductReport(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return ResponseEntity.ok(reportRepository.getProductReport(startDate, endDate));
    }

    @GetMapping("/categories-report")
    public ResponseEntity<List<CategoryReport>> getCategoriesReport(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return ResponseEntity.ok(reportRepository.getCategoriesReport(startDate, endDate));
    }

    @GetMapping("/purchase-items-report")
    public ResponseEntity<List<PurchaseItemReport>> getPurchaseItemReport(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return ResponseEntity.ok(reportRepository.getPurchaseItemReport(startDate, endDate));
    }

    @GetMapping("/profit-loss-report")
    public ResponseEntity<List<ProfitLossReport>> getProfitLossReport(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return ResponseEntity.ok(reportRepository.getProfitLossReport(startDate, endDate));
    }

    @GetMapping("/monthly-profit-loss-report")
    public ResponseEntity<List<MonthlyProfitLossReport>> getMonthlyProfitLossReport(
            @RequestParam(required = false, defaultValue = "2026") int year) {
        return ResponseEntity.ok(reportRepository.getMonthlyProfitLossReport(year));
    }
}
