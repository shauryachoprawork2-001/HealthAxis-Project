package com.healthaxis.controller;

import com.healthaxis.dto.response.ApiResponse;
import com.healthaxis.dto.response.PageResponse;
import com.healthaxis.entity.Invoice;
import com.healthaxis.service.impl.BillingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/billing")
@RequiredArgsConstructor
public class BillingController {
    private final BillingService billingService;

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'PATIENT')")
    public ResponseEntity<ApiResponse<PageResponse<Invoice>>> patientInvoices(
            @PathVariable UUID patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        var result = billingService.getPatientInvoices(patientId, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @PostMapping("/{invoiceId}/pay")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'PATIENT')")
    public ResponseEntity<ApiResponse<Invoice>> pay(@PathVariable UUID invoiceId,
                                                     @RequestParam BigDecimal amount,
                                                     @RequestParam String method,
                                                     @RequestParam(required = false) String transactionId) {
        return ResponseEntity.ok(ApiResponse.success("Payment recorded",
            billingService.recordPayment(invoiceId, amount, method, transactionId)));
    }
}
