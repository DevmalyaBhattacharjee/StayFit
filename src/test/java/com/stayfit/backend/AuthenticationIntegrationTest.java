package com.stayfit.backend;

import com.stayfit.backend.dto.AuthResponse;
import com.stayfit.backend.dto.HealthResponse;
import com.stayfit.backend.dto.LoginRequest;
import com.stayfit.backend.dto.RegisterRequest;
import com.stayfit.backend.dto.UserResponse;
import com.stayfit.backend.entity.Gender;
import com.stayfit.backend.entity.User;
import com.stayfit.backend.exception.ApiError;
import com.stayfit.backend.repository.UserRepository;
import com.stayfit.backend.security.JwtProperties;
import com.stayfit.backend.security.JwtService;
import com.stayfit.backend.security.UserPrincipal;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureTestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestRestTemplate
class AuthenticationIntegrationTest {

	@Autowired
	private TestRestTemplate restTemplate;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private JwtProperties jwtProperties;

	private final List<String> createdEmails = new ArrayList<>();

	@AfterEach
	void cleanUp() {
		createdEmails.forEach(email -> userRepository.findByEmail(email).ifPresent(userRepository::delete));
		createdEmails.clear();
	}

	private RegisterRequest newRegisterRequest(String email, String password) {
		createdEmails.add(email.trim().toLowerCase());
		return new RegisterRequest("Jane Doe", email, password, LocalDate.of(1995, 6, 15), Gender.FEMALE, 165.0, 60.0);
	}

	private String uniqueEmail() {
		return "auth-test-" + UUID.randomUUID() + "@example.com";
	}

