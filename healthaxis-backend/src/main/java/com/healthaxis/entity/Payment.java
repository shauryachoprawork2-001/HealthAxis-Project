package com.healthaxis.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Payment extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    private String paymentMethod;    // CARD, CASH, UPI, INSURANCE, BANK_TRANSFER
    private String transactionId;
    private String stripeChargeId;
    private LocalDateTime paidAt;
    private String status;
    private String receiptUrl;
}
