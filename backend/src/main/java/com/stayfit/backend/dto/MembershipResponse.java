package com.stayfit.backend.dto;

import com.stayfit.backend.entity.MembershipStatus;
import com.stayfit.backend.entity.UserMembership;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/** Safe, external-facing projection of {@link UserMembership}. Never includes User entity details. */
public record MembershipResponse(

		Long id,
		Long planId,
		String planName,
		String planDescription,
		Integer durationDays,
		BigDecimal price,
		LocalDate startDate,
		LocalDate endDate,
		MembershipStatus status,
		Instant createdAt,
		Instant updatedAt

) {

	public static MembershipResponse from(UserMembership membership) {
		return new MembershipResponse(
				membership.getId(),
				membership.getMembershipPlan().getId(),
				membership.getMembershipPlan().getName(),
				membership.getMembershipPlan().getDescription(),
				membership.getMembershipPlan().getDurationDays(),
				membership.getMembershipPlan().getPrice(),
				membership.getStartDate(),
				membership.getEndDate(),
				membership.getStatus(),
				membership.getCreatedAt(),
				membership.getUpdatedAt()
		);
	}

}
