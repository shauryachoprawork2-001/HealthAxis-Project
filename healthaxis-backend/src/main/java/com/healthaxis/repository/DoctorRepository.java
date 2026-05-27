package com.healthaxis.repository;

import com.healthaxis.entity.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, UUID> {
    Optional<Doctor> findByUserIdAndDeletedFalse(UUID userId);
    Optional<Doctor> findByLicenseNumberAndDeletedFalse(String licenseNumber);
    Page<Doctor> findBySpecializationContainingIgnoreCaseAndDeletedFalse(String specialization, Pageable pageable);
    Page<Doctor> findByHospitalBranchIdAndDeletedFalse(UUID hospitalBranchId, Pageable pageable);
    Page<Doctor> findByAvailableTrueAndDeletedFalse(Pageable pageable);

    @Query("SELECT d FROM Doctor d WHERE d.deleted = false AND " +
           "(:specialization IS NULL OR LOWER(d.specialization) LIKE LOWER(CONCAT('%', :specialization, '%'))) AND " +
           "(:hospitalId IS NULL OR d.hospitalBranch.id = :hospitalId) AND " +
           "(:available IS NULL OR d.available = :available)")
    Page<Doctor> searchDoctors(@Param("specialization") String specialization,
                               @Param("hospitalId") UUID hospitalId,
                               @Param("available") Boolean available,
                               Pageable pageable);
}
