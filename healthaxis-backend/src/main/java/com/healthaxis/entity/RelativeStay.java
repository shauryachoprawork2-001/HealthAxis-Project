package com.healthaxis.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "relative_stays")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RelativeStay extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "accommodation_id", nullable = false)
    private Accommodation accommodation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    private String relativeFirstName;
    private String relativeLastName;
    private String relativePhone;
    private String relativeEmail;
    private String relationToPatient;

    @Column(nullable = false)
    private LocalDate checkInDate;
    @Column(nullable = false)
    private LocalDate checkOutDate;

    private String status;  // PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED
    @Column(precision = 10, scale = 2)
    private BigDecimal totalCost;
    private String specialRequests;
}
