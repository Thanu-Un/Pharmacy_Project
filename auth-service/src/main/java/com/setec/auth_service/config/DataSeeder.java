package com.setec.auth_service.config;

import com.setec.auth_service.model.Role;
import com.setec.auth_service.model.User;
import com.setec.auth_service.repository.RoleRepository;
import com.setec.auth_service.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Seed Admin Role if it doesn't exist
        Optional<Role> adminRoleOpt = roleRepository.findByName("Admin");
        Role adminRole;
        if (adminRoleOpt.isEmpty()) {
            adminRole = new Role();
            adminRole.setName("Admin");
            adminRole.setDescription("System Administrator with all privileges");
            
            // Comma-separated or JSON list of all possible permissions for the frontend
            adminRole.setPermissions("[\"dashboard_view\",\"category_view\",\"category_add\",\"category_edit\",\"category_delete\",\"unit_view\",\"unit_add\",\"unit_edit\",\"unit_delete\",\"medicine_view\",\"medicine_add\",\"medicine_edit\",\"medicine_delete\",\"medicine_import\",\"medicine_barcode\",\"purchase_view\",\"purchase_add\",\"purchase_edit\",\"purchase_delete\",\"pos_access\",\"pos_sales_view\",\"pos_discount\",\"pos_sale_delete\",\"supplier_view\",\"supplier_add\",\"supplier_edit\",\"supplier_delete\",\"patient_view\",\"patient_add\",\"patient_edit\",\"patient_delete\",\"staff_view\",\"staff_register\",\"staff_edit\",\"staff_delete\",\"setting_payment\",\"setting_currency\",\"setting_permissions\",\"report_view\",\"expense_view\",\"expense_add\",\"expense_edit\",\"expense_delete\"]");
            
            adminRole = roleRepository.save(adminRole);
            System.out.println("Seeded default 'Admin' role.");
        } else {
            adminRole = adminRoleOpt.get();
        }

        // Seed Admin User if it doesn't exist
        if (userRepository.findByUsername("owner").isEmpty()) {
            User adminUser = new User();
            adminUser.setUsername("owner");
            adminUser.setPassword(passwordEncoder.encode("admin123"));
            adminUser.setFirstName("Super");
            adminUser.setLastName("Owner");
            adminUser.setRole(adminRole);
            
            userRepository.save(adminUser);
            System.out.println("Seeded default 'owner' user with password 'admin123'.");
        }
    }
}
