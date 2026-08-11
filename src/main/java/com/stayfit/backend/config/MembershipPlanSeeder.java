package com.stayfit.backend.config;

import com.stayfit.backend.entity.MembershipPlan;
import com.stayfit.backend.repository.MembershipPlanRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/**
 * Development-only seed data. Inserts each plan only if a plan with the same
 * name doesn't already exist, so restarting the application never creates
 * duplicates or overwrites existing plan data.
 */
@Component
@Profile("dev")
public class MembershipPlanSeeder implements ApplicationRunner {

	private record SeedPlan(String name, String description, int durationDays, BigDecimal price) {
	}

	private static final List<SeedPlan> SEED_PLANS = List.of(
			new SeedPlan("Basic", "Entry-level monthly membership", 30, new BigDecimal("499")),
			new SeedPlan("Standard", "Quarterly membership with better value", 90, new BigDecimal("1199")),
			new SeedPlan("Premium", "Half-yearly membership at the best value", 180, new BigDecimal("1999"))
	);

	private final MembershipPlanRepository membershipPlanRepository;

	public MembershipPlanSeeder(MembershipPlanRepository membershipPlanRepository) {
		this.membershipPlanRepository = membershipPlanRepository;
	}

	@Override
	public void run(ApplicationArguments args) {
		for (SeedPlan seed : SEED_PLANS) {
			if (membershipPlanRepository.findByName(seed.name()).isEmpty()) {
				membershipPlanRepository.save(MembershipPlan.builder()
						.name(seed.name())
						.description(seed.description())
						.durationDays(seed.durationDays())
						.price(seed.price())
						.active(true)
						.build());
			}
		}
	}

}
