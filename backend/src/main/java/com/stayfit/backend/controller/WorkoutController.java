package com.stayfit.backend.controller;

import com.stayfit.backend.dto.WorkoutCreateRequest;
import com.stayfit.backend.dto.WorkoutResponse;
import com.stayfit.backend.dto.WorkoutUpdateRequest;
import com.stayfit.backend.security.UserPrincipal;
import com.stayfit.backend.service.WorkoutService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/workouts")
public class WorkoutController {

	private final WorkoutService workoutService;

	public WorkoutController(WorkoutService workoutService) {
		this.workoutService = workoutService;
	}

	@PostMapping
	public ResponseEntity<WorkoutResponse> create(@AuthenticationPrincipal UserPrincipal principal,
			@Valid @RequestBody WorkoutCreateRequest request) {
		WorkoutResponse response = workoutService.create(principal.getId(), request);
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	@GetMapping
	public ResponseEntity<Page<WorkoutResponse>> list(@AuthenticationPrincipal UserPrincipal principal,
			@PageableDefault(size = 10, sort = "workoutDate", direction = Sort.Direction.DESC) Pageable pageable) {
		return ResponseEntity.ok(workoutService.list(principal.getId(), pageable));
	}

	@GetMapping("/{id}")
	public ResponseEntity<WorkoutResponse> get(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
		return ResponseEntity.ok(workoutService.get(principal.getId(), id));
	}

	@PutMapping("/{id}")
	public ResponseEntity<WorkoutResponse> update(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id,
			@Valid @RequestBody WorkoutUpdateRequest request) {
		return ResponseEntity.ok(workoutService.update(principal.getId(), id, request));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
		workoutService.delete(principal.getId(), id);
		return ResponseEntity.noContent().build();
	}

}
