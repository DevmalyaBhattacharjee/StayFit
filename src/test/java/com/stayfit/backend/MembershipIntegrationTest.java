package com.stayfit.backend;

import com.stayfit.backend.dto.AuthResponse;
import com.stayfit.backend.dto.LoginRequest;
import com.stayfit.backend.dto.MembershipCreateRequest;
import com.stayfit.backend.dto.MembershipPlanResponse;
import com.stayfit.backend.dto.MembershipResponse;
import com.stayfit.backend.dto.RegisterRequest;
import com.stayfit.backend.dto.UserResponse;
import com.stayfit.backend.entity.Gender;
import com.stayfit.backend.entity.MembershipPlan;
import com.stayfit.backend.entity.MembershipStatus;
import com.stayfit.backend.entity.User;
import com.stayfit.backend.entity.UserMembership;
import com.stayfit.backend.exception.ApiError;
import com.stayfit.backend.repository.MembershipPlanRepository;
import com.stayfit.backend.repository.UserMembershipRepository;
import com.stayfit.backend.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureTestRestTemplate;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestRestTemplate
class MembershipIntegrationTest {

	@Autowired
	private TestRestTemplate restTemplate;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private MembershipPlanRepository membershipPlanRepository;

	@Autowired
	private UserMembershipRepository userMembershipRepository;

	private final List<String> createdEmails = new ArrayList<>();
	private final List<Long> createdMembershipIds = new ArrayList<>();
	private final List<Long> createdPlanIds = new ArrayList<>();

	private String emailA;
	private String emailB;
	private String tokenA;
	private String tokenB;
	private Long basicPlanId;
	private Integer basicPlanDurationDays;

	@BeforeEach
	void setUp() {
		emailA = uniqueEmail();
		emailB = uniqueEmail();
		tokenA = registerAndLogin(emailA);
		tokenB = registerAndLogin(emailB);

		MembershipPlan basic = membershipPlanRepository.findByName("Basic").orElseThrow();
		basicPlanId = basic.getId();
		basicPlanDurationDays = basic.getDurationDays();
	}

	@AfterEach
	void cleanUp() {
		createdMembershipIds.forEach(id -> userMembershipRepository.findById(id).ifPresent(userMembershipRepository::delete));
		createdMembershipIds.clear();
		createdPlanIds.forEach(id -> membershipPlanRepository.findById(id).ifPresent(membershipPlanRepository::delete));
		createdPlanIds.clear();
		createdEmails.forEach(email -> userRepository.findByEmail(email).ifPresent(userRepository::delete));
		createdEmails.clear();
	}

	private String uniqueEmail() {
		return "membership-test-" + UUID.randomUUID() + "@example.com";
	}

