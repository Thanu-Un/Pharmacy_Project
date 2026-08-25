package com.setec.operation_service.service;

import com.setec.operation_service.model.Category;
import com.setec.operation_service.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    // ថ្នាក់ Service នេះនឹងក្លាយជាកន្លែងប្រមូលមុខងារផ្សេងៗ សម្រាប់គ្រប់គ្រង
    // ប្រភេទទំនិញ

    // ២.১ មុខងាររក្សាទុកទិន្នន័យថ្មី (CREATE)
    public Category createCategory(Category category) {
        // អាចបន្ថែម logic ត្រួតពិនិត្យអីវ៉ាន់នៅទីនេះបាន
        // ឧទាហរណ៍៖ បើមាន code ដូចគ្នា សូមហៅ error
        if (categoryRepository.findByCode(category.getCode()).isPresent()) {
            throw new RuntimeException("Category Code: " + category.getCode() + " is already exists!");
        }
        return categoryRepository.save(category);
    }

    // ២.២ មុខងារទាញយកបញ្ជីទាំងអស់ (READ ALL)
    public List<Category> getAllCategories() {
        return categoryRepository.findAll(); // លេខកូដនេះគឺទាញយកចេញពី JpaRepository
    }

    // ២.៣ មុខងារទាញយកតែមួយតាម ID (READ ONE)
    public Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }

    // ២.៤ មុខងារកែប្រែទិន្នន័យ (UPDATE) (Optional)
    public Category updateCategory(Long id, Category updatedCategory) {
        return categoryRepository.findById(id).map(existingCategory -> {
            existingCategory.setName(updatedCategory.getName());
            existingCategory.setDescription(updatedCategory.getDescription());
            // កុំកែ ID និង Code (បើមិនចង់ឱ្យ User កែ Code ទេ)
            return categoryRepository.save(existingCategory);
        }).orElseThrow(() -> new RuntimeException("Category not found with ID: " + id));
    }

    // ២.៥ មុខងារលុបទិន្នន័យ (DELETE) (Optional)
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("Category not found with ID: " + id);
        }
        categoryRepository.deleteById(id);
    }
}
