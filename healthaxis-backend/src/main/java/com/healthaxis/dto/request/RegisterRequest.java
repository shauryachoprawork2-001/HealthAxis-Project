package com.healthaxis.dto.request;

import com.healthaxis.enums.Role;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank @Email
    private String email;
    @NotBlank @Size(min = 8)
    private String password;
    @NotBlank
    private String firstName;
    @NotBlank
    private String lastName;
    @Pattern(regexp = "^[+]?[0-9]{10,15}$")
    private String phoneNumber;
    private Role role = Role.PATIENT;
}
