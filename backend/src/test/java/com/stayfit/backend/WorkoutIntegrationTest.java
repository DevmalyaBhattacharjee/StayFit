package com.stayfit.backend;

import com.stayfit.backend.dto.AuthResponse;
import com.stayfit.backend.dto.LoginRequest;
import com.stayfit.backend.dto.RegisterRequest;
import com.stayfit.backend.dto.UserResponse;
import com.stayfit.backend.dto.WorkoutCreateRequest;
import com.stayfit.backend.dto.WorkoutResponse;
import com.stayfit.backend.dto.WorkoutUpdateRequest;
import com.stayfit.backend.entity.Gender;
import com.stayfit.backend.entity.Workout;
import com.stayfit.backend.entity.WorkoutType;
import com.stayfit.backend.exception.ApiError;
import com.stayfit.backend.repository.UserRepository;
import com.stayfit.backend.repository.WorkoutRepository;
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

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestRestTemplate
class WorkoutIntegrationTest {

	@Autowired
	private TestRestTemplate restTemplate;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private WorkoutRepository workoutRepository;

	private final List<String> createdEmails = new ArrayList<>();
	private final List<Long> createdWorkoutIds = new ArrayList<>();

	private String emailA;
	private String emailB;
	private String tokenA;
	private String tokenB;

	@BeforeEach
	void setUp() {
		emailA = uniqueEmail();
		emailB = uniqueEmail();
		tokenA = registerAndLogin(emailA);
		tokenB = registerAndLogin(emailB);
	}

	@AfterEach
	void cleanUp() {
		if (!createdWorkoutIds.isEmpty()) {
			workoutRepository.deleteAllById(createdWorkoutIds);
			createdWorkoutIds.clear();
		}
		createdEmails.forEach(email -> userRepository.findByEmail(email).ifPresent(userRepository::delete));
		createdEmails.clear();
	}

