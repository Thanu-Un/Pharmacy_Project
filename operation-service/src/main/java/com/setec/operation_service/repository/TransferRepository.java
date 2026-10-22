package com.setec.operation_service.repository;

import com.setec.operation_service.model.Transfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransferRepository extends JpaRepository<Transfer, Long> {
    Optional<Transfer> findByReferenceNo(String referenceNo);
    List<Transfer> findByFromWarehouseIdOrToWarehouseId(Long fromId, Long toId);
}
