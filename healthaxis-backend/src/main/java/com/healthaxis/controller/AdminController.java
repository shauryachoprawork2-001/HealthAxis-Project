package com.healthaxis.controller;

import com.healthaxis.dto.response.ApiResponse;
import com.healthaxis.entity.Doctor;
import com.healthaxis.entity.HospitalBranch;
import com.healthaxis.entity.User;
import com.healthaxis.enums.Role;
import com.healthaxis.exception.ConflictException;
import com.healthaxis.exception.ResourceNotFoundException;
import com.healthaxis.repository.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final HospitalBranchRepository hospitalRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Data
    static class CreateDoctorRequest {
        @NotBlank private String firstName;
        @NotBlank private String lastName;
        @NotBlank @Email private String email;
        @NotBlank private String password;
        private String phoneNumber;
        @NotBlank private String licenseNumber;
        @NotBlank private String specialization;
        private String subSpecialization;
        private String qualification;
        private Integer yearsOfExperience;
        private Double consultationFee;
        private String bio;
        private UUID departmentId;
        private UUID hospitalBranchId;
    }

    @Data
    static class CreateHospitalRequest {
        @NotBlank private String name;
        @NotBlank private String branchCode;
        @NotBlank private String address;
        private String city;
        private String state;
        private String country;
        private String pinCode;
        private String phoneNumber;
        private String email;
        private Integer totalBeds;
        private Integer icuBeds;
        private Integer emergencyBeds;
        private Double latitude;
        private Double longitude;
        private String description;
    }

    @PostMapping("/doctors")
    public ResponseEntity<ApiResponse<Doctor>> createDoctor(@Valid @RequestBody CreateDoctorRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ConflictException("Email already registered: " + req.getEmail());
        }
        if (doctorRepository.findByLicenseNumberAndDeletedFalse(req.getLicenseNumber()).isPresent()) {
            throw new ConflictException("License number already registered: " + req.getLicenseNumber());
        }

        User user = User.builder()
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .phoneNumber(req.getPhoneNumber())
                .role(Role.DOCTOR)
                .enabled(true)
                .build();
        user = userRepository.save(user);

        Doctor.DoctorBuilder doctorBuilder = Doctor.builder()
                .user(user)
                .licenseNumber(req.getLicenseNumber())
                .specialization(req.getSpecialization())
                .subSpecialization(req.getSubSpecialization())
                .qualification(req.getQualification())
                .yearsOfExperience(req.getYearsOfExperience())
                .consultationFee(req.getConsultationFee())
                .bio(req.getBio())
                .available(true);

        if (req.getDepartmentId() != null) {
            departmentRepository.findById(req.getDepartmentId()).ifPresent(doctorBuilder::department);
        }
        if (req.getHospitalBranchId() != null) {
            hospitalRepository.findById(req.getHospitalBranchId()).ifPresent(doctorBuilder::hospitalBranch);
        }

        Doctor doctor = doctorRepository.save(doctorBuilder.build());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Doctor created successfully", doctor));
    }

    @PostMapping("/hospitals")
    public ResponseEntity<ApiResponse<HospitalBranch>> createHospital(@Valid @RequestBody CreateHospitalRequest req) {
        if (hospitalRepository.findByBranchCodeAndDeletedFalse(req.getBranchCode()).isPresent()) {
            throw new ConflictException("Branch code already exists: " + req.getBranchCode());
        }

        HospitalBranch branch = HospitalBranch.builder()
                .name(req.getName())
                .branchCode(req.getBranchCode())
                .address(req.getAddress())
                .city(req.getCity())
                .state(req.getState())
                .country(req.getCountry())
                .pinCode(req.getPinCode())
                .phoneNumber(req.getPhoneNumber())
                .email(req.getEmail())
                .totalBeds(req.getTotalBeds())
                .icuBeds(req.getIcuBeds())
                .emergencyBeds(req.getEmergencyBeds())
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .description(req.getDescription())
                .active(true)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Hospital branch created", hospitalRepository.save(branch)));
    }
}
