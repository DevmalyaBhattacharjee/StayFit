package com.stayfit.backend.dto;

import com.stayfit.backend.entity.MembershipPlan;

import java.math.BigDecimal;
import java.time.Instant;

public record MembershipPlanResponse(

		Long id,
		String name,
		String description,
		Integer durationDays,
		BigDecimal price,
		boolean active,
		Instant createdAt,
		Instant updatedAt

) {

	public static MembershipPlanResponse from(MembershipPlan plan) {
		return new MembershipPlanResponse(
				plan.getId(),
				plan.getName(),
				plan.getDescription(),
				plan.getDurationDays(),
				plan.getPrice(),
				plan.isActive(),
				plan.getCreatedAt(),
				plan.getUpdatedAt()
		);
	}

}
