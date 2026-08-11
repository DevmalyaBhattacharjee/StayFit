package com.stayfit.backend.exception;

public class ActiveMembershipExistsException extends RuntimeException {

	public ActiveMembershipExistsException(String message) {
		super(message);
	}

}
