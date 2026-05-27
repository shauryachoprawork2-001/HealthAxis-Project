package com.healthaxis.controller;

import com.healthaxis.dto.response.ApiResponse;
import com.healthaxis.dto.response.PageResponse;
import com.healthaxis.entity.Accommodation;
import com.healthaxis.repository.AccommodationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/accommodations")
@RequiredArgsConstructor
public class AccommodationController {
    private final AccommodationRepository accommodationRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<Accommodation>>> search(
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) UUID hospitalId,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        var result = accommodationRepository.searchAvailable(maxPrice, hospitalId, type, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }
}
