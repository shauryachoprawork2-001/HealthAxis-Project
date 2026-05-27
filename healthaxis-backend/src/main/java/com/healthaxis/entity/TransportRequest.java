package com.healthaxis.entity;

import com.healthaxis.enums.TransportType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "transport_requests")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TransportRequest extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @Enumerated(EnumType.STRING)
    private TransportType transportType;

    private String pickupAddress;
    private String dropoffAddress;
    private LocalDateTime scheduledTime;
    private String status;   // PENDING, CONFIRMED, EN_ROUTE, COMPLETED, CANCELLED
    private String driverName;
    private String driverPhone;
    private String vehicleNumber;
    @Column(precision = 8, scale = 2)
    private BigDecimal estimatedCost;
    private boolean isEmergency;
}
