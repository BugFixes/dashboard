import { describe, expect, it } from "vitest";
import {
	dashboardNavItems,
	getActiveDashboardItem,
} from "#/lib/dashboard-navigation";

describe("dashboard navigation", () => {
	it("exposes the CHE-28 admin areas in the primary navigation", () => {
		expect(dashboardNavItems.map((item) => item.to)).toEqual([
			"/",
			"/accounts",
			"/agents",
			"/bugs",
			"/tickets",
			"/notifications",
			"/settings",
		]);
	});

	it("resolves nested admin routes to their top-level section", () => {
		expect(getActiveDashboardItem("/bugs/BF-184").to).toBe("/bugs");
		expect(getActiveDashboardItem("/accounts/acme").to).toBe("/accounts");
		expect(getActiveDashboardItem("/settings/auth").to).toBe("/settings");
	});
});
