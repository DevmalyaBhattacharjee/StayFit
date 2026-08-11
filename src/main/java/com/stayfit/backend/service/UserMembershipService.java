package com.stayfit.backend.service;

import com.stayfit.backend.dto.MembershipCreateRequest;
import com.stayfit.backend.dto.MembershipResponse;
import com.stayfit.backend.entity.MembershipPlan;
import com.stayfit.backend.entity.MembershipStatus;
import com.stayfit.backend.entity.User;
import com.stayfit.backend.entity.UserMembership;
import com.stayfit.backend.exception.ActiveMembershipExistsException;
import com.stayfit.backend.exception.InactivePlanException;
import com.stayfit.backend.exception.ResourceNotFoundException;
import com.stayfit.backend.repository.MembershipPlanRepository;
import com.stayfit.backend.repository.UserMembershipRepository;
import com.stayfit.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class UserMembershipService {

	private final UserMembershipRepository userMembershipRepository;
	private final MembershipPlanRepository membershipPlanRepository;
	private final UserRepository userRepository;

	public UserMembershipService(UserMembershipRepository userMembershipRepository,
			MembershipPlanRepository membershipPlanRepository, UserRepository userRepository) {
		this.userMembershipRepository = userMembershipRepository;
		this.membershipPlanRepository = membershipPlanRepository;
		this.userRepository = userRepository;
	}

	@Transactional
	public MembershipResponse subscribe(Long userId, MembershipCreateRequest request) {
		MembershipPlan plan = membershipPlanRepository.findById(request.membershipPlanId())
				.orElseThrow(() -> new ResourceNotFoundException("Membership plan not found"));

		if (!plan.isActive()) {
			throw new InactivePlanException("This membership plan is not currently available");
		}

		userMembershipRepository.findByUserIdAndStatus(userId, MembershipStatus.ACTIVE).ifPresent(existing -> {
			reconcileExpiry(existing);
			if (existing.getStatus() == MembershipStatus.ACTIVE) {
				throw new ActiveMembershipExistsException("You already have an active membership");
			}
		});

		User owner = userRepository.getReferenceById(userId);
		LocalDate startDate = LocalDate.now();
		LocalDate endDate = startDate.plusDays(plan.getDurationDays());

		UserMembership membership = UserMembership.builder()
				.user(owner)
				.membershipPlan(plan)
				.startDate(startDate)
				.endDate(endDate)
				.status(MembershipStatus.ACTIVE)
				.build();

		return MembershipResponse.from(userMembershipRepository.save(membership));
	}

	@Transactional
	public MembershipResponse getCurrent(Long userId) {
		UserMembership membership = userMembershipRepository.findByUserIdAndStatus(userId, MembershipStatus.ACTIVE)
				.orElseThrow(() -> new ResourceNotFoundException("No current membership found"));
		reconcileExpiry(membership);
		return MembershipResponse.from(membership);
	}

	@Transactional(readOnly = true)
	public List<MembershipResponse> getHistory(Long userId) {
		return userMembershipRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
				.map(MembershipResponse::from)
				.toList();
	}

	@Transactional
	public MembershipResponse cancel(Long userId, Long membershipId) {
		UserMembership membership = userMembershipRepository.findByIdAndUserId(membershipId, userId)
				.orElseThrow(() -> new ResourceNotFoundException("Membership not found"));

		reconcileExpiry(membership);
		if (membership.getStatus() == MembershipStatus.ACTIVE) {
			membership.setStatus(MembershipStatus.CANCELLED);
		}

		return MembershipResponse.from(membership);
	}

	private void reconcileExpiry(UserMembership membership) {
		if (membership.getStatus() == MembershipStatus.ACTIVE && membership.getEndDate().isBefore(LocalDate.now())) {
			membership.setStatus(MembershipStatus.EXPIRED);
		}
	}

}
