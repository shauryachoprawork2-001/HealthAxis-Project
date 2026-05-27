package com.healthaxis.controller;

import com.healthaxis.dto.response.ApiResponse;
import com.healthaxis.dto.response.PageResponse;
import com.healthaxis.entity.ConsultationSlot;
import com.healthaxis.entity.Doctor;
import com.healthaxis.entity.DoctorSchedule;
import com.healthaxis.exception.ResourceNotFoundException;
import com.healthaxis.repository.ConsultationSlotRepository;
import com.healthaxis.repository.DoctorRepository;
import com.healthaxis.repository.DoctorScheduleRepository;
import com.healthaxis.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorRepository doctorRepository;
    private final ConsultationSlotRepository slotRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<Doctor>>> list(
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) UUID hospitalId,
            @RequestParam(required = false) Boolean available,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        var result = doctorRepository.searchDoctors(specialization, hospitalId, available,
                PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Doctor>> get(@PathVariable UUID id) {
        Doctor doctor = doctorRepository.findById(id)
                .filter(d -> !d.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", id));
        return ResponseEntity.ok(ApiResponse.success(doctor));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<Doctor>> getMe(@AuthenticationPrincipal User user) {
        Doctor doctor = doctorRepository.findByUserIdAndDeletedFalse(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
        return ResponseEntity.ok(ApiResponse.success(doctor));
    }

    @GetMapping("/{id}/slots")
    public ResponseEntity<ApiResponse<List<ConsultationSlot>>> getSlots(
            @PathVariable UUID id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(LocalTime.MAX);
        List<ConsultationSlot> slots = slotRepository.findAvailableSlots(id, start, end);
        return ResponseEntity.ok(ApiResponse.success(slots));
    }
}
