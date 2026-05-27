package com.healthaxis.repository;

import com.healthaxis.entity.BedInventory;
import com.healthaxis.enums.BedStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BedInventoryRepository extends JpaRepository<BedInventory, UUID> {
    List<BedInventory> findByWardIdAndStatusAndDeletedFalse(UUID wardId, BedStatus status);
    List<BedInventory> findByWardHospitalBranchIdAndDeletedFalse(UUID hospitalBranchId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM BedInventory b WHERE b.id = :id AND b.deleted = false")
    Optional<BedInventory> findByIdWithLock(@Param("id") UUID id);

    @Query("SELECT COUNT(b) FROM BedInventory b WHERE b.ward.hospitalBranch.id = :hospitalId AND " +
           "b.status = :status AND b.deleted = false")
    long countByHospitalAndStatus(@Param("hospitalId") UUID hospitalId, @Param("status") BedStatus status);

    @Query("SELECT b.status, COUNT(b) FROM BedInventory b WHERE b.ward.id = :wardId AND b.deleted = false GROUP BY b.status")
    List<Object[]> getOccupancySummaryByWard(@Param("wardId") UUID wardId);
}
