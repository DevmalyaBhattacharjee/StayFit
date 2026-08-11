package com.stayfit.backend.controller;

import com.stayfit.backend.dto.HealthResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

	@GetMapping("/api/v1/health")
	public HealthResponse health() {
		return new HealthResponse("UP", "stayfit-backend");
	}

}
