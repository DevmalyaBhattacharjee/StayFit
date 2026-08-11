package com.stayfit.backend.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record HealthProfileUpdateRequest(

		@NotNull
		@Positive
		@DecimalMax(value = "500.0", message = "must be less than or equal to 500")
		Double weight,

		@NotNull
		@Positive
		@DecimalMax(value = "300.0", message = "must be less than or equal to 300")
		Double height

) {
}
