package com.healthaxis.repository;

import com.healthaxis.entity.HospitalBranch;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HospitalBranchRepository extends JpaRepository<HospitalBranch, UUID> {
    Optional<HospitalBranch> findByBranchCodeAndDeletedFalse(String branchCode);
    Page<HospitalBranch> findByActiveTrueAndDeletedFalse(Pageable pageable);

    @Query("SELECT h FROM HospitalBranch h WHERE h.deleted = false AND h.active = true AND " +
           "(LOWER(h.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(h.city) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<HospitalBranch> searchHospitals(@Param("search") String search, Pageable pageable);
}
