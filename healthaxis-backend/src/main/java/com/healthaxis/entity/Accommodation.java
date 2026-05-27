package com.healthaxis.entity;

import com.healthaxis.enums.AccommodationType;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "accommodations", indexes = {
    @Index(name = "idx_accom_city", columnList = "city"),
    @Index(name = "idx_accom_hospital", columnList = "hospital_branch_id")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Accommodation extends BaseEntity {
    @Column(nullable = false)
    private String name;
    private String address;
    private String city;
    private Double latitude;
    private Double longitude;
    private Double distanceFromHospitalKm;

    @Enumerated(EnumType.STRING)
    private AccommodationType type;

    @Column(precision = 8, scale = 2)
    private BigDecimal pricePerNight;

    private Integer totalRooms;
    private Integer availableRooms;
    private String amenities;
    private String contactPhone;
    private String contactEmail;
    private Double rating;
    private String imageUrl;
    private boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_branch_id")
    private HospitalBranch hospitalBranch;
}
