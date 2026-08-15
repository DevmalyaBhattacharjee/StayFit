package com.stayfit.backend.security;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Stateless JWT-based authentication.
 */
@Configuration
public class SecurityConfig {

	private final JwtAuthenticationFilter jwtAuthenticationFilter;
	private final CustomUserDetailsService userDetailsService;
	private final RestAuthenticationEntryPoint authenticationEntryPoint;
	private final RestAccessDeniedHandler accessDeniedHandler;

	public SecurityConfig(
			JwtAuthenticationFilter jwtAuthenticationFilter,
			CustomUserDetailsService userDetailsService,
			RestAuthenticationEntryPoint authenticationEntryPoint,
			RestAccessDeniedHandler accessDeniedHandler) {

		this.jwtAuthenticationFilter = jwtAuthenticationFilter;
		this.userDetailsService = userDetailsService;
		this.authenticationEntryPoint = authenticationEntryPoint;
		this.accessDeniedHandler = accessDeniedHandler;
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public DaoAuthenticationProvider authenticationProvider() {
		DaoAuthenticationProvider provider =
				new DaoAuthenticationProvider(userDetailsService);

		provider.setPasswordEncoder(passwordEncoder());

		return provider;
	}

	@Bean
	public AuthenticationManager authenticationManager(
			AuthenticationConfiguration config) throws Exception {

		return config.getAuthenticationManager();
	}

	/**
	 * CORS configuration for local development and Vercel production frontend.
	 */
	@Bean
	public CorsConfigurationSource corsConfigurationSource() {

		CorsConfiguration configuration = new CorsConfiguration();

		configuration.setAllowedOrigins(List.of(
				"http://localhost:5173",
				"https://stayfit-health.vercel.app"
		));

		configuration.setAllowedMethods(List.of(
				"GET",
				"POST",
				"PUT",
				"PATCH",
				"DELETE",
				"OPTIONS"
		));

		configuration.setAllowedHeaders(List.of("*"));

		configuration.setAllowCredentials(true);

		UrlBasedCorsConfigurationSource source =
				new UrlBasedCorsConfigurationSource();

		source.registerCorsConfiguration("/**", configuration);

		return source;
	}

	@Bean
	public SecurityFilterChain securityFilterChain(
			HttpSecurity http) throws Exception {

		http
				// Disable CSRF because this is a stateless REST API
				.csrf(csrf -> csrf.disable())

				// Enable CORS using the CorsConfigurationSource above
				.cors(cors -> {})

				// Stateless JWT authentication
				.sessionManagement(session ->
						session.sessionCreationPolicy(
								SessionCreationPolicy.STATELESS))

				.authenticationProvider(authenticationProvider())

				.authorizeHttpRequests(authorize -> authorize

						// Allow browser CORS preflight requests
						.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

						// Public authentication endpoints
						.requestMatchers(
								HttpMethod.POST,
								"/api/v1/auth/register"
						).permitAll()

						.requestMatchers(
								HttpMethod.POST,
								"/api/v1/auth/login"
						).permitAll()

						// Public health endpoint
						.requestMatchers(
								HttpMethod.GET,
								"/api/v1/health"
						).permitAll()

						// Public membership plans
						.requestMatchers(
								HttpMethod.GET,
								"/api/v1/membership-plans",
								"/api/v1/membership-plans/**"
						).permitAll()

						// Everything else requires authentication
						.anyRequest().authenticated()
				)

				.exceptionHandling(exceptions -> exceptions
						.authenticationEntryPoint(authenticationEntryPoint)
						.accessDeniedHandler(accessDeniedHandler)
				)

				.httpBasic(httpBasic -> httpBasic.disable())

				.formLogin(formLogin -> formLogin.disable())

				// JWT filter runs before Spring's username/password filter
				.addFilterBefore(
						jwtAuthenticationFilter,
						UsernamePasswordAuthenticationFilter.class
				);

		return http.build();
	}
}