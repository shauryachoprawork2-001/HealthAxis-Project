package com.healthaxis.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "billing_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BillingItem extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @Column(nullable = false)
    private String description;

    private String category;  // CONSULTATION, ROOM_CHARGE, PROCEDURE, LAB, MEDICATION, TRANSPORT
    private Integer quantity;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalPrice;
}
