package com.stayfit.backend.exception;

import java.time.Instant;
import java.util.Map;

/** Consistent JSON shape for all API error responses. Never carries stack traces or internal details. */
public record ApiError(

		Instant timestamp,
		int status,
		String error,
		String message,
		String path,
		Map<String, String> fieldErrors

) {

	public static ApiError of(int status, String error, String message, String path) {
		return new ApiError(Instant.now(), status, error, message, path, null);
	}

	public static ApiError of(int status, String error, String message, String path, Map<String, String> fieldErrors) {
		return new ApiError(Instant.now(), status, error, message, path, fieldErrors);
	}

}
