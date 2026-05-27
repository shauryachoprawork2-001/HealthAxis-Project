package com.healthaxis.dto.response;

import com.healthaxis.enums.Role;
import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data @Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private long expiresIn;
    private UUID userId;
    private String email;
    private String firstName;
    private String lastName;
    private Role role;
    private String profileImageUrl;
}
