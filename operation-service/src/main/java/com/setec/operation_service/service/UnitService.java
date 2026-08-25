package com.setec.operation_service.service;

import com.setec.operation_service.model.Unit;
import com.setec.operation_service.repository.UnitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UnitService {

    @Autowired
    private UnitRepository unitRepository;

    public List<Unit> getAllUnits() {
        return unitRepository.findAll();
    }

    public Optional<Unit> getUnitById(Long id) {
        return unitRepository.findById(id);
    }

    public Unit createUnit(Unit unit) {
        if (unitRepository.existsByCode(unit.getCode())) {
            throw new RuntimeException("Unit Code already exists!");
        }
        return unitRepository.save(unit);
    }

    public Unit updateUnit(Long id, Unit unitDetails) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Unit not found"));

        unit.setName(unitDetails.getName());
        unit.setBaseUnitId(unitDetails.getBaseUnitId());
        unit.setOperator(unitDetails.getOperator());
        unit.setOperationValue(unitDetails.getOperationValue());
        unit.setUnitValue(unitDetails.getUnitValue());

        return unitRepository.save(unit);
    }

    public void deleteUnit(Long id) {
        if (!unitRepository.existsById(id)) {
            throw new RuntimeException("Unit not found");
        }
        unitRepository.deleteById(id);
    }
}
