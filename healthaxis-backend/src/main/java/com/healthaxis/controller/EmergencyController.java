package com.healthaxis.controller;

import com.healthaxis.dto.response.ApiResponse;
import com.healthaxis.entity.EmergencyRequest;
import com.healthaxis.enums.EmergencyPriority;
import com.healthaxis.service.impl.EmergencyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/emergency")
@RequiredArgsConstructor
public class EmergencyController {
    private final EmergencyService emergencyService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<EmergencyRequest>> create(
            @Valid @RequestBody com.healthaxis.dto.request.EmergencyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Emergency request created", emergencyService.createEmergency(request)));
    }

    @GetMapping("/queue")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<List<EmergencyRequest>>> getQueue() {
        return ResponseEntity.ok(ApiResponse.success(emergencyService.getActiveQueue()));
    }

    @PatchMapping("/{id}/triage")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    public ResponseEntity<ApiResponse<EmergencyRequest>> triage(@PathVariable UUID id,
                                                                  @RequestParam EmergencyPriority priority,
                                                                  @RequestParam(required = false) String notes) {
        return ResponseEntity.ok(ApiResponse.success(emergencyService.triage(id, priority, notes)));
    }

    @PatchMapping("/{id}/assign-doctor")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<EmergencyRequest>> assignDoctor(@PathVariable UUID id,
                                                                        @RequestParam UUID doctorId) {
        return ResponseEntity.ok(ApiResponse.success(emergencyService.assignDoctor(id, doctorId)));
    }

    @PatchMapping("/{id}/assign-bed")
    @PreAuthorize("hasAnyRole('ADMIN', 'NURSE', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<EmergencyRequest>> assignBed(@PathVariable UUID id,
                                                                     @RequestParam UUID bedId) {
        return ResponseEntity.ok(ApiResponse.success(emergencyService.assignBed(id, bedId)));
    }
}
