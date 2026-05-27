package com.healthaxis.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.UUID;

@Data
public class BedAllocationRequest {
    @NotNull private UUID bedId;
    @NotNull private UUID patientId;
    @NotNull private UUID admittingDoctorId;
    @NotBlank private String admissionReason;
    private String diagnosis;
}
