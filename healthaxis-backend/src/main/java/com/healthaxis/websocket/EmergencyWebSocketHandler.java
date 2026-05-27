package com.healthaxis.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthaxis.entity.EmergencyRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmergencyWebSocketHandler {
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    public void broadcastEmergencyUpdate(EmergencyRequest emergency) {
        try {
            messagingTemplate.convertAndSend("/topic/emergency/queue", emergency);
            messagingTemplate.convertAndSend(
                "/topic/emergency/hospital/" + emergency.getHospitalBranch().getId(), emergency);
            log.debug("Emergency update broadcast: {}", emergency.getEmergencyNumber());
        } catch (Exception e) {
            log.error("Failed to broadcast emergency update", e);
        }
    }

    public void broadcastBedOccupancyUpdate(String hospitalId) {
        messagingTemplate.convertAndSend("/topic/occupancy/hospital/" + hospitalId,
            java.util.Map.of("type", "OCCUPANCY_UPDATE", "hospitalId", hospitalId));
    }
}
