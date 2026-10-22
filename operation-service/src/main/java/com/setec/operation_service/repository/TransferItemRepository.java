package com.setec.operation_service.repository;

import com.setec.operation_service.model.TransferItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransferItemRepository extends JpaRepository<TransferItem, Long> {
}
