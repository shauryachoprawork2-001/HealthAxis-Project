package com.healthaxis.repository;

import com.healthaxis.entity.EmergencyRequest;
import com.healthaxis.enums.EmergencyPriority;
import com.healthaxis.enums.EmergencyStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface EmergencyRequestRepository extends JpaRepository<EmergencyRequest, UUID> {
    @Query("SELECT e FROM EmergencyRequest e WHERE e.deleted = false AND e.status IN ('WAITING', 'TRIAGED') " +
           "ORDER BY CASE e.priority WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END, e.createdAt ASC")
    List<EmergencyRequest> findActiveEmergencyQueueOrdered();

    Page<EmergencyRequest> findByHospitalBranchIdAndDeletedFalse(UUID hospitalId, Pageable pageable);
    List<EmergencyRequest> findByStatusAndDeletedFalse(EmergencyStatus status);
    long countByPriorityAndStatusAndDeletedFalse(EmergencyPriority priority, EmergencyStatus status);
}
