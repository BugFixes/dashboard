import { describe, expect, it } from "vitest";
import { resolveEnv } from "./env";

describe("env defaults", () => {
	it("exposes local development defaults for Daphne and the dashboard", () => {
		const env = resolveEnv({});

		expect(env.appUrl).toBe("http://localhost:3001");
		expect(env.daphneUrl).toBe("http://localhost:3000");
		expect(env.providers.clerkConfigured).toBe(false);
		expect(env.flags.isConfigured).toBe(false);
		expect(env.access.internalOrgMatchers).toEqual(["chewedfeed"]);
	});

	it("derives provider configuration flags from populated values", () => {
		const env = resolveEnv({
			VITE_CLERK_PUBLISHABLE_KEY: "pk_test_123",
			VITE_FLAGS_PROJECT_ID: "project",
			VITE_FLAGS_ENVIRONMENT_ID: "environment",
			VITE_FLAGS_AGENT_ID: "agent",
		});

		expect(env.providers.clerkConfigured).toBe(true);
		expect(env.flags.isConfigured).toBe(true);
	});

	it("includes configured internal org matchers for Bugfixes staff controls", () => {
		const env = resolveEnv({
			VITE_DEITY_ORG: "deity-org",
			VITE_INTERNAL_ORGS: "chewedfeed-staging, chewedfeed-prod",
		});

		expect(env.access.internalOrgMatchers).toEqual([
			"chewedfeed",
			"deity-org",
			"chewedfeed-staging",
			"chewedfeed-prod",
		]);
	});
});