	private String uniqueEmail() {
		return "workout-test-" + UUID.randomUUID() + "@example.com";
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

	private WorkoutCreateRequest createRequest(LocalDate date) {
		return new WorkoutCreateRequest(date, WorkoutType.CARDIO, 30, 250, "Evening run");
	}

	private ResponseEntity<WorkoutResponse> createWorkout(String token, WorkoutCreateRequest request) {
		ResponseEntity<WorkoutResponse> response = restTemplate.exchange("/api/v1/workouts", HttpMethod.POST,
				new HttpEntity<>(request, authHeaders(token)), WorkoutResponse.class);
		if (response.getBody() != null) {
			createdWorkoutIds.add(response.getBody().id());
		}
		return response;
	}

	@Test
	void authenticatedUser_canCreateWorkout() {
		ResponseEntity<WorkoutResponse> response = createWorkout(tokenA, createRequest(LocalDate.now()));

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
		assertThat(response.getBody()).isNotNull();
		assertThat(response.getBody().id()).isNotNull();
		assertThat(response.getBody().workoutType()).isEqualTo(WorkoutType.CARDIO);
		assertThat(response.getBody().durationMinutes()).isEqualTo(30);
	}

	@Test
	void unauthenticatedUser_cannotCreateWorkout() {
		ResponseEntity<ApiError> response = restTemplate.postForEntity(
				"/api/v1/workouts", createRequest(LocalDate.now()), ApiError.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
	}

	@Test
	void authenticatedUser_canRetrieveOwnWorkouts() {
		createWorkout(tokenA, createRequest(LocalDate.now()));
		createWorkout(tokenA, createRequest(LocalDate.now().minusDays(1)));

		Map<String, Object> page = listWorkouts(tokenA, "");

		assertThat(((Number) page.get("totalElements")).intValue()).isEqualTo(2);
		assertThat((List<?>) page.get("content")).hasSize(2);
	}

	@Test
	void userOnlyReceivesOwnWorkouts() {
		createWorkout(tokenA, createRequest(LocalDate.now()));
		createWorkout(tokenB, createRequest(LocalDate.now()));

		Map<String, Object> page = listWorkouts(tokenA, "");
		List<?> content = (List<?>) page.get("content");

		assertThat(content).hasSize(1);
	}

	@Test
	void authenticatedUser_canRetrieveOwnWorkoutById() {
		Long id = createWorkout(tokenA, createRequest(LocalDate.now())).getBody().id();

		ResponseEntity<WorkoutResponse> response = restTemplate.exchange(
				"/api/v1/workouts/" + id, HttpMethod.GET, new HttpEntity<>(authHeaders(tokenA)), WorkoutResponse.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
		assertThat(response.getBody().id()).isEqualTo(id);
	}

	@Test
	void userCannotRetrieveAnotherUsersWorkout() {
		Long id = createWorkout(tokenB, createRequest(LocalDate.now())).getBody().id();

		ResponseEntity<ApiError> response = restTemplate.exchange(
				"/api/v1/workouts/" + id, HttpMethod.GET, new HttpEntity<>(authHeaders(tokenA)), ApiError.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
	}

	@Test
	void authenticatedUser_canUpdateOwnWorkout() {
		Long id = createWorkout(tokenA, createRequest(LocalDate.now())).getBody().id();
		WorkoutUpdateRequest update = new WorkoutUpdateRequest(LocalDate.now(), WorkoutType.STRENGTH, 45, 400, "Updated");

		ResponseEntity<WorkoutResponse> response = restTemplate.exchange("/api/v1/workouts/" + id, HttpMethod.PUT,
				new HttpEntity<>(update, authHeaders(tokenA)), WorkoutResponse.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
		assertThat(response.getBody().workoutType()).isEqualTo(WorkoutType.STRENGTH);
		assertThat(response.getBody().durationMinutes()).isEqualTo(45);
		assertThat(response.getBody().notes()).isEqualTo("Updated");
	}

	@Test
	void userCannotUpdateAnotherUsersWorkout() {
		Long id = createWorkout(tokenB, createRequest(LocalDate.now())).getBody().id();
		WorkoutUpdateRequest update = new WorkoutUpdateRequest(LocalDate.now(), WorkoutType.STRENGTH, 45, 400, "Hacked");

		ResponseEntity<ApiError> response = restTemplate.exchange("/api/v1/workouts/" + id, HttpMethod.PUT,
				new HttpEntity<>(update, authHeaders(tokenA)), ApiError.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);

		ResponseEntity<WorkoutResponse> stillOwnedByB = restTemplate.exchange(
				"/api/v1/workouts/" + id, HttpMethod.GET, new HttpEntity<>(authHeaders(tokenB)), WorkoutResponse.class);
		assertThat(stillOwnedByB.getBody().notes()).isEqualTo("Evening run");
	}

	@Test
	void authenticatedUser_canDeleteOwnWorkout() {
		Long id = createWorkout(tokenA, createRequest(LocalDate.now())).getBody().id();

		ResponseEntity<Void> deleteResponse = restTemplate.exchange(
				"/api/v1/workouts/" + id, HttpMethod.DELETE, new HttpEntity<>(authHeaders(tokenA)), Void.class);
		assertThat(deleteResponse.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

		ResponseEntity<ApiError> getResponse = restTemplate.exchange(
				"/api/v1/workouts/" + id, HttpMethod.GET, new HttpEntity<>(authHeaders(tokenA)), ApiError.class);
		assertThat(getResponse.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
	}

	@Test
	void userCannotDeleteAnotherUsersWorkout() {
		Long id = createWorkout(tokenB, createRequest(LocalDate.now())).getBody().id();

		ResponseEntity<ApiError> response = restTemplate.exchange(
				"/api/v1/workouts/" + id, HttpMethod.DELETE, new HttpEntity<>(authHeaders(tokenA)), ApiError.class);
		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);

		ResponseEntity<WorkoutResponse> stillExists = restTemplate.exchange(
				"/api/v1/workouts/" + id, HttpMethod.GET, new HttpEntity<>(authHeaders(tokenB)), WorkoutResponse.class);
		assertThat(stillExists.getStatusCode()).isEqualTo(HttpStatus.OK);
	}

	@Test
	void invalidDuration_isRejected() {
		WorkoutCreateRequest invalid = new WorkoutCreateRequest(LocalDate.now(), WorkoutType.CARDIO, -5, 100, null);

		ResponseEntity<ApiError> response = restTemplate.exchange("/api/v1/workouts", HttpMethod.POST,
				new HttpEntity<>(invalid, authHeaders(tokenA)), ApiError.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
		assertThat(response.getBody().fieldErrors()).containsKey("durationMinutes");
	}

	@Test
	void negativeCalories_isRejected() {
		WorkoutCreateRequest invalid = new WorkoutCreateRequest(LocalDate.now(), WorkoutType.CARDIO, 30, -50, null);

		ResponseEntity<ApiError> response = restTemplate.exchange("/api/v1/workouts", HttpMethod.POST,
				new HttpEntity<>(invalid, authHeaders(tokenA)), ApiError.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
		assertThat(response.getBody().fieldErrors()).containsKey("caloriesBurned");
	}

	@Test
	void missingWorkoutType_isRejected() {
		WorkoutCreateRequest invalid = new WorkoutCreateRequest(LocalDate.now(), null, 30, 100, null);

		ResponseEntity<ApiError> response = restTemplate.exchange("/api/v1/workouts", HttpMethod.POST,
				new HttpEntity<>(invalid, authHeaders(tokenA)), ApiError.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
		assertThat(response.getBody().fieldErrors()).containsKey("workoutType");
	}

	@Test
	void invalidRequestData_returnsExistingApiErrorFormat() {
		WorkoutCreateRequest invalid = new WorkoutCreateRequest(LocalDate.now(), null, -5, -5, null);

		ResponseEntity<ApiError> response = restTemplate.exchange("/api/v1/workouts", HttpMethod.POST,
				new HttpEntity<>(invalid, authHeaders(tokenA)), ApiError.class);

		assertThat(response.getBody()).isNotNull();
		assertThat(response.getBody().status()).isEqualTo(400);
		assertThat(response.getBody().error()).isEqualTo("Validation Failed");
		assertThat(response.getBody().path()).isEqualTo("/api/v1/workouts");
		assertThat(response.getBody().timestamp()).isNotNull();
	}

	@Test
	void invalidPaginationParameters_fallBackToDefaultsWithoutError() {
		Map<String, Object> page = listWorkouts(tokenA, "?page=not-a-number&size=oops");

		assertThat(((Number) page.get("number")).intValue()).isEqualTo(0);
		assertThat(((Number) page.get("size")).intValue()).isEqualTo(10);
	}

	@Test
	void invalidWorkoutIdPathVariable_returnsBadRequest() {
		ResponseEntity<ApiError> response = restTemplate.exchange("/api/v1/workouts/not-a-number",
				HttpMethod.GET, new HttpEntity<>(authHeaders(tokenA)), ApiError.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
	}

	@Test
	void pagination_worksCorrectly() {
		createWorkout(tokenA, createRequest(LocalDate.now()));
		createWorkout(tokenA, createRequest(LocalDate.now().minusDays(1)));
		createWorkout(tokenA, createRequest(LocalDate.now().minusDays(2)));

		Map<String, Object> firstPage = listWorkouts(tokenA, "?page=0&size=2");
		assertThat((List<?>) firstPage.get("content")).hasSize(2);
		assertThat(((Number) firstPage.get("totalElements")).intValue()).isEqualTo(3);

		Map<String, Object> secondPage = listWorkouts(tokenA, "?page=1&size=2");
		assertThat((List<?>) secondPage.get("content")).hasSize(1);
	}

	@Test
	void defaultSorting_returnsNewestWorkoutsFirst() {
		createWorkout(tokenA, createRequest(LocalDate.now().minusDays(2)));
		createWorkout(tokenA, createRequest(LocalDate.now()));
		createWorkout(tokenA, createRequest(LocalDate.now().minusDays(1)));

		Map<String, Object> page = listWorkouts(tokenA, "");
		List<?> content = (List<?>) page.get("content");

		String firstDate = (String) ((Map<?, ?>) content.get(0)).get("workoutDate");
		String lastDate = (String) ((Map<?, ?>) content.get(content.size() - 1)).get("workoutDate");

		assertThat(LocalDate.parse(firstDate)).isAfterOrEqualTo(LocalDate.parse(lastDate));
		assertThat(LocalDate.parse(firstDate)).isEqualTo(LocalDate.now());
	}

	@Test
	void databasePersistenceWorksCorrectly() {
		ResponseEntity<WorkoutResponse> response = createWorkout(tokenA, createRequest(LocalDate.now()));
		Long id = response.getBody().id();

		Workout persisted = workoutRepository.findById(id).orElseThrow();

		assertThat(persisted.getWorkoutType()).isEqualTo(WorkoutType.CARDIO);
		assertThat(persisted.getDurationMinutes()).isEqualTo(30);
		assertThat(persisted.getCaloriesBurned()).isEqualTo(250);
		assertThat(persisted.getCreatedAt()).isNotNull();
	}

	private Map<String, Object> listWorkouts(String token, String query) {
		ResponseEntity<Map<String, Object>> response = restTemplate.exchange("/api/v1/workouts" + query,
				HttpMethod.GET, new HttpEntity<>(authHeaders(token)), new ParameterizedTypeReference<>() {
				});
		return response.getBody();
	}

}
