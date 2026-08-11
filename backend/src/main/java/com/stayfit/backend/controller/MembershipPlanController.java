package com.stayfit.backend.controller;

import com.stayfit.backend.dto.MembershipPlanResponse;
import com.stayfit.backend.service.MembershipPlanService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/membership-plans")
public class MembershipPlanController {

	private final MembershipPlanService membershipPlanService;

	public MembershipPlanController(MembershipPlanService membershipPlanService) {
		this.membershipPlanService = membershipPlanService;
	}

	@GetMapping
	public ResponseEntity<List<MembershipPlanResponse>> listActivePlans() {
		return ResponseEntity.ok(membershipPlanService.listActivePlans());
	}

	@GetMapping("/{id}")
	public ResponseEntity<MembershipPlanResponse> getById(@PathVariable Long id) {
		return ResponseEntity.ok(membershipPlanService.getById(id));
	}

}
