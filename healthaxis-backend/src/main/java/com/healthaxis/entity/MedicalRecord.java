package com.healthaxis.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "medical_records")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MedicalRecord extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    private LocalDate visitDate;
    private String diagnosis;
    private String prescription;
    private String labResults;
    private String imagingResults;
    private String treatmentPlan;
    private String followUpInstructions;
    private String attachmentUrl;
    private String recordType;  // CONSULTATION, LAB, IMAGING, DISCHARGE_SUMMARY
}
