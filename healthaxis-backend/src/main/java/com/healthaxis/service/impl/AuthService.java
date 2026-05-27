package com.healthaxis.service.impl;

import com.healthaxis.dto.request.LoginRequest;
import com.healthaxis.dto.request.RegisterRequest;
import com.healthaxis.dto.response.AuthResponse;
import com.healthaxis.entity.Patient;
import com.healthaxis.entity.User;
import com.healthaxis.enums.Role;
import com.healthaxis.exception.BusinessException;
import com.healthaxis.exception.ConflictException;
import com.healthaxis.exception.ResourceNotFoundException;
import com.healthaxis.repository.PatientRepository;
import com.healthaxis.repository.UserRepository;
import com.healthaxis.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already registered: " + request.getEmail());
        }
        if (request.getPhoneNumber() != null && userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new ConflictException("Phone number already registered");
        }

        User user = User.builder()
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .phoneNumber(request.getPhoneNumber())
            .role(request.getRole() != null ? request.getRole() : Role.PATIENT)
            .enabled(true)
            .build();

        user = userRepository.save(user);

        // Auto-create patient profile
        if (user.getRole() == Role.PATIENT) {
            Patient patient = Patient.builder()
                .user(user)
                .medicalRecordNumber(generateMRN())
                .build();
            patientRepository.save(patient);
        }

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        log.info("New user registered: {} with role {}", user.getEmail(), user.getRole());
        return buildAuthResponse(user, accessToken, refreshToken);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmailAndDeletedFalse(request.getEmail())
            .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        if (!user.isEnabled()) {
            throw new BusinessException("Account is disabled. Contact support.");
        }

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    @Transactional
    public AuthResponse refreshToken(String refreshToken) {
        String email = jwtService.extractUsername(refreshToken);
        User user = userRepository.findByEmailAndDeletedFalse(email)
            .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        if (!refreshToken.equals(user.getRefreshToken())) {
            throw new BusinessException("Invalid refresh token");
        }

        String newAccessToken = jwtService.generateAccessToken(user);
        String newRefreshToken = jwtService.generateRefreshToken(user);
        user.setRefreshToken(newRefreshToken);
        userRepository.save(user);

        return buildAuthResponse(user, newAccessToken, newRefreshToken);
    }

    @Transactional
    public void logout(String email) {
        userRepository.findByEmailAndDeletedFalse(email).ifPresent(user -> {
            user.setRefreshToken(null);
            userRepository.save(user);
        });
    }

    private String generateMRN() {
        return "MRN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {
        return AuthResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .expiresIn(900)
            .userId(user.getId())
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .role(user.getRole())
            .profileImageUrl(user.getProfileImageUrl())
            .build();
    }
}
