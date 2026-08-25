package com.setec.operation_service.service;

import com.setec.operation_service.model.Staff;
import com.setec.operation_service.repository.StaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StaffService {

    @Autowired
    private StaffRepository staffRepository;

    public List<Staff> getAllStaff() {
        return staffRepository.findAll();
    }

    public Optional<Staff> getStaffById(Long id) {
        return staffRepository.findById(id);
    }

    public Staff saveStaff(Staff staff) {
        if (staff.getCode() == null || staff.getCode().trim().isEmpty()) {
            staff.setCode("STF-" + Math.floor(1000 + Math.random() * 9000));
        }
        return staffRepository.save(staff);
    }

    public Staff updateStaff(Long id, Staff updated) {
        Staff existing = staffRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Staff not found with id: " + id));

        if (updated.getName() != null) existing.setName(updated.getName());
        if (updated.getGender() != null) existing.setGender(updated.getGender());
        if (updated.getPhone() != null) existing.setPhone(updated.getPhone());
        if (updated.getEmail() != null) existing.setEmail(updated.getEmail());
        if (updated.getRole() != null) existing.setRole(updated.getRole());
        if (updated.getSalary() != null) existing.setSalary(updated.getSalary());
        if (updated.getStatus() != null) existing.setStatus(updated.getStatus());
        if (updated.getJoinedDate() != null) existing.setJoinedDate(updated.getJoinedDate());

        return staffRepository.save(existing);
    }

    public void deleteStaff(Long id) {
        staffRepository.deleteById(id);
    }
}
