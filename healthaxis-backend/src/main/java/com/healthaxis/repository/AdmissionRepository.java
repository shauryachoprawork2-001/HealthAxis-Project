package com.healthaxis.repository;

import com.healthaxis.entity.Admission;
import com.healthaxis.enums.AdmissionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface AdmissionRepository extends JpaRepository<Admission, UUID> {
    Page<Admission> findByPatientIdAndDeletedFalse(UUID patientId, Pageable pageable);
    List<Admission> findByStatusAndDeletedFalse(AdmissionStatus status);
    List<Admission> findByHospitalBranchIdAndStatusAndDeletedFalse(UUID hospitalId, AdmissionStatus status);
}
