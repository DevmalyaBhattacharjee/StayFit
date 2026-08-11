package com.stayfit.backend.controller;

import com.stayfit.backend.dto.ProgressRecordResponse;
import com.stayfit.backend.security.UserPrincipal;
import com.stayfit.backend.service.ProgressService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/progress")
public class ProgressController {

	private final ProgressService progressService;

	public ProgressController(ProgressService progressService) {
		this.progressService = progressService;
	}

	@GetMapping
	public ResponseEntity<Page<ProgressRecordResponse>> getHistory(@AuthenticationPrincipal UserPrincipal principal,
			@PageableDefault(size = 10, sort = { "recordedAt", "id" }, direction = Sort.Direction.DESC) Pageable pageable) {
		return ResponseEntity.ok(progressService.getHistory(principal.getId(), pageable));
	}

}
