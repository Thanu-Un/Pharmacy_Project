package com.setec.operation_service.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "categories")
@Data
public class Category {

    // ១. id (int) : លេខរៀងសម្គាល់ប្រភេទនីមួយៗ
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // នៅក្នង Java យើងច្រើនប្រើ Long សម្រាប់ Id (ជាប្រភេទលេខគត់)

    // ២. code (varchar) : លេខកូដសម្គាល់ប្រភេទ (ឧ. CAT-001)
    @Column(nullable = false, unique = true, length = 50)
    private String code; // varchar ត្រូវគ្នានឹង String

    // ៣. name (varchar) : ឈ្មោះប្រភេទ (Category Name)
    @Column(nullable = false)
    private String name;

    // ៤. description (varchar) : ការពណ៌នាលម្អិតពីប្រភេទនោះ
    private String description;

}
