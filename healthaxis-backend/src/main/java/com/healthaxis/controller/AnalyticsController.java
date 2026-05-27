package com.healthaxis.controller;

import com.healthaxis.dto.response.ApiResponse;
import com.healthaxis.service.impl.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
public class AnalyticsController {
    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> dashboard() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getAdminDashboardStats()));
    }

    @GetMapping("/occupancy/{hospitalId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'NURSE', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> occupancy(@PathVariable UUID hospitalId) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getOccupancyStats(hospitalId)));
    }
}
