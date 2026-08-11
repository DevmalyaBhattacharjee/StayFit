package com.stayfit.backend.dto;

import jakarta.validation.constraints.NotNull;

public record MembershipCreateRequest(

		@NotNull
		Long membershipPlanId

) {
}
