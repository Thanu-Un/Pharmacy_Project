package com.setec.operation_service.controller;

import com.setec.operation_service.model.Expense;
import com.setec.operation_service.model.ExpenseCategory;
import com.setec.operation_service.repository.ExpenseCategoryRepository;
import com.setec.operation_service.repository.ExpenseRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/operation")
public class ExpenseController {

    private final ExpenseRepository expenseRepository;
    private final ExpenseCategoryRepository categoryRepository;

    public ExpenseController(ExpenseRepository expenseRepository, ExpenseCategoryRepository categoryRepository) {
        this.expenseRepository = expenseRepository;
        this.categoryRepository = categoryRepository;
    }

    // Expense Categories
    @GetMapping("/expense-categories")
    public ResponseEntity<List<ExpenseCategory>> getAllCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @PostMapping("/expense-categories")
    public ResponseEntity<ExpenseCategory> createCategory(@RequestBody ExpenseCategory category) {
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @DeleteMapping("/expense-categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Expenses
    @GetMapping("/expenses")
    public ResponseEntity<List<Expense>> getAllExpenses() {
        return ResponseEntity.ok(expenseRepository.findAllByOrderByDateDesc());
    }

    @PostMapping("/expenses")
    public ResponseEntity<Expense> createExpense(@RequestBody Expense expense) {
        if (expense.getDate() == null) {
            expense.setDate(LocalDateTime.now());
        }
        if (expense.getReferenceNo() == null || expense.getReferenceNo().isEmpty()) {
            expense.setReferenceNo("EXP-" + System.currentTimeMillis());
        }
        return ResponseEntity.ok(expenseRepository.save(expense));
    }

    @DeleteMapping("/expenses/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        expenseRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
