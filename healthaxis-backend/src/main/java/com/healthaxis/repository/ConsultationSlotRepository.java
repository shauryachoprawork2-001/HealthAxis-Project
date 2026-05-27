package com.healthaxis.repository;

import com.healthaxis.entity.ConsultationSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import jakarta.persistence.LockModeType;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConsultationSlotRepository extends JpaRepository<ConsultationSlot, UUID> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM ConsultationSlot s WHERE s.id = :id")
    Optional<ConsultationSlot> findByIdWithLock(@Param("id") UUID id);

    @Query("SELECT s FROM ConsultationSlot s WHERE s.doctor.id = :doctorId AND " +
           "s.slotDateTime BETWEEN :start AND :end AND s.available = true AND s.deleted = false")
    List<ConsultationSlot> findAvailableSlots(@Param("doctorId") UUID doctorId,
                                              @Param("start") LocalDateTime start,
                                              @Param("end") LocalDateTime end);
}
