package com.stayfit.backend.controller;

import com.stayfit.backend.dto.MembershipCreateRequest;
import com.stayfit.backend.dto.MembershipResponse;
import com.stayfit.backend.security.UserPrincipal;
import com.stayfit.backend.service.UserMembershipService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/memberships")
public class UserMembershipController {

	private final UserMembershipService userMembershipService;

	public UserMembershipController(UserMembershipService userMembershipService) {
		this.userMembershipService = userMembershipService;
	}

	@PostMapping
	public ResponseEntity<MembershipResponse> subscribe(@AuthenticationPrincipal UserPrincipal principal,
			@Valid @RequestBody MembershipCreateRequest request) {
		MembershipResponse response = userMembershipService.subscribe(principal.getId(), request);
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	@GetMapping("/current")
	public ResponseEntity<MembershipResponse> getCurrent(@AuthenticationPrincipal UserPrincipal principal) {
		return ResponseEntity.ok(userMembershipService.getCurrent(principal.getId()));
	}

	@GetMapping
	public ResponseEntity<List<MembershipResponse>> getHistory(@AuthenticationPrincipal UserPrincipal principal) {
		return ResponseEntity.ok(userMembershipService.getHistory(principal.getId()));
	}

	@PostMapping("/{id}/cancel")
	public ResponseEntity<MembershipResponse> cancel(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
		return ResponseEntity.ok(userMembershipService.cancel(principal.getId(), id));
	}

}
