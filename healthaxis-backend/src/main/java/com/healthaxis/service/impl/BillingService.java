package com.healthaxis.service.impl;

import com.healthaxis.entity.*;
import com.healthaxis.enums.PaymentStatus;
import com.healthaxis.exception.BusinessException;
import com.healthaxis.exception.ResourceNotFoundException;
import com.healthaxis.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BillingService {
    private final InvoiceRepository invoiceRepository;
    private final PatientRepository patientRepository;

    @Transactional
    public Invoice createInvoice(UUID patientId, List<BillingItem> items, UUID admissionId, UUID appointmentId) {
        Patient patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        BigDecimal subtotal = items.stream()
            .map(BillingItem::getTotalPrice)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal tax = subtotal.multiply(new BigDecimal("0.18")); // 18% GST
        BigDecimal total = subtotal.add(tax);

        String invoiceNumber = "INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Invoice invoice = Invoice.builder()
            .invoiceNumber(invoiceNumber)
            .patient(patient)
            .subtotal(subtotal)
            .taxAmount(tax)
            .discountAmount(BigDecimal.ZERO)
            .totalAmount(total)
            .paidAmount(BigDecimal.ZERO)
            .paymentStatus(PaymentStatus.PENDING)
            .billingItems(items)
            .build();

        items.forEach(item -> item.setInvoice(invoice));

        log.info("Invoice {} created for patient {}", invoiceNumber, patient.getMedicalRecordNumber());
        return invoiceRepository.save(invoice);
    }

    @Transactional
    public Invoice recordPayment(UUID invoiceId, BigDecimal amount, String method, String transactionId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

        if (invoice.getPaymentStatus() == PaymentStatus.PAID) {
            throw new BusinessException("Invoice is already fully paid");
        }

        Payment payment = Payment.builder()
            .invoice(invoice)
            .amount(amount)
            .paymentMethod(method)
            .transactionId(transactionId)
            .paidAt(LocalDateTime.now())
            .status("SUCCESS")
            .build();

        invoice.getPayments().add(payment);
        BigDecimal newPaid = invoice.getPaidAmount().add(amount);
        invoice.setPaidAmount(newPaid);

        if (newPaid.compareTo(invoice.getTotalAmount()) >= 0) {
            invoice.setPaymentStatus(PaymentStatus.PAID);
        } else {
            invoice.setPaymentStatus(PaymentStatus.PARTIAL);
        }

        return invoiceRepository.save(invoice);
    }

    @Transactional(readOnly = true)
    public Page<Invoice> getPatientInvoices(UUID patientId, Pageable pageable) {
        return invoiceRepository.findByPatientIdAndDeletedFalse(patientId, pageable);
    }
}