	@Test
	void register_withValidData_createsUserAndReturnsSafeProfile() {
		RegisterRequest request = newRegisterRequest(uniqueEmail(), "SuperSecret1");

		ResponseEntity<UserResponse> response = restTemplate.postForEntity(
				"/api/v1/auth/register", request, UserResponse.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
		assertThat(response.getBody()).isNotNull();
		assertThat(response.getBody().id()).isNotNull();
		assertThat(response.getBody().email()).isEqualTo(request.email().toLowerCase());
	}

	@Test
	void register_withDuplicateEmail_returnsConflict() {
		String email = uniqueEmail();
		RegisterRequest request = newRegisterRequest(email, "SuperSecret1");
		restTemplate.postForEntity("/api/v1/auth/register", request, UserResponse.class);

		ResponseEntity<ApiError> response = restTemplate.postForEntity(
				"/api/v1/auth/register", request, ApiError.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
	}

	@Test
	void register_persistsPasswordAsBcryptHash_notPlainText() {
		String email = uniqueEmail();
		String rawPassword = "SuperSecret1";
		RegisterRequest request = newRegisterRequest(email, rawPassword);

		restTemplate.postForEntity("/api/v1/auth/register", request, UserResponse.class);

		User saved = userRepository.findByEmail(email.toLowerCase()).orElseThrow();
		assertThat(saved.getPassword()).isNotEqualTo(rawPassword);
		assertThat(saved.getPassword()).startsWith("$2");
		assertThat(passwordEncoder.matches(rawPassword, saved.getPassword())).isTrue();
	}

	@Test
	void register_withMissingRequiredFields_returnsValidationErrors() {
		RegisterRequest invalid = new RegisterRequest("", "not-an-email", "short", null, null, -5.0, null);

		ResponseEntity<ApiError> response = restTemplate.postForEntity(
				"/api/v1/auth/register", invalid, ApiError.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
		assertThat(response.getBody()).isNotNull();
		assertThat(response.getBody().fieldErrors()).isNotEmpty();
	}

	@Test
	void login_withValidCredentials_returnsJwt() {
		String email = uniqueEmail();
		String password = "SuperSecret1";
		restTemplate.postForEntity("/api/v1/auth/register", newRegisterRequest(email, password), UserResponse.class);

		ResponseEntity<AuthResponse> response = restTemplate.postForEntity(
				"/api/v1/auth/login", new LoginRequest(email, password), AuthResponse.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
		assertThat(response.getBody()).isNotNull();
		assertThat(response.getBody().accessToken()).isNotBlank();
		assertThat(response.getBody().tokenType()).isEqualTo("Bearer");
		assertThat(response.getBody().user().email()).isEqualTo(email.toLowerCase());
	}

	@Test
	void login_withWrongPassword_returnsGenericUnauthorized() {
		String email = uniqueEmail();
		restTemplate.postForEntity("/api/v1/auth/register", newRegisterRequest(email, "SuperSecret1"), UserResponse.class);

		ResponseEntity<ApiError> response = restTemplate.postForEntity(
				"/api/v1/auth/login", new LoginRequest(email, "WrongPassword1"), ApiError.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
		assertThat(response.getBody()).isNotNull();
		assertThat(response.getBody().message()).isEqualTo("Invalid email or password");
	}

	@Test
	void login_withUnknownEmail_returnsSameGenericUnauthorized() {
		ResponseEntity<ApiError> response = restTemplate.postForEntity(
				"/api/v1/auth/login", new LoginRequest(uniqueEmail(), "WhateverPass1"), ApiError.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
		assertThat(response.getBody()).isNotNull();
		assertThat(response.getBody().message()).isEqualTo("Invalid email or password");
	}

	@Test
	void me_withoutToken_isRejected() {
		ResponseEntity<ApiError> response = restTemplate.getForEntity("/api/v1/auth/me", ApiError.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
	}

	@Test
	void me_withValidToken_returnsAuthenticatedUserProfile() {
		String email = uniqueEmail();
		String password = "SuperSecret1";
		restTemplate.postForEntity("/api/v1/auth/register", newRegisterRequest(email, password), UserResponse.class);
		AuthResponse login = restTemplate.postForEntity(
				"/api/v1/auth/login", new LoginRequest(email, password), AuthResponse.class).getBody();

		HttpHeaders headers = new HttpHeaders();
		headers.setBearerAuth(login.accessToken());
		ResponseEntity<UserResponse> response = restTemplate.exchange(
				"/api/v1/auth/me", HttpMethod.GET, new HttpEntity<>(headers), UserResponse.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
		assertThat(response.getBody()).isNotNull();
		assertThat(response.getBody().email()).isEqualTo(email.toLowerCase());
	}

	@Test
	void me_withMalformedToken_isRejected() {
		HttpHeaders headers = new HttpHeaders();
		headers.setBearerAuth("this.is.not-a-valid-jwt");
		ResponseEntity<ApiError> response = restTemplate.exchange(
				"/api/v1/auth/me", HttpMethod.GET, new HttpEntity<>(headers), ApiError.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
	}

	@Test
	void me_withExpiredToken_isRejected() throws InterruptedException {
		String email = uniqueEmail();
		String password = "SuperSecret1";
		restTemplate.postForEntity("/api/v1/auth/register", newRegisterRequest(email, password), UserResponse.class);
		User user = userRepository.findByEmail(email.toLowerCase()).orElseThrow();

		JwtProperties shortLived = new JwtProperties();
		shortLived.setSecret(jwtProperties.getSecret());
		shortLived.setExpiration(1L);
		String expiredToken = new JwtService(shortLived).generateToken(new UserPrincipal(user));
		Thread.sleep(20);

		HttpHeaders headers = new HttpHeaders();
		headers.setBearerAuth(expiredToken);
		ResponseEntity<ApiError> response = restTemplate.exchange(
				"/api/v1/auth/me", HttpMethod.GET, new HttpEntity<>(headers), ApiError.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
	}

	@Test
	void health_remainsPublicAfterSecurityConfigChange() {
		ResponseEntity<HealthResponse> response = restTemplate.getForEntity("/api/v1/health", HealthResponse.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
		assertThat(response.getBody()).isNotNull();
		assertThat(response.getBody().status()).isEqualTo("UP");
	}

}
