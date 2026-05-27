package com.healthaxis.entity;

import com.healthaxis.enums.AdmissionStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "admissions", indexes = {
    @Index(name = "idx_admission_patient", columnList = "patient_id"),
    @Index(name = "idx_admission_status", columnList = "status"),
    @Index(name = "idx_admission_number", columnList = "admissionNumber")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Admission extends BaseEntity {
    @Column(nullable = false, unique = true)
    private String admissionNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bed_id")
    private BedInventory bed;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admitting_doctor_id")
    private Doctor admittingDoctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_branch_id")
    private HospitalBranch hospitalBranch;

    @Column(nullable = false)
    private LocalDateTime admittedAt;

    private LocalDateTime dischargedAt;
    private String admissionReason;
    private String diagnosis;
    private String treatmentSummary;
    private String dischargeNotes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AdmissionStatus status = AdmissionStatus.ADMITTED;
}
