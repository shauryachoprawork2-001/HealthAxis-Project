package com.healthaxis.service.impl;

import com.healthaxis.entity.Appointment;
import com.healthaxis.entity.Notification;
import com.healthaxis.entity.User;
import com.healthaxis.enums.NotificationType;
import com.healthaxis.repository.NotificationRepository;
import com.healthaxis.websocket.NotificationWebSocketHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationWebSocketHandler wsHandler;

    @Async
    @Transactional
    public void sendAppointmentConfirmation(Appointment appointment) {
        User patientUser = appointment.getPatient().getUser();
        User doctorUser = appointment.getDoctor().getUser();

        Notification patientNotif = Notification.builder()
            .user(patientUser)
            .title("Appointment Confirmed")
            .message(String.format("Your appointment with Dr. %s on %s has been confirmed. Appointment #%s",
                doctorUser.getFullName(),
                appointment.getScheduledAt().toString(),
                appointment.getAppointmentNumber()))
            .type(NotificationType.APPOINTMENT_CONFIRMED)
            .referenceId(appointment.getId())
            .referenceType("APPOINTMENT")
            .build();

        Notification doctorNotif = Notification.builder()
            .user(doctorUser)
            .title("New Appointment")
            .message(String.format("New appointment from %s scheduled for %s",
                patientUser.getFullName(), appointment.getScheduledAt().toString()))
            .type(NotificationType.APPOINTMENT_CONFIRMED)
            .referenceId(appointment.getId())
            .referenceType("APPOINTMENT")
            .build();

        notificationRepository.save(patientNotif);
        notificationRepository.save(doctorNotif);

        wsHandler.sendNotificationToUser(patientUser.getId().toString(), patientNotif);
        wsHandler.sendNotificationToUser(doctorUser.getId().toString(), doctorNotif);
    }

    @Async
    @Transactional
    public void sendNotification(User user, String title, String message,
                                  NotificationType type, UUID referenceId, String referenceType) {
        Notification notification = Notification.builder()
            .user(user)
            .title(title)
            .message(message)
            .type(type)
            .referenceId(referenceId)
            .referenceType(referenceType)
            .build();

        notification = notificationRepository.save(notification);
        wsHandler.sendNotificationToUser(user.getId().toString(), notification);
        log.debug("Notification sent to user {}: {}", user.getEmail(), title);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndIsReadFalseAndDeletedFalse(userId);
    }

    @Transactional
    public void markAllRead(UUID userId) {
        notificationRepository.markAllAsReadByUser(userId);
    }
}
