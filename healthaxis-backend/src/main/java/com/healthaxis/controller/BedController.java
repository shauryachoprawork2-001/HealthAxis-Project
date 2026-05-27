package com.healthaxis.controller;

import com.healthaxis.dto.request.BedAllocationRequest;
import com.healthaxis.dto.response.ApiResponse;
import com.healthaxis.entity.Admission;
import com.healthaxis.service.impl.BedAllocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/beds")
@RequiredArgsConstructor
public class BedController {
    private final BedAllocationService bedAllocationService;

    @PostMapping("/allocate")
    @PreAuthorize("hasAnyRole('ADMIN', 'NURSE', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<Admission>> allocate(@Valid @RequestBody BedAllocationRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Bed allocated successfully", bedAllocationService.allocateBed(request)));
    }

    @PostMapping("/discharge/{admissionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    public ResponseEntity<ApiResponse<Admission>> discharge(@PathVariable UUID admissionId,
                                                             @RequestParam(required = false) String notes) {
        return ResponseEntity.ok(ApiResponse.success("Patient discharged", bedAllocationService.discharge(admissionId, notes)));
    }
}
