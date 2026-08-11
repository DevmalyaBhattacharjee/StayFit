package com.stayfit.backend.dto;

import com.stayfit.backend.entity.User;

/** Safe, external-facing projection of the User's current health profile. */
public record HealthProfileResponse(

		Long userId,
		Double weight,
		Double height

) {

	public static HealthProfileResponse from(User user) {
		return new HealthProfileResponse(user.getId(), user.getWeight(), user.getHeight());
	}

}
