package com.stayfit.backend.security;

import com.stayfit.backend.entity.User;
import com.stayfit.backend.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

	private final UserRepository userRepository;

	public CustomUserDetailsService(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	@Override
	public UserPrincipal loadUserByUsername(String email) {
		User user = userRepository.findByEmail(normalize(email))
				.orElseThrow(() -> new UsernameNotFoundException("No user with the given email"));
		return new UserPrincipal(user);
	}

	private String normalize(String email) {
		return email == null ? null : email.trim().toLowerCase();
	}

}
