package com.stayfit.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

	private final JwtProperties jwtProperties;
	private final SecretKey signingKey;

	public JwtService(JwtProperties jwtProperties) {
		this.jwtProperties = jwtProperties;
		this.signingKey = Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8));
	}

	public String generateToken(UserPrincipal principal) {
		Date now = new Date();
		Date expiry = new Date(now.getTime() + jwtProperties.getExpiration());

		return Jwts.builder()
				.subject(principal.getUsername())
				.claim("uid", principal.getId())
				.claim("role", "ROLE_USER")
				.issuedAt(now)
				.expiration(expiry)
				.signWith(signingKey)
				.compact();
	}

	/** Throws {@link JwtException} for malformed/invalid tokens and ExpiredJwtException for expired ones. */
	public Claims parseClaims(String token) {
		return Jwts.parser()
				.verifyWith(signingKey)
				.build()
				.parseSignedClaims(token)
				.getPayload();
	}

	public String extractEmail(String token) {
		return parseClaims(token).getSubject();
	}

	public boolean isTokenValid(String token, UserDetails userDetails) {
		Claims claims = parseClaims(token);
		return claims.getSubject().equals(userDetails.getUsername()) && claims.getExpiration().after(new Date());
	}

}
