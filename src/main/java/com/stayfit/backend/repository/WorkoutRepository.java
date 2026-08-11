package com.stayfit.backend.repository;

import com.stayfit.backend.entity.Workout;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WorkoutRepository extends JpaRepository<Workout, Long> {

	Page<Workout> findByUserId(Long userId, Pageable pageable);

	Optional<Workout> findByIdAndUserId(Long id, Long userId);

	long deleteByIdAndUserId(Long id, Long userId);

}
