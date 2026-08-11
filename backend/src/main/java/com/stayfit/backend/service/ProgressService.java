package com.stayfit.backend.service;

import com.stayfit.backend.dto.HealthProfileResponse;
import com.stayfit.backend.dto.HealthProfileUpdateRequest;
import com.stayfit.backend.dto.ProgressRecordResponse;
import com.stayfit.backend.entity.ProgressRecord;
import com.stayfit.backend.entity.User;
import com.stayfit.backend.exception.ResourceNotFoundException;
import com.stayfit.backend.repository.ProgressRecordRepository;
import com.stayfit.backend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class ProgressService {

	private final UserRepository userRepository;
	private final ProgressRecordRepository progressRecordRepository;

	public ProgressService(UserRepository userRepository, ProgressRecordRepository progressRecordRepository) {
		this.userRepository = userRepository;
		this.progressRecordRepository = progressRecordRepository;
	}

	@Transactional(readOnly = true)
	public HealthProfileResponse getCurrentHealthProfile(Long userId) {
		return HealthProfileResponse.from(findUser(userId));
	}

	@Transactional
	public HealthProfileResponse updateHealthProfile(Long userId, HealthProfileUpdateRequest request) {
		User user = findUser(userId);

		boolean unchanged = user.getWeight().equals(request.weight()) && user.getHeight().equals(request.height());
		if (unchanged) {
			return HealthProfileResponse.from(user);
		}

		boolean hasHistory = progressRecordRepository.findFirstByUserIdOrderByRecordedAtDesc(userId).isPresent();
		if (!hasHistory) {
			// Preserve the pre-update state so it isn't lost once User is overwritten below.
			progressRecordRepository.save(snapshot(user, user.getWeight(), user.getHeight()));
		}

		user.setWeight(request.weight());
		user.setHeight(request.height());

		progressRecordRepository.save(snapshot(user, request.weight(), request.height()));

		return HealthProfileResponse.from(user);
	}

	@Transactional(readOnly = true)
	public Page<ProgressRecordResponse> getHistory(Long userId, Pageable pageable) {
		return progressRecordRepository.findByUserId(userId, pageable).map(ProgressRecordResponse::from);
	}

	private User findUser(Long userId) {
		return userRepository.findById(userId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));
	}

	private ProgressRecord snapshot(User user, Double weight, Double height) {
		return ProgressRecord.builder()
				.user(user)
				.weight(weight)
				.height(height)
				.recordedAt(Instant.now())
				.build();
	}

}
