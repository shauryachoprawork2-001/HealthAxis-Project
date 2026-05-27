package com.healthaxis.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "consultation_slots", indexes = {
    @Index(name = "idx_slot_doctor_time", columnList = "doctor_id, slotDateTime"),
    @Index(name = "idx_slot_available", columnList = "available")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ConsultationSlot extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(nullable = false)
    private LocalDateTime slotDateTime;

    @Column(nullable = false)
    private Integer durationMinutes;

    @Column(nullable = false)
    private boolean available = true;

    @Version
    private Long version;  // Optimistic locking for concurrent booking
}
