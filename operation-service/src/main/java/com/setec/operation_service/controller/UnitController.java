package com.setec.operation_service.controller;

import com.setec.operation_service.model.Unit;
import com.setec.operation_service.service.UnitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/operation/units")
public class UnitController {

    @Autowired
    private UnitService unitService;

    @GetMapping
    public List<Unit> getAllUnits() {
        return unitService.getAllUnits();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Unit> getUnitById(@PathVariable Long id) {
        return unitService.getUnitById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createUnit(@RequestBody Unit unit) {
        try {
            Unit savedUnit = unitService.createUnit(unit);
            return ResponseEntity.ok(savedUnit);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUnit(@PathVariable Long id, @RequestBody Unit unit) {
        try {
            Unit updatedUnit = unitService.updateUnit(id, unit);
            return ResponseEntity.ok(updatedUnit);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUnit(@PathVariable Long id) {
        try {
            unitService.deleteUnit(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
