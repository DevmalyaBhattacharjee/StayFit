package com.stayfit.backend;

import com.stayfit.backend.dto.AuthResponse;
import com.stayfit.backend.dto.HealthProfileResponse;
import com.stayfit.backend.dto.HealthProfileUpdateRequest;
import com.stayfit.backend.dto.HealthResponse;
import com.stayfit.backend.dto.LoginRequest;
import com.stayfit.backend.dto.RegisterRequest;
import com.stayfit.backend.dto.UserResponse;
import com.stayfit.backend.entity.Gender;
import com.stayfit.backend.entity.ProgressRecord;
import com.stayfit.backend.entity.User;
import com.stayfit.backend.exception.ApiError;
import com.stayfit.backend.repository.ProgressRecordRepository;
import com.stayfit.backend.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureTestRestTemplate;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestRestTemplate
class ProgressIntegrationTest {

	@Autowired
	private TestRestTemplate restTemplate;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private ProgressRecordRepository progressRecordRepository;

	private final List<String> createdEmails = new ArrayList<>();

	private String emailA;
	private String tokenA;

	@BeforeEach
	void setUp() {
		emailA = uniqueEmail();
		tokenA = registerAndLogin(emailA, 67.0, 176.0);
	}

	@AfterEach
	void cleanUp() {
		createdEmails.forEach(email -> userRepository.findByEmail(email).ifPresent(user -> {
			progressRecordRepository.findByUserId(user.getId(), Pageable.unpaged())
					.forEach(progressRecordRepository::delete);
			userRepository.delete(user);
		}));
		createdEmails.clear();
	}

	private String uniqueEmail() {
		return "progress-test-" + UUID.randomUUID() + "@example.com";
	}

	private String registerAndLogin(String email, double weight, double height) {
		createdEmails.add(email.trim().toLowerCase());
		RegisterRequest request = new RegisterRequest("Test User", email, "SuperSecret1",
				LocalDate.of(1995, 6, 15), Gender.FEMALE, height, weight);
		restTemplate.postForEntity("/api/v1/auth/register", request, UserResponse.class);
		AuthResponse login = restTemplate.postForEntity(
				"/api/v1/auth/login", new LoginRequest(email, "SuperSecret1"), AuthResponse.class).getBody();
		return login.accessToken();
	}

	private HttpHeaders authHeaders(String token) {
		HttpHeaders headers = new HttpHeaders();
		headers.setBearerAuth(token);
		return headers;
	}

	private ResponseEntity<HealthProfileResponse> updateHealth(String token, Double weight, Double height) {
		return restTemplate.exchange("/api/v1/profile/health", HttpMethod.PUT,
				new HttpEntity<>(new HealthProfileUpdateRequest(weight, height), authHeaders(token)), HealthProfileResponse.class);
	}

	private ResponseEntity<HealthProfileResponse> getCurrent(String token) {
		return restTemplate.exchange("/api/v1/profile/health", HttpMethod.GET,
				new HttpEntity<>(authHeaders(token)), HealthProfileResponse.class);
	}

	@SuppressWarnings("unchecked")
	private Map<String, Object> getHistory(String token, String query) {
		ResponseEntity<Map<String, Object>> response = restTemplate.exchange("/api/v1/progress" + query,
				HttpMethod.GET, new HttpEntity<>(authHeaders(token)), new ParameterizedTypeReference<>() {
				});
		return response.getBody();
	}

	@SuppressWarnings("unchecked")
	private List<Map<String, Object>> content(Map<String, Object> page) {
		return (List<Map<String, Object>>) page.get("content");
	}

	@Test
	void authenticatedUser_canRetrieveCurrentHealthProfile() {
		ResponseEntity<HealthProfileResponse> response = getCurrent(tokenA);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
		assertThat(response.getBody().weight()).isEqualTo(67.0);
		assertThat(response.getBody().height()).isEqualTo(176.0);
	}

