package com.stayfit.backend.repository;

import com.stayfit.backend.entity.MembershipPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MembershipPlanRepository extends JpaRepository<MembershipPlan, Long> {

	List<MembershipPlan> findByActiveTrue();

	Optional<MembershipPlan> findByName(String name);

}
