package com.setec.operation_service.repository;

import com.setec.operation_service.model.Unit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UnitRepository extends JpaRepository<Unit, Long> {
    Optional<Unit> findByCode(String code);
    boolean existsByCode(String code);
}
