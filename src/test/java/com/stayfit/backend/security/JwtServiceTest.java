package com.stayfit.backend.security;

import com.stayfit.backend.entity.Gender;
import com.stayfit.backend.entity.User;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

	private JwtService jwtService;
	private UserPrincipal principal;

	@BeforeEach
	void setUp() {
		JwtProperties properties = new JwtProperties();
		properties.setSecret("test-only-secret-key-that-is-long-enough-for-hs256");
		properties.setExpiration(60_000L);
		jwtService = new JwtService(properties);

		User user = User.builder()
				.id(1L)
				.name("Jane Doe")
				.email("jane@example.com")
				.password("irrelevant-hash")
				.dateOfBirth(LocalDate.of(1995, 1, 1))
				.gender(Gender.FEMALE)
				.height(165.0)
				.weight(60.0)
				.enabled(true)
				.build();
		principal = new UserPrincipal(user);
	}

	@Test
	void generatesTokenWithSubjectMatchingEmail() {
		String token = jwtService.generateToken(principal);

		assertThat(token).isNotBlank();
		assertThat(jwtService.extractEmail(token)).isEqualTo("jane@example.com");
	}

	@Test
	void validTokenPassesValidationForMatchingUser() {
		String token = jwtService.generateToken(principal);

		assertThat(jwtService.isTokenValid(token, principal)).isTrue();
	}

	@Test
	void tamperedTokenIsRejected() {
		String token = jwtService.generateToken(principal);
		String tampered = token.substring(0, token.length() - 2) + "xx";

		assertThatThrownBy(() -> jwtService.parseClaims(tampered)).isInstanceOf(JwtException.class);
	}

	@Test
	void expiredTokenIsRejected() throws InterruptedException {
		JwtProperties properties = new JwtProperties();
		properties.setSecret("test-only-secret-key-that-is-long-enough-for-hs256");
		properties.setExpiration(1L);
		JwtService shortLivedService = new JwtService(properties);

		String token = shortLivedService.generateToken(principal);
		Thread.sleep(20);

		assertThatThrownBy(() -> shortLivedService.parseClaims(token)).isInstanceOf(ExpiredJwtException.class);
	}

}
