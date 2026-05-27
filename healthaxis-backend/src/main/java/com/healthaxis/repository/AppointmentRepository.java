package com.healthaxis.repository;

import com.healthaxis.entity.Appointment;
import com.healthaxis.enums.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    Page<Appointment> findByPatientIdAndDeletedFalse(UUID patientId, Pageable pageable);
    Page<Appointment> findByDoctorIdAndDeletedFalse(UUID doctorId, Pageable pageable);
    Page<Appointment> findByStatusAndDeletedFalse(AppointmentStatus status, Pageable pageable);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId AND " +
           "a.scheduledAt BETWEEN :start AND :end AND a.deleted = false AND " +
           "a.status NOT IN ('CANCELLED', 'NO_SHOW')")
    List<Appointment> findDoctorAppointmentsInRange(@Param("doctorId") UUID doctorId,
                                                    @Param("start") LocalDateTime start,
                                                    @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctor.id = :doctorId AND " +
           "a.status = 'SCHEDULED' AND a.deleted = false")
    long countUpcomingByDoctor(@Param("doctorId") UUID doctorId);

    @Query("SELECT a FROM Appointment a WHERE a.scheduledAt BETWEEN :start AND :end AND " +
           "a.status = 'SCHEDULED' AND a.deleted = false")
    List<Appointment> findAppointmentsForReminders(@Param("start") LocalDateTime start,
                                                   @Param("end") LocalDateTime end);
}
