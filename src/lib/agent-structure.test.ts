import { describe, expect, it } from "vitest";
import {
	buildAgentEnvironmentOptions,
	countAgentStructure,
	createEnvironmentRecord,
	resolveAgentStructure,
	slugifyEnvironmentName,
	snapshotAgentStructure,
} from "#/lib/agent-structure";
import type { ApiKeyRecord } from "#/lib/api-keys";

const liveKey: ApiKeyRecord = {
	id: "key-live-1",
	organization_id: "org_123",
	account_id: "acc_live_123",
	key_type: "system",
	scope: "ingest",
	name: "Warehouse ingest",
	api_key: "bk_sys_live",
	clerk_user_id: null,
	environment: "warehouse-prod",
	expires_at: "2027-03-01T12:00:00.000Z",
	revoked_at: null,
	last_used_at: "2026-03-17T08:15:00.000Z",
	created_at: "2026-03-01T09:00:00.000Z",
	updated_at: "2026-03-17T08:15:00.000Z",
};

describe("agent structure", () => {
	it("keeps the seeded snapshot structure in snapshot mode", () => {
		const structure = resolveAgentStructure({
			keys: [],
			source: "snapshot",
		});

		expect(countAgentStructure(structure)).toEqual({
			projects: snapshotAgentStructure.projects.length,
			subprojects: snapshotAgentStructure.subprojects.length,
			environments: snapshotAgentStructure.environments.length,
		});
	});

	it("imports legacy key targets into a synthetic structure in live mode", () => {
		const structure = resolveAgentStructure({
			keys: [liveKey],
			source: "live",
		});

		expect(countAgentStructure(structure)).toEqual({
			projects: 1,
			subprojects: 1,
			environments: 1,
		});

		expect(buildAgentEnvironmentOptions(structure)).toEqual([
			expect.objectContaining({
				accountId: "acc_live_123",
				environmentSlug: "warehouse-prod",
				label: "Imported environments / Recovered targets / Warehouse Prod",
			}),
		]);
	});

	it("merges persisted structures with imported targets", () => {
		const customEnvironment = createEnvironmentRecord({
			projectId: "project_custom",
			subprojectId: "subproject_custom",
			name: "QA preview",
		});
		const structure = resolveAgentStructure({
			keys: [liveKey],
			source: "live",
			persisted: {
				projects: [
					{
						id: "project_custom",
						name: "SDK",
						description: "SDK lanes",
					},
				],
				subprojects: [
					{
						id: "subproject_custom",
						projectId: "project_custom",
						name: "Android",
						description: "Android app",
					},
				],
				environments: [customEnvironment],
			},
		});

		expect(countAgentStructure(structure)).toEqual({
			projects: 2,
			subprojects: 2,
			environments: 2,
		});
		expect(buildAgentEnvironmentOptions(structure)).toHaveLength(1);
	});

	it("slugifies environment names for API key payloads", () => {
		expect(slugifyEnvironmentName("QA Preview / EU")).toBe("qa-preview-eu");
	});
});
