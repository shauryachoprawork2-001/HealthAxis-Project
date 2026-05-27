package com.healthaxis.service.impl;

import com.healthaxis.dto.request.AppointmentRequest;
import com.healthaxis.dto.response.ApiResponse;
import com.healthaxis.dto.response.PageResponse;
import com.healthaxis.entity.*;
import com.healthaxis.enums.AppointmentStatus;
import com.healthaxis.exception.BusinessException;
import com.healthaxis.exception.ConflictException;
import com.healthaxis.exception.ResourceNotFoundException;
import com.healthaxis.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final HospitalBranchRepository hospitalBranchRepository;
    private final ConsultationSlotRepository consultationSlotRepository;
    private final NotificationService notificationService;

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public Appointment bookAppointment(UUID patientUserId, AppointmentRequest request) {
        Patient patient = patientRepository.findByUserIdAndDeletedFalse(patientUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
            .filter(d -> !d.isDeleted())
            .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", request.getDoctorId()));

        if (!doctor.isAvailable()) {
            throw new BusinessException("Doctor is not currently available for appointments");
        }

        HospitalBranch branch = hospitalBranchRepository.findById(request.getHospitalBranchId())
            .filter(h -> !h.isDeleted())
            .orElseThrow(() -> new ResourceNotFoundException("Hospital branch not found"));

        // Check for conflicting appointments
        List<Appointment> conflicts = appointmentRepository.findDoctorAppointmentsInRange(
            doctor.getId(),
            request.getScheduledAt().minusMinutes(29),
            request.getScheduledAt().plusMinutes(29)
        );
        if (!conflicts.isEmpty()) {
            throw new ConflictException("Doctor already has an appointment at this time slot");
        }

        // Handle slot reservation if provided
        if (request.getConsultationSlotId() != null) {
            ConsultationSlot slot = consultationSlotRepository.findByIdWithLock(request.getConsultationSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Consultation slot not found"));
            if (!slot.isAvailable()) {
                throw new ConflictException("This time slot is no longer available");
            }
            slot.setAvailable(false);
            consultationSlotRepository.save(slot);
        }

        String appointmentNumber = "APT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Appointment appointment = Appointment.builder()
            .patient(patient)
            .doctor(doctor)
            .hospitalBranch(branch)
            .scheduledAt(request.getScheduledAt())
            .reasonForVisit(request.getReasonForVisit())
            .symptoms(request.getSymptoms())
            .consultationType(request.getConsultationType())
            .status(AppointmentStatus.SCHEDULED)
            .appointmentNumber(appointmentNumber)
            .durationMinutes(30)
            .build();

        appointment = appointmentRepository.save(appointment);

        // Send confirmation notification async
        notificationService.sendAppointmentConfirmation(appointment);

        log.info("Appointment {} booked for patient {} with doctor {}",
            appointmentNumber, patient.getMedicalRecordNumber(), doctor.getLicenseNumber());

        return appointment;
    }

    @Transactional
    public Appointment cancelAppointment(UUID appointmentId, UUID userId, String reason) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
            .filter(a -> !a.isDeleted())
            .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));

        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BusinessException("Cannot cancel a completed appointment");
        }
        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new BusinessException("Appointment is already cancelled");
        }
        if (appointment.getScheduledAt().isBefore(LocalDateTime.now().plusHours(2))) {
            throw new BusinessException("Cannot cancel appointment within 2 hours of scheduled time");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancellationReason(reason);
        appointment.setCancelledAt(LocalDateTime.now());

        // Release slot if applicable
        if (appointment.getConsultationSlot() != null) {
            ConsultationSlot slot = appointment.getConsultationSlot();
            slot.setAvailable(true);
            consultationSlotRepository.save(slot);
        }

        return appointmentRepository.save(appointment);
    }

    @Transactional(readOnly = true)
    public PageResponse<Appointment> getPatientAppointments(UUID patientUserId, Pageable pageable) {
        Patient patient = patientRepository.findByUserIdAndDeletedFalse(patientUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));
        Page<Appointment> page = appointmentRepository.findByPatientIdAndDeletedFalse(patient.getId(), pageable);
        return PageResponse.from(page);
    }

    @Transactional(readOnly = true)
    public PageResponse<Appointment> getDoctorAppointments(UUID doctorUserId, Pageable pageable) {
        Doctor doctor = doctorRepository.findByUserIdAndDeletedFalse(doctorUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
        Page<Appointment> page = appointmentRepository.findByDoctorIdAndDeletedFalse(doctor.getId(), pageable);
        return PageResponse.from(page);
    }

    @Transactional
    public Appointment updateStatus(UUID appointmentId, AppointmentStatus newStatus) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
            .filter(a -> !a.isDeleted())
            .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));
        appointment.setStatus(newStatus);
        return appointmentRepository.save(appointment);
    }
}
