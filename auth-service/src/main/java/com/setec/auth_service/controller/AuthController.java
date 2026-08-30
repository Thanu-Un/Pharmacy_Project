package com.setec.auth_service.controller;

import com.setec.auth_service.dto.AuthResponse;
import com.setec.auth_service.dto.LoginRequest;
import com.setec.auth_service.dto.RegisterRequest;
import com.setec.auth_service.model.User;
import com.setec.auth_service.model.Role;
import com.setec.auth_service.repository.RoleRepository;
import com.setec.auth_service.repository.UserRepository;
import com.setec.auth_service.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            AuthResponse response = new AuthResponse();
            response.setMessage("Username already exists!");
            return ResponseEntity.badRequest().body(response);
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setGender(request.getGender());
        user.setProfile(request.getProfile());
        user.setPhone(request.getPhone());
        
        String roleName = "USER";
        if (request.getRole() != null && !request.getRole().trim().isEmpty()) {
            roleName = request.getRole().trim().toUpperCase();
        }

        if ("OWNER".equals(roleName)) {
            long ownerCount = userRepository.findAll().stream()
                    .filter(u -> u.getRole() != null && "OWNER".equalsIgnoreCase(u.getRole().getName()))
                    .count();
            if (ownerCount >= 1) {
                AuthResponse response = new AuthResponse();
                response.setMessage("System can only have one OWNER!");
                return ResponseEntity.badRequest().body(response);
            }
        }

        Role role = roleRepository.findByName(roleName).orElseGet(() -> {
            Role newRole = new Role();
            newRole.setName(roleName);
            newRole.setDescription("Auto-created role: " + roleName);
            return roleRepository.save(newRole);
        });
        
        user.setRole(role);

        userRepository.save(user);

        AuthResponse response = new AuthResponse();
        response.setMessage("User registered successfully!");
        response.setUsername(user.getUsername());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());

        if (userOpt.isEmpty() || !passwordEncoder.matches(request.getPassword(), userOpt.get().getPassword())) {
            AuthResponse response = new AuthResponse();
            response.setMessage("Invalid username or password!");
            return ResponseEntity.status(401).body(response);
        }

        AuthResponse response = new AuthResponse();
        response.setMessage("Login successful!");
        response.setUsername(userOpt.get().getUsername());

        java.util.List<String> perms = new java.util.ArrayList<>();
        if (userOpt.get().getRole() != null && userOpt.get().getRole().getPermissions() != null) {
            String permStr = userOpt.get().getRole().getPermissions().trim();
            if (permStr.startsWith("[") && permStr.endsWith("]")) {
                permStr = permStr.substring(1, permStr.length() - 1);
            }
            for (String p : permStr.split(",")) {
                String cleanP = p.replace("\"", "").trim();
                if (!cleanP.isEmpty()) {
                    perms.add(cleanP);
                }
            }
        }
        
        response.setPermissions(perms);
        
        // Generate real JWT token
        String token = jwtUtil.generateToken(userOpt.get().getUsername(), perms);
        response.setToken(token);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    public ResponseEntity<java.util.List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Admin reset endpoint removed for security reasons

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody RegisterRequest request) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        if (request.getUsername() != null && !request.getUsername().trim().isEmpty()) {
            user.setUsername(request.getUsername().trim());
        }
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword().trim()));
        }
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getGender() != null) user.setGender(request.getGender());
        if (request.getProfile() != null) user.setProfile(request.getProfile());

        if (request.getRole() != null && !request.getRole().trim().isEmpty()) {
            String roleName = request.getRole().trim().toUpperCase();
            
            if ("OWNER".equals(roleName)) {
                boolean isAlreadyOwner = user.getRole() != null && "OWNER".equalsIgnoreCase(user.getRole().getName());
                if (!isAlreadyOwner) {
                    long ownerCount = userRepository.findAll().stream()
                            .filter(u -> u.getRole() != null && "OWNER".equalsIgnoreCase(u.getRole().getName()))
                            .count();
                    if (ownerCount >= 1) {
                        return ResponseEntity.badRequest().body("System can only have one OWNER!");
                    }
                }
            }

            Role role = roleRepository.findByName(roleName).orElseGet(() -> {
                Role newRole = new Role();
                newRole.setName(roleName);
                newRole.setDescription("Auto-created role: " + roleName);
                return roleRepository.save(newRole);
            });
            user.setRole(role);
        }

        User updatedUser = userRepository.save(user);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent() && userOpt.get().getRole() != null && "OWNER".equalsIgnoreCase(userOpt.get().getRole().getName())) {
            return ResponseEntity.badRequest().body("Cannot delete the OWNER account!");
        }
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Role / Group Permissions Endpoints
    @GetMapping("/roles")
    public ResponseEntity<java.util.List<Role>> getAllRoles() {
        return ResponseEntity.ok(roleRepository.findAll());
    }

    @GetMapping("/roles/{id}")
    public ResponseEntity<Role> getRoleById(@PathVariable Long id) {
        return roleRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/roles")
    public ResponseEntity<Role> createRole(@RequestBody Role role) {
        if (role.getName() != null) {
            role.setName(role.getName().trim().toUpperCase());
        }
        return ResponseEntity.ok(roleRepository.save(role));
    }

    @PutMapping("/roles/{id}")
    public ResponseEntity<Role> updateRole(@PathVariable Long id, @RequestBody Role updated) {
        Optional<Role> roleOpt = roleRepository.findById(id);
        if (roleOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Role role = roleOpt.get();
        if (updated.getName() != null && !updated.getName().trim().isEmpty()) {
            role.setName(updated.getName().trim().toUpperCase());
        }
        if (updated.getDescription() != null) role.setDescription(updated.getDescription());
        if (updated.getPermissions() != null) role.setPermissions(updated.getPermissions());

        return ResponseEntity.ok(roleRepository.save(role));
    }

    @DeleteMapping("/roles/{id}")
    public ResponseEntity<Void> deleteRole(@PathVariable Long id) {
        roleRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
