import { describe, expect, it } from "vitest";
import { env } from "./env";

describe("env defaults", () => {
	it("exposes local development defaults for Daphne and the dashboard", () => {
		expect(env.appUrl).toBe("http://localhost:3001");
		expect(env.daphneUrl).toBe("http://localhost:3000");
		expect(env.providers.clerkConfigured).toBe(false);
		expect(env.flags.isConfigured).toBe(false);
	});
});
