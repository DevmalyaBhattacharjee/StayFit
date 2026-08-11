package com.stayfit.backend.controller;

import com.stayfit.backend.dto.HealthProfileResponse;
import com.stayfit.backend.dto.HealthProfileUpdateRequest;
import com.stayfit.backend.security.UserPrincipal;
import com.stayfit.backend.service.ProgressService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/profile/health")
public class HealthProfileController {

	private final ProgressService progressService;

	public HealthProfileController(ProgressService progressService) {
		this.progressService = progressService;
	}

	@GetMapping
	public ResponseEntity<HealthProfileResponse> getCurrent(@AuthenticationPrincipal UserPrincipal principal) {
		return ResponseEntity.ok(progressService.getCurrentHealthProfile(principal.getId()));
	}

	@PutMapping
	public ResponseEntity<HealthProfileResponse> update(@AuthenticationPrincipal UserPrincipal principal,
			@Valid @RequestBody HealthProfileUpdateRequest request) {
		return ResponseEntity.ok(progressService.updateHealthProfile(principal.getId(), request));
	}

}
