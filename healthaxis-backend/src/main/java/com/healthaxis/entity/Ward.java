package com.healthaxis.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "wards")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Ward extends BaseEntity {
    @Column(nullable = false)
    private String name;
    private String wardType;   // GENERAL, ICU, PEDIATRIC, MATERNITY, SURGICAL, PSYCHIATRIC
    private Integer floorNumber;
    private Integer totalBeds;
    private String nurseStation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_branch_id", nullable = false)
    private HospitalBranch hospitalBranch;

    @OneToMany(mappedBy = "ward", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<BedInventory> beds = new ArrayList<>();
}
