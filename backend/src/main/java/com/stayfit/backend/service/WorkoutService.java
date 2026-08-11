package com.stayfit.backend.service;

import com.stayfit.backend.dto.WorkoutCreateRequest;
import com.stayfit.backend.dto.WorkoutResponse;
import com.stayfit.backend.dto.WorkoutUpdateRequest;
import com.stayfit.backend.entity.User;
import com.stayfit.backend.entity.Workout;
import com.stayfit.backend.exception.ResourceNotFoundException;
import com.stayfit.backend.repository.UserRepository;
import com.stayfit.backend.repository.WorkoutRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WorkoutService {

	private final WorkoutRepository workoutRepository;
	private final UserRepository userRepository;

	public WorkoutService(WorkoutRepository workoutRepository, UserRepository userRepository) {
		this.workoutRepository = workoutRepository;
		this.userRepository = userRepository;
	}

	@Transactional
	public WorkoutResponse create(Long userId, WorkoutCreateRequest request) {
		User owner = userRepository.getReferenceById(userId);

		Workout workout = Workout.builder()
				.user(owner)
				.workoutDate(request.workoutDate())
				.workoutType(request.workoutType())
				.durationMinutes(request.durationMinutes())
				.caloriesBurned(request.caloriesBurned())
				.notes(request.notes())
				.build();

		return WorkoutResponse.from(workoutRepository.save(workout));
	}

	public Page<WorkoutResponse> list(Long userId, Pageable pageable) {
		return workoutRepository.findByUserId(userId, pageable).map(WorkoutResponse::from);
	}

	public WorkoutResponse get(Long userId, Long workoutId) {
		return WorkoutResponse.from(findOwned(userId, workoutId));
	}

	@Transactional
	public WorkoutResponse update(Long userId, Long workoutId, WorkoutUpdateRequest request) {
		Workout workout = findOwned(userId, workoutId);
		workout.setWorkoutDate(request.workoutDate());
		workout.setWorkoutType(request.workoutType());
		workout.setDurationMinutes(request.durationMinutes());
		workout.setCaloriesBurned(request.caloriesBurned());
		workout.setNotes(request.notes());
		return WorkoutResponse.from(workout);
	}

	@Transactional
	public void delete(Long userId, Long workoutId) {
		long deleted = workoutRepository.deleteByIdAndUserId(workoutId, userId);
		if (deleted == 0) {
			throw new ResourceNotFoundException("Workout not found");
		}
	}

	private Workout findOwned(Long userId, Long workoutId) {
		return workoutRepository.findByIdAndUserId(workoutId, userId)
				.orElseThrow(() -> new ResourceNotFoundException("Workout not found"));
	}

}
