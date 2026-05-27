package com.healthaxis.controller;

import com.healthaxis.dto.request.AppointmentRequest;
import com.healthaxis.dto.response.ApiResponse;
import com.healthaxis.dto.response.PageResponse;
import com.healthaxis.entity.Appointment;
import com.healthaxis.enums.AppointmentStatus;
import com.healthaxis.service.impl.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import com.healthaxis.entity.User;
import java.util.UUID;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
public class AppointmentController {
    private final AppointmentService appointmentService;

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<Appointment>> book(@Valid @RequestBody AppointmentRequest request,
                                                          @AuthenticationPrincipal User user) {
        Appointment appointment = appointmentService.bookAppointment(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Appointment booked", appointment));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<PageResponse<Appointment>>> myAppointments(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<Appointment> response = appointmentService.getPatientAppointments(
            user.getId(), PageRequest.of(page, size, Sort.by("scheduledAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/doctor")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<Appointment>>> doctorAppointments(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<Appointment> response = appointmentService.getDoctorAppointments(
            user.getId(), PageRequest.of(page, size, Sort.by("scheduledAt").ascending()));
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Appointment>> cancel(@PathVariable UUID id,
                                                            @AuthenticationPrincipal User user,
                                                            @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(ApiResponse.success("Appointment cancelled",
            appointmentService.cancelAppointment(id, user.getId(), reason)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN', 'NURSE')")
    public ResponseEntity<ApiResponse<Appointment>> updateStatus(@PathVariable UUID id,
                                                                  @RequestParam AppointmentStatus status) {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.updateStatus(id, status)));
    }
}
