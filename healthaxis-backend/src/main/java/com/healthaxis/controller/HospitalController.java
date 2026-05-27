package com.healthaxis.controller;

import com.healthaxis.dto.response.ApiResponse;
import com.healthaxis.dto.response.PageResponse;
import com.healthaxis.entity.HospitalBranch;
import com.healthaxis.exception.ResourceNotFoundException;
import com.healthaxis.repository.HospitalBranchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/hospitals")
@RequiredArgsConstructor
public class HospitalController {
    private final HospitalBranchRepository hospitalRepository;

    @GetMapping
    @Cacheable("hospitals")
    public ResponseEntity<ApiResponse<PageResponse<HospitalBranch>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        var pageable = PageRequest.of(page, size);
        var result = (search != null && !search.isBlank())
            ? hospitalRepository.searchHospitals(search, pageable)
            : hospitalRepository.findByActiveTrueAndDeletedFalse(pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HospitalBranch>> get(@PathVariable UUID id) {
        HospitalBranch hospital = hospitalRepository.findById(id)
            .filter(h -> !h.isDeleted())
            .orElseThrow(() -> new ResourceNotFoundException("Hospital branch", "id", id));
        return ResponseEntity.ok(ApiResponse.success(hospital));
    }
}
