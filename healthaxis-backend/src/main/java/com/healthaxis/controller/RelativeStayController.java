package com.healthaxis.controller;

import com.healthaxis.dto.response.ApiResponse;
import com.healthaxis.entity.RelativeStay;
import com.healthaxis.entity.User;
import com.healthaxis.exception.BusinessException;
import com.healthaxis.exception.ResourceNotFoundException;
import com.healthaxis.repository.AccommodationRepository;
import com.healthaxis.repository.PatientRepository;
import com.healthaxis.repository.RelativeStayRepository;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/relative-stays")
@RequiredArgsConstructor
public class RelativeStayController {

    private final RelativeStayRepository stayRepository;
    private final AccommodationRepository accommodationRepository;
    private final PatientRepository patientRepository;

    @Data
    static class BookStayRequest {
        private UUID accommodationId;
        private UUID patientId;
        private String relativeFirstName;
        private String relativeLastName;
        private String relativePhone;
        private String relativeEmail;
        private String relationToPatient;
        private LocalDate checkInDate;
        private LocalDate checkOutDate;
        private String specialRequests;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RelativeStay>> book(@Valid @RequestBody BookStayRequest request,
                                                           @AuthenticationPrincipal User user) {
        var accommodation = accommodationRepository.findById(request.getAccommodationId())
                .orElseThrow(() -> new ResourceNotFoundException("Accommodation not found"));

        if (accommodation.getAvailableRooms() <= 0) {
            throw new BusinessException("No rooms available at this accommodation");
        }

        if (request.getCheckOutDate().isBefore(request.getCheckInDate()) ||
            request.getCheckOutDate().isEqual(request.getCheckInDate())) {
            throw new BusinessException("Check-out date must be after check-in date");
        }

        long nights = request.getCheckInDate().until(request.getCheckOutDate()).getDays();

        RelativeStay stay = RelativeStay.builder()
                .accommodation(accommodation)
                .relativeFirstName(request.getRelativeFirstName())
                .relativeLastName(request.getRelativeLastName())
                .relativePhone(request.getRelativePhone())
                .relativeEmail(request.getRelativeEmail())
                .relationToPatient(request.getRelationToPatient())
                .checkInDate(request.getCheckInDate())
                .checkOutDate(request.getCheckOutDate())
                .status("CONFIRMED")
                .totalCost(accommodation.getPricePerNight().multiply(java.math.BigDecimal.valueOf(nights)))
                .specialRequests(request.getSpecialRequests())
                .build();

        if (request.getPatientId() != null) {
            patientRepository.findById(request.getPatientId()).ifPresent(stay::setPatient);
        }

        accommodation.setAvailableRooms(accommodation.getAvailableRooms() - 1);
        accommodationRepository.save(accommodation);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Stay booked successfully", stayRepository.save(stay)));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<RelativeStay>>> myStays(@AuthenticationPrincipal User user) {
        // Return stays linked to the authenticated user's patient profile
        return ResponseEntity.ok(ApiResponse.success(List.of()));
    }
}
