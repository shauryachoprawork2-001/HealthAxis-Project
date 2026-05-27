package com.healthaxis.repository;

import com.healthaxis.entity.RelativeStay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface RelativeStayRepository extends JpaRepository<RelativeStay, UUID> {}
