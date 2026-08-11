package com.stayfit.backend.dto;

import com.stayfit.backend.entity.WorkoutType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record WorkoutCreateRequest(

		@NotNull
		@PastOrPresent
		LocalDate workoutDate,

		@NotNull
		WorkoutType workoutType,

		@NotNull
		@Positive
		@Max(600)
		Integer durationMinutes,

		@NotNull
		@PositiveOrZero
		@Max(10000)
		Integer caloriesBurned,

		@Size(max = 500)
		String notes

) {
}
