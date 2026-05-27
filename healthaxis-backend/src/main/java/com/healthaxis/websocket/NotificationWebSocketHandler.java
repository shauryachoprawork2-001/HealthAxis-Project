package com.healthaxis.websocket;

import com.healthaxis.entity.Notification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationWebSocketHandler {
    private final SimpMessagingTemplate messagingTemplate;

    public void sendNotificationToUser(String userId, Notification notification) {
        try {
            messagingTemplate.convertAndSendToUser(userId, "/queue/notifications", notification);
        } catch (Exception e) {
            log.error("Failed to send WS notification to user {}", userId, e);
        }
    }
}