	private String registerAndLogin(String email) {
		createdEmails.add(email.trim().toLowerCase());
		RegisterRequest request = new RegisterRequest("Test User", email, "SuperSecret1",
				LocalDate.of(1995, 6, 15), Gender.FEMALE, 165.0, 60.0);
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

	private ResponseEntity<MembershipResponse> subscribe(String token, Long planId) {
		ResponseEntity<MembershipResponse> response = restTemplate.exchange("/api/v1/memberships", HttpMethod.POST,
				new HttpEntity<>(new MembershipCreateRequest(planId), authHeaders(token)), MembershipResponse.class);
		if (response.getBody() != null) {
			createdMembershipIds.add(response.getBody().id());
		}
		return response;
	}

	private Long createInactivePlan() {
		MembershipPlan plan = membershipPlanRepository.save(MembershipPlan.builder()
				.name("Inactive-" + UUID.randomUUID())
				.description("Not available for new subscriptions")
				.durationDays(30)
				.price(new BigDecimal("999"))
				.active(false)
				.build());
		createdPlanIds.add(plan.getId());
		return plan.getId();
	}

	@Test
	void activePlans_areListedPublicly() {
		ResponseEntity<List<MembershipPlanResponse>> response = restTemplate.exchange("/api/v1/membership-plans",
				HttpMethod.GET, null, new ParameterizedTypeReference<>() {
				});

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
		List<String> names = response.getBody().stream().map(MembershipPlanResponse::name).toList();
		assertThat(names).contains("Basic", "Standard", "Premium");
		assertThat(response.getBody()).allMatch(MembershipPlanResponse::active);
	}

	@Test
	void inactivePlans_areNotReturnedInPublicList() {
		createInactivePlan();

		ResponseEntity<List<MembershipPlanResponse>> response = restTemplate.exchange("/api/v1/membership-plans",
				HttpMethod.GET, null, new ParameterizedTypeReference<>() {
				});

		assertThat(response.getBody()).noneMatch(p -> !p.active());
	}

	@Test
	void planById_returnsPlanDetails() {
		ResponseEntity<MembershipPlanResponse> response = restTemplate.getForEntity(
				"/api/v1/membership-plans/" + basicPlanId, MembershipPlanResponse.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
		assertThat(response.getBody().name()).isEqualTo("Basic");
	}

	@Test
	void planById_withInvalidId_returnsNotFound() {
		ResponseEntity<ApiError> response = restTemplate.getForEntity(
				"/api/v1/membership-plans/999999999", ApiError.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
	}

	@Test
	void authenticatedUser_canSubscribeToActivePlan() {
		ResponseEntity<MembershipResponse> response = subscribe(tokenA, basicPlanId);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
		assertThat(response.getBody().planName()).isEqualTo("Basic");
		assertThat(response.getBody().status()).isEqualTo(MembershipStatus.ACTIVE);
	}

	@Test
	void unauthenticatedUser_cannotSubscribe() {
		ResponseEntity<ApiError> response = restTemplate.postForEntity(
				"/api/v1/memberships", new MembershipCreateRequest(basicPlanId), ApiError.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
	}

	@Test
	void userCannotSubscribeToInactivePlan() {
		Long inactivePlanId = createInactivePlan();

		ResponseEntity<ApiError> response = subscribeExpectingError(tokenA, inactivePlanId);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
	}

	@Test
	void userCannotSubscribeWhenAlreadyActive() {
		subscribe(tokenA, basicPlanId);

		ResponseEntity<ApiError> response = subscribeExpectingError(tokenA, basicPlanId);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
	}

	@Test
	void startDate_isGeneratedByServer() {
		ResponseEntity<MembershipResponse> response = subscribe(tokenA, basicPlanId);

		assertThat(response.getBody().startDate()).isEqualTo(LocalDate.now());
	}

	@Test
	void endDate_isCorrectlyCalculatedFromDuration() {
		ResponseEntity<MembershipResponse> response = subscribe(tokenA, basicPlanId);

		assertThat(response.getBody().endDate()).isEqualTo(LocalDate.now().plusDays(basicPlanDurationDays));
	}

	@Test
	void status_startsAsActive() {
		ResponseEntity<MembershipResponse> response = subscribe(tokenA, basicPlanId);

		assertThat(response.getBody().status()).isEqualTo(MembershipStatus.ACTIVE);
	}

	@Test
	void currentMembershipEndpoint_returnsUsersMembership() {
		Long id = subscribe(tokenA, basicPlanId).getBody().id();

		ResponseEntity<MembershipResponse> response = restTemplate.exchange("/api/v1/memberships/current",
				HttpMethod.GET, new HttpEntity<>(authHeaders(tokenA)), MembershipResponse.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
		assertThat(response.getBody().id()).isEqualTo(id);
	}

	@Test
	void currentMembership_withNoneExisting_returnsNotFound() {
		ResponseEntity<ApiError> response = restTemplate.exchange("/api/v1/memberships/current",
				HttpMethod.GET, new HttpEntity<>(authHeaders(tokenB)), ApiError.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
	}

	@Test
	void history_returnsOnlyAuthenticatedUsersMemberships() {
		subscribe(tokenA, basicPlanId);
		subscribe(tokenB, basicPlanId);

		List<Map> history = getHistory(tokenA);

		assertThat(history).hasSize(1);
	}

	@Test
	void userCanCancelOwnActiveMembership() {
		Long id = subscribe(tokenA, basicPlanId).getBody().id();

		ResponseEntity<MembershipResponse> response = restTemplate.exchange("/api/v1/memberships/" + id + "/cancel",
				HttpMethod.POST, new HttpEntity<>(authHeaders(tokenA)), MembershipResponse.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
		assertThat(response.getBody().status()).isEqualTo(MembershipStatus.CANCELLED);
	}

	@Test
	void userCannotCancelAnotherUsersMembership() {
		Long id = subscribe(tokenB, basicPlanId).getBody().id();

		ResponseEntity<ApiError> response = restTemplate.exchange("/api/v1/memberships/" + id + "/cancel",
				HttpMethod.POST, new HttpEntity<>(authHeaders(tokenA)), ApiError.class);
		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);

		ResponseEntity<MembershipResponse> stillActive = restTemplate.exchange("/api/v1/memberships/current",
				HttpMethod.GET, new HttpEntity<>(authHeaders(tokenB)), MembershipResponse.class);
		assertThat(stillActive.getBody().status()).isEqualTo(MembershipStatus.ACTIVE);
	}

	@Test
	void membershipRecord_isRetainedAfterCancellation() {
		Long id = subscribe(tokenA, basicPlanId).getBody().id();
		restTemplate.exchange("/api/v1/memberships/" + id + "/cancel",
				HttpMethod.POST, new HttpEntity<>(authHeaders(tokenA)), MembershipResponse.class);

		List<Map> history = getHistory(tokenA);

		assertThat(history).hasSize(1);
		assertThat(history.get(0).get("status")).isEqualTo("CANCELLED");
	}

	@Test
	void userCanSubscribeAgainAfterCancellation() {
		Long id = subscribe(tokenA, basicPlanId).getBody().id();
		restTemplate.exchange("/api/v1/memberships/" + id + "/cancel",
				HttpMethod.POST, new HttpEntity<>(authHeaders(tokenA)), MembershipResponse.class);

		ResponseEntity<MembershipResponse> response = subscribe(tokenA, basicPlanId);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
		assertThat(response.getBody().status()).isEqualTo(MembershipStatus.ACTIVE);
	}

	@Test
	void expiredMembership_isHandledCorrectly() {
		insertBackdatedActiveMembership(emailA, LocalDate.now().minusDays(60), LocalDate.now().minusDays(1));

		ResponseEntity<MembershipResponse> response = restTemplate.exchange("/api/v1/memberships/current",
				HttpMethod.GET, new HttpEntity<>(authHeaders(tokenA)), MembershipResponse.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
		assertThat(response.getBody().status()).isEqualTo(MembershipStatus.EXPIRED);
	}

	@Test
	void userCanSubscribeAgainAfterExpiration() {
		insertBackdatedActiveMembership(emailA, LocalDate.now().minusDays(60), LocalDate.now().minusDays(1));
		restTemplate.exchange("/api/v1/memberships/current",
				HttpMethod.GET, new HttpEntity<>(authHeaders(tokenA)), MembershipResponse.class);

		ResponseEntity<MembershipResponse> response = subscribe(tokenA, basicPlanId);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
		assertThat(response.getBody().status()).isEqualTo(MembershipStatus.ACTIVE);
	}

	@Test
	void invalidPlanId_isHandledCorrectly() {
		ResponseEntity<ApiError> response = subscribeExpectingError(tokenA, 999999999L);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
	}

	@Test
	void validationErrors_returnExistingApiErrorFormat() {
		ResponseEntity<ApiError> response = restTemplate.exchange("/api/v1/memberships", HttpMethod.POST,
				new HttpEntity<>(new MembershipCreateRequest(null), authHeaders(tokenA)), ApiError.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
		assertThat(response.getBody().error()).isEqualTo("Validation Failed");
		assertThat(response.getBody().fieldErrors()).containsKey("membershipPlanId");
	}

	private void insertBackdatedActiveMembership(String email, LocalDate startDate, LocalDate endDate) {
		User user = userRepository.findByEmail(email.toLowerCase()).orElseThrow();
		MembershipPlan plan = membershipPlanRepository.findById(basicPlanId).orElseThrow();
		UserMembership membership = userMembershipRepository.save(UserMembership.builder()
				.user(user)
				.membershipPlan(plan)
				.startDate(startDate)
				.endDate(endDate)
				.status(MembershipStatus.ACTIVE)
				.build());
		createdMembershipIds.add(membership.getId());
	}

	private ResponseEntity<ApiError> subscribeExpectingError(String token, Long planId) {
		return restTemplate.exchange("/api/v1/memberships", HttpMethod.POST,
				new HttpEntity<>(new MembershipCreateRequest(planId), authHeaders(token)), ApiError.class);
	}

	@SuppressWarnings("rawtypes")
	private List<Map> getHistory(String token) {
		ResponseEntity<List<Map>> response = restTemplate.exchange("/api/v1/memberships", HttpMethod.GET,
				new HttpEntity<>(authHeaders(token)), new ParameterizedTypeReference<>() {
				});
		return response.getBody();
	}

}
