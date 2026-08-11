package com.stayfit.backend.repository;

import com.stayfit.backend.entity.ProgressRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProgressRecordRepository extends JpaRepository<ProgressRecord, Long> {

	Page<ProgressRecord> findByUserId(Long userId, Pageable pageable);

	Optional<ProgressRecord> findFirstByUserIdOrderByRecordedAtDesc(Long userId);

}
