package com.stayfit.backend.repository;

import com.stayfit.backend.entity.MembershipStatus;
import com.stayfit.backend.entity.UserMembership;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserMembershipRepository extends JpaRepository<UserMembership, Long> {

	List<UserMembership> findByUserIdOrderByCreatedAtDesc(Long userId);

	Optional<UserMembership> findByUserIdAndStatus(Long userId, MembershipStatus status);

	Optional<UserMembership> findByIdAndUserId(Long id, Long userId);

}
