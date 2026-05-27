package com.healthaxis.entity;

import com.healthaxis.enums.AppointmentStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments", indexes = {
    @Index(name = "idx_appt_patient", columnList = "patient_id"),
    @Index(name = "idx_appt_doctor", columnList = "doctor_id"),
    @Index(name = "idx_appt_status", columnList = "status"),
    @Index(name = "idx_appt_scheduled", columnList = "scheduledAt")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Appointment extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_branch_id")
    private HospitalBranch hospitalBranch;

    @Column(nullable = false)
    private LocalDateTime scheduledAt;

    private Integer durationMinutes = 30;
    private String reasonForVisit;
    private String symptoms;
    private String notes;
    private String consultationType;   // IN_PERSON, VIDEO, PHONE

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppointmentStatus status = AppointmentStatus.SCHEDULED;

    private String cancellationReason;
    private LocalDateTime cancelledAt;
    private String appointmentNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consultation_slot_id")
    private ConsultationSlot consultationSlot;
}
