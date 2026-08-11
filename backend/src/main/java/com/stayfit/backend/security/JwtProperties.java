package com.stayfit.backend.security;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/** Bound from JWT_SECRET / JWT_EXPIRATION environment variables via app.jwt.*. */
@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "app.jwt")
public class JwtProperties {

	@NotBlank
	private String secret;

	@Positive
	private long expiration;

}
