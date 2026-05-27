package com.healthaxis.service.impl;

import com.healthaxis.enums.AdmissionStatus;
import com.healthaxis.enums.AppointmentStatus;
import com.healthaxis.enums.BedStatus;
import com.healthaxis.enums.EmergencyStatus;
import com.healthaxis.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final AppointmentRepository appointmentRepository;
    private final AdmissionRepository admissionRepository;
    private final EmergencyRequestRepository emergencyRepository;
    private final BedInventoryRepository bedRepository;
    private final InvoiceRepository invoiceRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    @Transactional(readOnly = true)
    @Cacheable(value = "occupancy", key = "#hospitalId")
    public Map<String, Object> getOccupancyStats(UUID hospitalId) {
        long total = bedRepository.countByHospitalAndStatus(hospitalId, null);
        long occupied = bedRepository.countByHospitalAndStatus(hospitalId, BedStatus.OCCUPIED);
        long available = bedRepository.countByHospitalAndStatus(hospitalId, BedStatus.AVAILABLE);
        long reserved = bedRepository.countByHospitalAndStatus(hospitalId, BedStatus.RESERVED);

        double occupancyRate = total > 0 ? (double) occupied / total * 100 : 0;

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalBeds", total);
        stats.put("occupiedBeds", occupied);
        stats.put("availableBeds", available);
        stats.put("reservedBeds", reserved);
        stats.put("occupancyRate", Math.round(occupancyRate * 10.0) / 10.0);
        return stats;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAdminDashboardStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0);
        LocalDateTime startOfLastMonth = startOfMonth.minusMonths(1);

        long totalPatients = patientRepository.count();
        long totalDoctors = doctorRepository.count();
        long activeAdmissions = admissionRepository.findByStatusAndDeletedFalse(AdmissionStatus.ADMITTED).size();
        long emergencyWaiting = emergencyRepository.findActiveEmergencyQueueOrdered().size();

        BigDecimal revenueThisMonth = invoiceRepository.sumRevenueInPeriod(startOfMonth, now);
        BigDecimal revenueLastMonth = invoiceRepository.sumRevenueInPeriod(startOfLastMonth, startOfMonth);

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalPatients", totalPatients);
        stats.put("totalDoctors", totalDoctors);
        stats.put("activeAdmissions", activeAdmissions);
        stats.put("emergencyQueueSize", emergencyWaiting);
        stats.put("revenueThisMonth", revenueThisMonth != null ? revenueThisMonth : BigDecimal.ZERO);
        stats.put("revenueLastMonth", revenueLastMonth != null ? revenueLastMonth : BigDecimal.ZERO);
        stats.put("generatedAt", now);
        return stats;
    }
}
