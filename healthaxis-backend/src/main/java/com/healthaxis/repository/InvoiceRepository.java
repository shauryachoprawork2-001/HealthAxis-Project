package com.healthaxis.repository;

import com.healthaxis.entity.Invoice;
import com.healthaxis.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    Optional<Invoice> findByInvoiceNumberAndDeletedFalse(String invoiceNumber);
    Page<Invoice> findByPatientIdAndDeletedFalse(UUID patientId, Pageable pageable);
    Page<Invoice> findByPaymentStatusAndDeletedFalse(PaymentStatus status, Pageable pageable);

    @Query("SELECT SUM(i.totalAmount) FROM Invoice i WHERE i.deleted = false AND i.createdAt BETWEEN :start AND :end")
    BigDecimal sumRevenueInPeriod(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
