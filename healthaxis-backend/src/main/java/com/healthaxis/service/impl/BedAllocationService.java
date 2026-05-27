package com.healthaxis.service.impl;

import com.healthaxis.dto.request.BedAllocationRequest;
import com.healthaxis.entity.*;
import com.healthaxis.enums.AdmissionStatus;
import com.healthaxis.enums.BedStatus;
import com.healthaxis.exception.BusinessException;
import com.healthaxis.exception.ResourceNotFoundException;
import com.healthaxis.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BedAllocationService {
    private final BedInventoryRepository bedRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AdmissionRepository admissionRepository;

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public Admission allocateBed(BedAllocationRequest request) {
        BedInventory bed = bedRepository.findByIdWithLock(request.getBedId())
            .orElseThrow(() -> new ResourceNotFoundException("Bed not found"));

        if (bed.getStatus() != BedStatus.AVAILABLE) {
            throw new BusinessException("Bed " + bed.getBedNumber() + " is not available (status: " + bed.getStatus() + ")");
        }

        Patient patient = patientRepository.findById(request.getPatientId())
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        Doctor doctor = doctorRepository.findById(request.getAdmittingDoctorId())
            .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        bed.setStatus(BedStatus.OCCUPIED);
        bedRepository.save(bed);

        String admissionNumber = "ADM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Admission admission = Admission.builder()
            .admissionNumber(admissionNumber)
            .patient(patient)
            .bed(bed)
            .admittingDoctor(doctor)
            .hospitalBranch(bed.getWard().getHospitalBranch())
            .admittedAt(LocalDateTime.now())
            .admissionReason(request.getAdmissionReason())
            .diagnosis(request.getDiagnosis())
            .status(AdmissionStatus.ADMITTED)
            .build();

        log.info("Bed {} allocated to patient {} (admission {})",
            bed.getBedNumber(), patient.getMedicalRecordNumber(), admissionNumber);

        return admissionRepository.save(admission);
    }

    @Transactional
    public Admission discharge(UUID admissionId, String dischargeNotes) {
        Admission admission = admissionRepository.findById(admissionId)
            .filter(a -> !a.isDeleted())
            .orElseThrow(() -> new ResourceNotFoundException("Admission not found"));

        if (admission.getStatus() == AdmissionStatus.DISCHARGED) {
            throw new BusinessException("Patient already discharged");
        }

        admission.setStatus(AdmissionStatus.DISCHARGED);
        admission.setDischargedAt(LocalDateTime.now());
        admission.setDischargeNotes(dischargeNotes);

        BedInventory bed = admission.getBed();
        if (bed != null) {
            bed.setStatus(BedStatus.AVAILABLE);
            bedRepository.save(bed);
        }

        log.info("Patient discharged from admission {}", admission.getAdmissionNumber());
        return admissionRepository.save(admission);
    }
}
