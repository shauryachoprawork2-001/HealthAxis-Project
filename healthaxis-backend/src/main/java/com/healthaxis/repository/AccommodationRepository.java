package com.healthaxis.repository;

import com.healthaxis.entity.Accommodation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.UUID;

@Repository
public interface AccommodationRepository extends JpaRepository<Accommodation, UUID> {
    @Query("SELECT a FROM Accommodation a WHERE a.deleted = false AND a.active = true AND " +
           "a.availableRooms > 0 AND " +
           "(:maxPrice IS NULL OR a.pricePerNight <= :maxPrice) AND " +
           "(:hospitalId IS NULL OR a.hospitalBranch.id = :hospitalId) AND " +
           "(:type IS NULL OR a.type = :type)")
    Page<Accommodation> searchAvailable(@Param("maxPrice") BigDecimal maxPrice,
                                        @Param("hospitalId") UUID hospitalId,
                                        @Param("type") String type,
                                        Pageable pageable);
}
