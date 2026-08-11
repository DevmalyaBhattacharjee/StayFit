package com.stayfit.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * An immutable historical health snapshot for a {@link User}. Never updated
 * or overwritten once created; {@link User#getWeight()}/{@link User#getHeight()}
 * hold the current state, this table holds the timeline.
 */
@Entity
@Table(name = "progress_records", indexes = {
		@Index(name = "idx_progress_records_user_id", columnList = "user_id"),
		@Index(name = "idx_progress_records_user_id_recorded_at", columnList = "user_id, recorded_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgressRecord {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false, updatable = false)
	private User user;

	@Column(name = "recorded_at", nullable = false, updatable = false)
	private Instant recordedAt;

	@Column(nullable = false)
	private Double weight;

	@Column(nullable = false)
	private Double height;

	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	@PrePersist
	protected void onCreate() {
		Instant now = Instant.now();
		this.createdAt = now;
		if (this.recordedAt == null) {
			this.recordedAt = now;
		}
	}

}
