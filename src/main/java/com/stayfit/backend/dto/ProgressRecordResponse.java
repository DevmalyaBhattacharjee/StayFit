package com.stayfit.backend.dto;

import com.stayfit.backend.entity.ProgressRecord;

import java.time.Instant;

/** Safe, external-facing projection of {@link ProgressRecord}. Never exposes the User entity. */
public record ProgressRecordResponse(

		Long id,
		Instant recordedAt,
		Double weight,
		Double height,
		Instant createdAt

) {

	public static ProgressRecordResponse from(ProgressRecord record) {
		return new ProgressRecordResponse(
				record.getId(),
				record.getRecordedAt(),
				record.getWeight(),
				record.getHeight(),
				record.getCreatedAt()
		);
	}

}
