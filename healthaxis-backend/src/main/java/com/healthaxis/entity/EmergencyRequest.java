package com.healthaxis.entity;

import com.healthaxis.enums.EmergencyPriority;
import com.healthaxis.enums.EmergencyStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "emergency_requests", indexes = {
    @Index(name = "idx_emg_priority", columnList = "priority"),
    @Index(name = "idx_emg_status", columnList = "status"),
    @Index(name = "idx_emg_created", columnList = "createdAt")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmergencyRequest extends BaseEntity {
    @Column(nullable = false)
    private String patientName;

    private String patientAge;
    private String patientGender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmergencyPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmergencyStatus status = EmergencyStatus.WAITING;

    @Column(nullable = false)
    private String chiefComplaint;

    private String vitalSigns;
    private String triageNotes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_doctor_id")
    private Doctor assignedDoctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_bed_id")
    private BedInventory assignedBed;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_branch_id")
    private HospitalBranch hospitalBranch;

    private LocalDateTime triageTime;
    private LocalDateTime assignedTime;
    private String emergencyNumber;
    private String ambulanceNumber;
    private boolean ambulanceRequired;
    private Integer queuePosition;
}
