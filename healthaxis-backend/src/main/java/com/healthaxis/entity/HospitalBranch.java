package com.healthaxis.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "hospital_branches", indexes = {
    @Index(name = "idx_branch_city", columnList = "city"),
    @Index(name = "idx_branch_code", columnList = "branchCode")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HospitalBranch extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String branchCode;

    @Column(nullable = false)
    private String address;

    private String city;
    private String state;
    private String country;
    private String pinCode;
    private String phoneNumber;
    private String email;
    private String website;

    private Double latitude;
    private Double longitude;

    private Integer totalBeds;
    private Integer icuBeds;
    private Integer emergencyBeds;

    private String logoUrl;
    private String description;

    @Column(nullable = false)
    private boolean active = true;

    @OneToMany(mappedBy = "hospitalBranch", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Department> departments = new ArrayList<>();

    @OneToMany(mappedBy = "hospitalBranch", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Ward> wards = new ArrayList<>();
}
