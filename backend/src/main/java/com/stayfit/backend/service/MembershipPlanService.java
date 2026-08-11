package com.stayfit.backend.service;

import com.stayfit.backend.dto.MembershipPlanResponse;
import com.stayfit.backend.exception.ResourceNotFoundException;
import com.stayfit.backend.repository.MembershipPlanRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MembershipPlanService {

	private final MembershipPlanRepository membershipPlanRepository;

	public MembershipPlanService(MembershipPlanRepository membershipPlanRepository) {
		this.membershipPlanRepository = membershipPlanRepository;
	}

	public List<MembershipPlanResponse> listActivePlans() {
		return membershipPlanRepository.findByActiveTrue().stream()
				.map(MembershipPlanResponse::from)
				.toList();
	}

	public MembershipPlanResponse getById(Long id) {
		return membershipPlanRepository.findById(id)
				.map(MembershipPlanResponse::from)
				.orElseThrow(() -> new ResourceNotFoundException("Membership plan not found"));
	}

}
