package com.healthaxis.entity;

import com.healthaxis.enums.BedStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "bed_inventory", indexes = {
    @Index(name = "idx_bed_status", columnList = "status"),
    @Index(name = "idx_bed_ward", columnList = "ward_id")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BedInventory extends BaseEntity {
    @Column(nullable = false, unique = true)
    private String bedNumber;
    private String roomNumber;
    private String bedType;  // STANDARD, ICU, ISOLATION, PEDIATRIC

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BedStatus status = BedStatus.AVAILABLE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ward_id", nullable = false)
    private Ward ward;

    @Version
    private Long version;  // Optimistic locking
}
