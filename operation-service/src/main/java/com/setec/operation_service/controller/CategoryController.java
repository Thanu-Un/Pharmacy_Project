package com.setec.operation_service.controller;

import com.setec.operation_service.model.Category;
import com.setec.operation_service.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/operation/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    // ៣.១ ប្រកាសទ្វារសម្រាប់រក្សាទុកទិន្នន័យ (POST)
    @PostMapping
    public ResponseEntity<Category> createCategory(@RequestBody Category category) {
        Category savedCategory = categoryService.createCategory(category);
        return ResponseEntity.ok(savedCategory);
    }

    // ៣.២ ប្រកាសទ្វារសម្រាប់ទាញយកបញ្ជីទាំងអស់ (GET)
    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    // ៣.៣ ប្រកាសទ្វារសម្រាប់ទាញយកតែមួយតាម ID (GET)
    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable Long id) {
        return categoryService.getCategoryById(id)
                .map(category -> ResponseEntity.ok(category))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ៣.៤ ប្រកាសទ្វារសម្រាប់កែប្រែទិន្នន័យ (PUT)
    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id, @RequestBody Category updatedCategory) {
        try {
            Category updated = categoryService.updateCategory(id, updatedCategory);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ៣.៥ ប្រកាសទ្វារសម្រាប់លុបទិន្នន័យ (DELETE)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        try {
            categoryService.deleteCategory(id);
            return ResponseEntity.noContent().build(); // 204 No Content
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
