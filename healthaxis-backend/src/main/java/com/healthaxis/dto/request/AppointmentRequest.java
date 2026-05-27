package com.healthaxis.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class AppointmentRequest {
    @NotNull private UUID doctorId;
    @NotNull private UUID hospitalBranchId;
    @NotNull private LocalDateTime scheduledAt;
    @NotBlank private String reasonForVisit;
    private String symptoms;
    private String consultationType = "IN_PERSON";
    private UUID consultationSlotId;
}
