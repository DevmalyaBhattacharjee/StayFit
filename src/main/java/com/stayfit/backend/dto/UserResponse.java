package com.stayfit.backend.dto;

import com.stayfit.backend.entity.Gender;
import com.stayfit.backend.entity.User;

import java.time.Instant;
import java.time.LocalDate;

/** Safe, external-facing projection of {@link User}. Never includes the password hash. */
public record UserResponse(

		Long id,
		String name,
		String email,
		LocalDate dateOfBirth,
		Gender gender,
		Double height,
		Double weight,
		Instant createdAt,
		boolean enabled

) {

	public static UserResponse from(User user) {
		return new UserResponse(
				user.getId(),
				user.getName(),
				user.getEmail(),
				user.getDateOfBirth(),
				user.getGender(),
				user.getHeight(),
				user.getWeight(),
				user.getCreatedAt(),
				user.isEnabled()
		);
	}

}
