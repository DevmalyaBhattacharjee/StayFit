package com.stayfit.backend.service;

import com.stayfit.backend.dto.AuthResponse;
import com.stayfit.backend.dto.LoginRequest;
import com.stayfit.backend.dto.RegisterRequest;
import com.stayfit.backend.dto.UserResponse;
import com.stayfit.backend.entity.User;
import com.stayfit.backend.exception.DuplicateEmailException;
import com.stayfit.backend.repository.UserRepository;
import com.stayfit.backend.security.JwtService;
import com.stayfit.backend.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final AuthenticationManager authenticationManager;
	private final JwtService jwtService;

	public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
			AuthenticationManager authenticationManager, JwtService jwtService) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.authenticationManager = authenticationManager;
		this.jwtService = jwtService;
	}

	@Transactional
	public UserResponse register(RegisterRequest request) {
		String email = normalize(request.email());
		if (userRepository.existsByEmail(email)) {
			throw new DuplicateEmailException("An account with this email already exists");
		}

		User user = User.builder()
				.name(request.name())
				.email(email)
				.password(passwordEncoder.encode(request.password()))
				.dateOfBirth(request.dateOfBirth())
				.gender(request.gender())
				.height(request.height())
				.weight(request.weight())
				.enabled(true)
				.build();

		User saved = userRepository.save(user);
		return UserResponse.from(saved);
	}

	public AuthResponse login(LoginRequest request) {
		String email = normalize(request.email());

		Authentication authentication = authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(email, request.password()));

		UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
		String token = jwtService.generateToken(principal);
		return AuthResponse.of(token, UserResponse.from(principal.getUser()));
	}

	private String normalize(String email) {
		return email.trim().toLowerCase();
	}

}
