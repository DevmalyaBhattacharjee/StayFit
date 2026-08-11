package com.stayfit.backend.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
		Map<String, String> fieldErrors = new LinkedHashMap<>();
		for (FieldError error : ex.getBindingResult().getFieldErrors()) {
			fieldErrors.put(error.getField(), error.getDefaultMessage());
		}
		ApiError body = ApiError.of(HttpStatus.BAD_REQUEST.value(), "Validation Failed",
				"One or more fields are invalid", request.getRequestURI(), fieldErrors);
		return ResponseEntity.badRequest().body(body);
	}

	@ExceptionHandler(HttpMessageNotReadableException.class)
	public ResponseEntity<ApiError> handleMalformedBody(HttpServletRequest request) {
		ApiError body = ApiError.of(HttpStatus.BAD_REQUEST.value(), "Bad Request",
				"Request body is missing or malformed", request.getRequestURI());
		return ResponseEntity.badRequest().body(body);
	}

	@ExceptionHandler(MethodArgumentTypeMismatchException.class)
	public ResponseEntity<ApiError> handleTypeMismatch(HttpServletRequest request) {
		ApiError body = ApiError.of(HttpStatus.BAD_REQUEST.value(), "Bad Request",
				"One or more request parameters are invalid", request.getRequestURI());
		return ResponseEntity.badRequest().body(body);
	}

	@ExceptionHandler(DataIntegrityViolationException.class)
	public ResponseEntity<ApiError> handleDataIntegrityViolation(HttpServletRequest request) {
		ApiError body = ApiError.of(HttpStatus.CONFLICT.value(), "Conflict",
				"The request could not be completed due to a data conflict", request.getRequestURI());
		return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
	}

	@ExceptionHandler(DuplicateEmailException.class)
	public ResponseEntity<ApiError> handleDuplicateEmail(DuplicateEmailException ex, HttpServletRequest request) {
		ApiError body = ApiError.of(HttpStatus.CONFLICT.value(), "Conflict", ex.getMessage(), request.getRequestURI());
		return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
	}

	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
		ApiError body = ApiError.of(HttpStatus.NOT_FOUND.value(), "Not Found", ex.getMessage(), request.getRequestURI());
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
	}

	@ExceptionHandler(InactivePlanException.class)
	public ResponseEntity<ApiError> handleInactivePlan(InactivePlanException ex, HttpServletRequest request) {
		ApiError body = ApiError.of(HttpStatus.BAD_REQUEST.value(), "Bad Request", ex.getMessage(), request.getRequestURI());
		return ResponseEntity.badRequest().body(body);
	}

	@ExceptionHandler(ActiveMembershipExistsException.class)
	public ResponseEntity<ApiError> handleActiveMembershipExists(ActiveMembershipExistsException ex, HttpServletRequest request) {
		ApiError body = ApiError.of(HttpStatus.CONFLICT.value(), "Conflict", ex.getMessage(), request.getRequestURI());
		return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
	}

	@ExceptionHandler(AuthenticationException.class)
	public ResponseEntity<ApiError> handleAuthentication(HttpServletRequest request) {
		ApiError body = ApiError.of(HttpStatus.UNAUTHORIZED.value(), "Unauthorized",
				"Invalid email or password", request.getRequestURI());
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
	}

	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<ApiError> handleAccessDenied(HttpServletRequest request) {
		ApiError body = ApiError.of(HttpStatus.FORBIDDEN.value(), "Forbidden",
				"You do not have permission to access this resource", request.getRequestURI());
		return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiError> handleGeneric(HttpServletRequest request) {
		ApiError body = ApiError.of(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Internal Server Error",
				"An unexpected error occurred", request.getRequestURI());
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
	}

}
