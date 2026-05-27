package com.healthaxis.service.impl;

import com.healthaxis.dto.request.EmergencyRequest;
import com.healthaxis.entity.*;
import com.healthaxis.enums.BedStatus;
import com.healthaxis.enums.EmergencyPriority;
import com.healthaxis.enums.EmergencyStatus;
import com.healthaxis.exception.BusinessException;
import com.healthaxis.exception.ResourceNotFoundException;
import com.healthaxis.repository.*;
import com.healthaxis.websocket.EmergencyWebSocketHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmergencyService {
    private final EmergencyRequestRepository emergencyRepository;
    private final BedInventoryRepository bedRepository;
    private final DoctorRepository doctorRepository;
    private final HospitalBranchRepository hospitalRepository;
    private final PatientRepository patientRepository;
    private final EmergencyWebSocketHandler wsHandler;

    @Transactional
    public com.healthaxis.entity.EmergencyRequest createEmergency(EmergencyRequest request) {
        HospitalBranch hospital = hospitalRepository.findById(request.getHospitalBranchId())
            .orElseThrow(() -> new ResourceNotFoundException("Hospital branch not found"));

        String emergencyNumber = "EMG-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        com.healthaxis.entity.EmergencyRequest emergency = com.healthaxis.entity.EmergencyRequest.builder()
            .patientName(request.getPatientName())
            .patientAge(request.getPatientAge())
            .patientGender(request.getPatientGender())
            .priority(request.getPriority())
            .status(EmergencyStatus.WAITING)
            .chiefComplaint(request.getChiefComplaint())
            .hospitalBranch(hospital)
            .ambulanceRequired(request.isAmbulanceRequired())
            .emergencyNumber(emergencyNumber)
            .build();

        if (request.getExistingPatientId() != null) {
            patientRepository.findById(request.getExistingPatientId())
                .ifPresent(emergency::setPatient);
        }

        emergency = emergencyRepository.save(emergency);
        wsHandler.broadcastEmergencyUpdate(emergency);
        log.warn("EMERGENCY {} created: Priority={}, Complaint={}",
            emergencyNumber, request.getPriority(), request.getChiefComplaint());
        return emergency;
    }

    @Transactional
    public com.healthaxis.entity.EmergencyRequest triage(UUID emergencyId, EmergencyPriority priority, String notes) {
        com.healthaxis.entity.EmergencyRequest emergency = findById(emergencyId);
        emergency.setPriority(priority);
        emergency.setTriageNotes(notes);
        emergency.setTriageTime(LocalDateTime.now());
        emergency.setStatus(EmergencyStatus.TRIAGED);
        emergency = emergencyRepository.save(emergency);
        wsHandler.broadcastEmergencyUpdate(emergency);
        return emergency;
    }

    @Transactional
    public com.healthaxis.entity.EmergencyRequest assignDoctor(UUID emergencyId, UUID doctorId) {
        com.healthaxis.entity.EmergencyRequest emergency = findById(emergencyId);
        Doctor doctor = doctorRepository.findById(doctorId)
            .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        emergency.setAssignedDoctor(doctor);
        emergency.setAssignedTime(LocalDateTime.now());
        emergency.setStatus(EmergencyStatus.ASSIGNED);
        emergency = emergencyRepository.save(emergency);
        wsHandler.broadcastEmergencyUpdate(emergency);
        return emergency;
    }

    @Transactional
    public com.healthaxis.entity.EmergencyRequest assignBed(UUID emergencyId, UUID bedId) {
        com.healthaxis.entity.EmergencyRequest emergency = findById(emergencyId);
        BedInventory bed = bedRepository.findByIdWithLock(bedId)
            .orElseThrow(() -> new ResourceNotFoundException("Bed not found"));
        if (bed.getStatus() != BedStatus.AVAILABLE) {
            throw new BusinessException("Bed is not available");
        }
        bed.setStatus(BedStatus.OCCUPIED);
        bedRepository.save(bed);
        emergency.setAssignedBed(bed);
        emergency.setStatus(EmergencyStatus.IN_TREATMENT);
        emergency = emergencyRepository.save(emergency);
        wsHandler.broadcastEmergencyUpdate(emergency);
        return emergency;
    }

    @Transactional(readOnly = true)
    public List<com.healthaxis.entity.EmergencyRequest> getActiveQueue() {
        return emergencyRepository.findActiveEmergencyQueueOrdered();
    }

    private com.healthaxis.entity.EmergencyRequest findById(UUID id) {
        return emergencyRepository.findById(id)
            .filter(e -> !e.isDeleted())
            .orElseThrow(() -> new ResourceNotFoundException("Emergency request", "id", id));
    }
}
