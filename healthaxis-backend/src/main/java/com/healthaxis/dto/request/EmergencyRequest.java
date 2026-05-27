package com.healthaxis.dto.request;

import com.healthaxis.enums.EmergencyPriority;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.UUID;

@Data
public class EmergencyRequest {
    @NotBlank private String patientName;
    private String patientAge;
    private String patientGender;
    @NotNull private EmergencyPriority priority;
    @NotBlank private String chiefComplaint;
    private String vitalSigns;
    @NotNull private UUID hospitalBranchId;
    private boolean ambulanceRequired;
    private UUID existingPatientId;
}
