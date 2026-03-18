import { describe, expect, it } from "vitest";
import { normalizeRole } from "./members";

describe("members logic", () => {
	describe("normalizeRole", () => {
		it("normalizes 'admin' and 'org:admin' to 'admin'", () => {
			expect(normalizeRole("admin")).toBe("admin");
			expect(normalizeRole("org:admin")).toBe("admin");
			expect(normalizeRole("ADMIN")).toBe("admin");
		});

		it("normalizes 'editor' related roles to 'editor'", () => {
			expect(normalizeRole("editor")).toBe("editor");
			expect(normalizeRole("org:editor")).toBe("editor");
			expect(normalizeRole("EDITOR")).toBe("editor");
		});

		it("defaults to 'viewer' for unknown roles", () => {
			expect(normalizeRole("viewer")).toBe("viewer");
			expect(normalizeRole("guest")).toBe("viewer");
			expect(normalizeRole("")).toBe("viewer");
		});
	});
});
