import { describe, expect, it } from "vitest";
import { buildOrganizationSetupState } from "#/lib/organization-setup";

describe("organization setup", () => {
	it("blocks downstream steps until an organization exists", () => {
		const state = buildOrganizationSetupState({
			mode: "live",
			hasOrganization: false,
			memberCount: 0,
			apiKeyCount: 0,
		});

		expect(state.completedFoundationSteps).toBe(0);
		expect(state.foundationSteps.map((step) => step.status)).toEqual([
			"blocked",
			"blocked",
			"blocked",
		]);
		expect(state.providerSteps.every((step) => step.status === "blocked")).toBe(
			true,
		);
	});

	it("marks membership and credentials complete when the organization is configured", () => {
		const state = buildOrganizationSetupState({
			mode: "live",
			hasOrganization: true,
			organizationName: "Acme",
			memberCount: 3,
			apiKeyCount: 2,
		});

		expect(state.completedFoundationSteps).toBe(3);
		expect(state.progressPercent).toBe(100);
		expect(state.summary).toContain("Acme");
		expect(state.providerSteps.every((step) => step.status === "stubbed")).toBe(
			true,
		);
	});

	it("uses preview states in snapshot mode", () => {
		const state = buildOrganizationSetupState({
			mode: "snapshot",
			hasOrganization: false,
			memberCount: 4,
			apiKeyCount: 2,
		});

		expect(state.summary).toContain("Snapshot mode");
		expect(
			state.foundationSteps.every((step) => step.status === "preview"),
		).toBe(true);
		expect(state.providerSteps.every((step) => step.status === "preview")).toBe(
			true,
		);
	});
});
