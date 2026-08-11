package com.stayfit.backend.dto;

import com.stayfit.backend.entity.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record RegisterRequest(

		@NotBlank
		@Size(max = 100)
		String name,

		@NotBlank
		@Email
		@Size(max = 254)
		String email,

		@NotBlank
		@Size(min = 8, max = 72, message = "Password must be between 8 and 72 characters")
		String password,

		@NotNull
		@Past
		LocalDate dateOfBirth,

		@NotNull
		Gender gender,

		@NotNull
		@Positive
		Double height,

		@NotNull
		@Positive
		Double weight

) {
}