	@Test
	void unauthenticatedUser_cannotAccessHealthProfile() {
		ResponseEntity<ApiError> response = restTemplate.getForEntity("/api/v1/profile/health", ApiError.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
	}

	@Test
	void authenticatedUser_canUpdateHealthData_andCurrentValuesReflectIt() {
		ResponseEntity<HealthProfileResponse> updateResponse = updateHealth(tokenA, 68.0, 176.0);
		assertThat(updateResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
		assertThat(updateResponse.getBody().weight()).isEqualTo(68.0);

		ResponseEntity<HealthProfileResponse> current = getCurrent(tokenA);
		assertThat(current.getBody().weight()).isEqualTo(68.0);
		assertThat(current.getBody().height()).isEqualTo(176.0);
	}

	@Test
	void scenarioA_firstUpdateCreatesBaselineAndPreservesPreviousValue() {
		updateHealth(tokenA, 68.0, 176.0);

		List<Map<String, Object>> history = content(getHistory(tokenA, ""));

		assertThat(history).hasSize(2);
		assertThat(history.get(0).get("weight")).isEqualTo(68.0);
		assertThat(history.get(1).get("weight")).isEqualTo(67.0);
		assertThat(history.get(1).get("height")).isEqualTo(176.0);
	}

	@Test
	void history_breaksTiesByIdWhenRecordedAtIsIdentical() {
		// Regression test: two records created in the same request (e.g. the
		// baseline + new snapshot from a first health update) can end up with
		// the exact same stored recordedAt value on platforms with coarse clock
		// resolution. "Newest first" must still be deterministic in that case.
		User user = userRepository.findByEmail(emailA.toLowerCase()).orElseThrow();
		Instant tiedInstant = Instant.now();

		ProgressRecord older = progressRecordRepository.save(ProgressRecord.builder()
				.user(user).weight(67.0).height(176.0).recordedAt(tiedInstant).build());
		ProgressRecord newer = progressRecordRepository.save(ProgressRecord.builder()
				.user(user).weight(68.0).height(176.0).recordedAt(tiedInstant).build());

		List<Map<String, Object>> history = content(getHistory(tokenA, ""));

		assertThat(history).hasSize(2);
		assertThat(((Number) history.get(0).get("id")).longValue()).isEqualTo(newer.getId());
		assertThat(((Number) history.get(1).get("id")).longValue()).isEqualTo(older.getId());
	}

	@Test
	void scenarioB_identicalUpdateDoesNotCreateDuplicate() {
		updateHealth(tokenA, 68.0, 176.0);
		ResponseEntity<HealthProfileResponse> secondResponse = updateHealth(tokenA, 68.0, 176.0);

		assertThat(secondResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
		List<Map<String, Object>> history = content(getHistory(tokenA, ""));
		assertThat(history).hasSize(2);
	}

	@Test
	void scenarioC_subsequentChangeAddsToTimelineWithoutRecapturingPrevious() {
		updateHealth(tokenA, 68.0, 176.0);
		updateHealth(tokenA, 69.0, 175.0);

		List<Map<String, Object>> history = content(getHistory(tokenA, ""));

		assertThat(history).hasSize(3);
		assertThat(history.get(0).get("weight")).isEqualTo(69.0);
		assertThat(history.get(0).get("height")).isEqualTo(175.0);
		assertThat(history.get(1).get("weight")).isEqualTo(68.0);
		assertThat(history.get(2).get("weight")).isEqualTo(67.0);
	}

	@Test
	void history_isOrderedNewestFirst() {
		updateHealth(tokenA, 68.0, 176.0);
		updateHealth(tokenA, 69.0, 176.0);

		List<Map<String, Object>> history = content(getHistory(tokenA, ""));

		String first = (String) history.get(0).get("recordedAt");
		String last = (String) history.get(history.size() - 1).get("recordedAt");
		assertThat(first).isGreaterThanOrEqualTo(last);
	}

	@Test
	void pagination_worksCorrectly() {
		updateHealth(tokenA, 68.0, 176.0);
		updateHealth(tokenA, 69.0, 175.0);
		updateHealth(tokenA, 70.0, 175.0);

		Map<String, Object> page0 = getHistory(tokenA, "?page=0&size=2");
		assertThat(content(page0)).hasSize(2);
		assertThat(((Number) page0.get("totalElements")).intValue()).isEqualTo(4);

		Map<String, Object> page1 = getHistory(tokenA, "?page=1&size=2");
		assertThat(content(page1)).hasSize(2);
	}

	@Test
	void maxPageSize_isRespected() {
		Map<String, Object> page = getHistory(tokenA, "?page=0&size=1000");

		assertThat(((Number) page.get("size")).intValue()).isEqualTo(50);
	}

	@Test
	void scenarioD_userOnlySeesOwnHistory() {
		String emailB = uniqueEmail();
		String tokenB = registerAndLogin(emailB, 60.0, 160.0);
		updateHealth(tokenA, 68.0, 176.0);

		List<Map<String, Object>> historyA = content(getHistory(tokenA, ""));
		List<Map<String, Object>> historyB = content(getHistory(tokenB, ""));

		assertThat(historyA).hasSize(2);
		assertThat(historyB).isEmpty();
	}

	@Test
	void scenarioE_noApiParameterExposesAnotherUsersProgress() {
		String emailB = uniqueEmail();
		String tokenB = registerAndLogin(emailB, 60.0, 160.0);
		updateHealth(tokenA, 68.0, 176.0);

		ResponseEntity<HealthProfileResponse> bProfile = getCurrent(tokenB);

		assertThat(bProfile.getBody().weight()).isEqualTo(60.0);
		assertThat(bProfile.getBody().userId()).isNotEqualTo(getCurrent(tokenA).getBody().userId());
	}

	@Test
	void invalidWeight_isRejected() {
		ResponseEntity<ApiError> response = restTemplate.exchange("/api/v1/profile/health", HttpMethod.PUT,
				new HttpEntity<>(new HealthProfileUpdateRequest(-5.0, 176.0), authHeaders(tokenA)), ApiError.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
		assertThat(response.getBody().fieldErrors()).containsKey("weight");
	}

	@Test
	void excessiveWeight_isRejected() {
		ResponseEntity<ApiError> response = restTemplate.exchange("/api/v1/profile/health", HttpMethod.PUT,
				new HttpEntity<>(new HealthProfileUpdateRequest(600.0, 176.0), authHeaders(tokenA)), ApiError.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
		assertThat(response.getBody().fieldErrors()).containsKey("weight");
	}

	@Test
	void invalidHeight_isRejected() {
		ResponseEntity<ApiError> response = restTemplate.exchange("/api/v1/profile/health", HttpMethod.PUT,
				new HttpEntity<>(new HealthProfileUpdateRequest(68.0, 0.0), authHeaders(tokenA)), ApiError.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
		assertThat(response.getBody().fieldErrors()).containsKey("height");
	}

	@Test
	void missingRequiredValues_areRejected() {
		ResponseEntity<ApiError> response = restTemplate.exchange("/api/v1/profile/health", HttpMethod.PUT,
				new HttpEntity<>(new HealthProfileUpdateRequest(null, null), authHeaders(tokenA)), ApiError.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
		assertThat(response.getBody().fieldErrors()).containsKeys("weight", "height");
	}

	@Test
	void updateIsTransactional_currentAndHistoryStayConsistent() {
		updateHealth(tokenA, 68.0, 176.0);

		HealthProfileResponse current = getCurrent(tokenA).getBody();
		Map<String, Object> latest = content(getHistory(tokenA, "")).get(0);

		assertThat(current.weight()).isEqualTo(((Number) latest.get("weight")).doubleValue());
		assertThat(current.height()).isEqualTo(((Number) latest.get("height")).doubleValue());
	}

	@Test
	void healthEndpoint_remainsUnaffected() {
		ResponseEntity<HealthResponse> response = restTemplate.getForEntity("/api/v1/health", HealthResponse.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
		assertThat(response.getBody().status()).isEqualTo("UP");
	}

}
