import { describe, expect, it } from "vitest";
import {
	dashboardLayoutResponsibilities,
	dashboardNavItems,
	getActiveDashboardItem,
} from "#/lib/dashboard-navigation";

describe("dashboard navigation", () => {
	it("exposes the CHE-45 dashboard areas in the primary navigation", () => {
		expect(dashboardNavItems.map((item) => item.to)).toEqual([
			"/",
			"/accounts",
			"/members",
			"/agents",
			"/bugs",
			"/tickets",
			"/notifications",
			"/settings",
		]);
	});

	it("maps each top-level section to a stable route file", () => {
		expect(dashboardNavItems.map((item) => item.routeFile)).toEqual([
			"src/routes/_dashboard/index.tsx",
			"src/routes/_dashboard/accounts/index.tsx",
			"src/routes/_dashboard/members/index.tsx",
			"src/routes/_dashboard/agents/index.tsx",
			"src/routes/_dashboard/bugs/index.tsx",
			"src/routes/_dashboard/tickets/index.tsx",
			"src/routes/_dashboard/notifications/index.tsx",
			"src/routes/_dashboard/settings/index.tsx",
		]);
	});

	it("resolves nested admin routes to their top-level section", () => {
		expect(getActiveDashboardItem("/bugs/BF-184").to).toBe("/bugs");
		expect(getActiveDashboardItem("/accounts/acme").to).toBe("/accounts");
		expect(getActiveDashboardItem("/settings/auth").to).toBe("/settings");
	});

	it("defines layout ownership between the root document and dashboard shell", () => {
		expect(dashboardLayoutResponsibilities).toEqual([
			{
				owner: "__root",
				responsibilities: [
					"Own the document shell, metadata, global CSS, and providers.",
					"Do not contain dashboard navigation or section-specific chrome.",
				],
			},
			{
				owner: "_dashboard/route",
				responsibilities: [
					"Own the persistent app shell, primary navigation, and auth gate.",
					"Wrap every dashboard screen so section routes stay focused on page content.",
				],
			},
			{
				owner: "_dashboard/<section>/index",
				responsibilities: [
					"Own section content only and reserve the directory for nested detail routes.",
					"Keep future child routes colocated with their parent section.",
				],
			},
		]);
	});
});
