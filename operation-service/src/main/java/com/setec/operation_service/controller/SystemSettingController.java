package com.setec.operation_service.controller;

import com.setec.operation_service.model.SystemSetting;
import com.setec.operation_service.repository.SystemSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/operation/settings")
@CrossOrigin(origins = "*")
public class SystemSettingController {

    @Autowired
    private SystemSettingRepository settingRepository;

    @GetMapping
    public ResponseEntity<List<SystemSetting>> getAllSettings() {
        return ResponseEntity.ok(settingRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<SystemSetting> saveOrUpdateSetting(@RequestBody Map<String, String> payload) {
        String key = payload.get("settingKey");
        String value = payload.get("settingValue");

        if (key == null || key.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        SystemSetting setting = settingRepository.findBySettingKey(key)
                .orElseGet(() -> {
                    SystemSetting s = new SystemSetting();
                    s.setSettingKey(key);
                    return s;
                });

        setting.setSettingValue(value);
        return ResponseEntity.ok(settingRepository.save(setting));
    }
}
