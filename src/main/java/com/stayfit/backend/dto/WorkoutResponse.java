package com.stayfit.backend.dto;

import com.stayfit.backend.entity.Workout;
import com.stayfit.backend.entity.WorkoutType;

import java.time.Instant;
import java.time.LocalDate;

/** Safe, external-facing projection of {@link Workout}. Never includes owner/user information. */
public record WorkoutResponse(

		Long id,
		LocalDate workoutDate,
		WorkoutType workoutType,
		Integer durationMinutes,
		Integer caloriesBurned,
		String notes,
		Instant createdAt,
		Instant updatedAt

) {

	public static WorkoutResponse from(Workout workout) {
		return new WorkoutResponse(
				workout.getId(),
				workout.getWorkoutDate(),
				workout.getWorkoutType(),
				workout.getDurationMinutes(),
				workout.getCaloriesBurned(),
				workout.getNotes(),
				workout.getCreatedAt(),
				workout.getUpdatedAt()
		);
	}

}
