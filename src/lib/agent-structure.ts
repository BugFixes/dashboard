import type { ApiKeyRecord, ApiKeySource } from "#/lib/api-keys";

export const AGENT_STRUCTURE_STORAGE_KEY = "bugfixes.agent-structure";

export type AgentProject = {
	id: string;
	name: string;
	description: string;
};

export type AgentSubproject = {
	id: string;
	projectId: string;
	name: string;
	description: string;
};

export type AgentEnvironment = {
	id: string;
	projectId: string;
	subprojectId: string;
	name: string;
	slug: string;
	accountId: string | null;
};

export type AgentStructure = {
	projects: AgentProject[];
	subprojects: AgentSubproject[];
	environments: AgentEnvironment[];
};

export type AgentEnvironmentOption = {
	value: string;
	label: string;
	projectId: string;
	projectName: string;
	subprojectId: string;
	subprojectName: string;
	accountId: string;
	environmentId: string;
	environmentName: string;
	environmentSlug: string;
};

const snapshotProjectId = "project-mobile-apps";
const snapshotSubprojectIosId = "subproject-ios-client";
const snapshotSubprojectOpsId = "subproject-ops-console";

export const emptyAgentStructure: AgentStructure = {
	projects: [],
	subprojects: [],
	environments: [],
};

export const snapshotAgentStructure: AgentStructure = {
	projects: [
		{
			id: snapshotProjectId,
			name: "Mobile apps",
			description: "Customer-facing mobile experiences and release tracks.",
		},
	],
	subprojects: [
		{
			id: snapshotSubprojectIosId,
			projectId: snapshotProjectId,
			name: "iOS client",
			description:
				"Local builds, TestFlight validation, and production rollout.",
		},
		{
			id: snapshotSubprojectOpsId,
			projectId: snapshotProjectId,
			name: "Operations console",
			description:
				"Internal tooling and reporting surfaces for shared services.",
		},
	],
	environments: [
		{
			id: "env-local-ios",
			projectId: snapshotProjectId,
			subprojectId: snapshotSubprojectIosId,
			name: "Local iOS",
			slug: "local-ios",
			accountId: "1c443ab2-ae0f-43d8-be0f-44a4cbdb72a8",
		},
		{
			id: "env-production",
			projectId: snapshotProjectId,
			subprojectId: snapshotSubprojectIosId,
			name: "Production",
			slug: "production",
			accountId: "1c443ab2-ae0f-43d8-be0f-44a4cbdb72a8",
		},
		{
			id: "env-staging",
			projectId: snapshotProjectId,
			subprojectId: snapshotSubprojectOpsId,
			name: "Staging",
			slug: "staging",
			accountId: "9ae53697-2fef-4198-86c3-f5f6ded64e74",
		},
	],
};

export function resolveAgentStructure({
	keys,
	source,
	persisted,
}: {
	keys: ApiKeyRecord[];
	source: ApiKeySource;
	persisted?: AgentStructure | null;
}): AgentStructure {
	const base =
		source === "snapshot" ? snapshotAgentStructure : emptyAgentStructure;

	return mergeAgentStructures(
		mergeAgentStructures(base, persisted ?? emptyAgentStructure),
		buildImportedStructure(keys),
	);
}

export function buildAgentEnvironmentOptions(
	structure: AgentStructure,
): AgentEnvironmentOption[] {
	return structure.environments
		.map((environment) => {
			const project = structure.projects.find(
				(candidate) => candidate.id === environment.projectId,
			);
			const subproject = structure.subprojects.find(
				(candidate) => candidate.id === environment.subprojectId,
			);

			if (!project || !subproject) {
				return null;
			}

			if (!environment.accountId) {
				return null;
			}

			return {
				value: environment.id,
				label: `${project.name} / ${subproject.name} / ${environment.name}`,
				projectId: project.id,
				projectName: project.name,
				subprojectId: subproject.id,
				subprojectName: subproject.name,
				accountId: environment.accountId,
				environmentId: environment.id,
				environmentName: environment.name,
				environmentSlug: environment.slug,
			};
		})
		.filter((option): option is AgentEnvironmentOption => option !== null)
		.sort((left, right) => left.label.localeCompare(right.label));
}

export function countAgentStructure(structure: AgentStructure) {
	return {
		projects: structure.projects.length,
		subprojects: structure.subprojects.length,
		environments: structure.environments.length,
	};
}

export function createProjectRecord(input: {
	name: string;
	description?: string;
}): AgentProject {
	return {
		id: createId("project"),
		name: input.name.trim(),
		description: input.description?.trim() || "No description added yet.",
	};
}

export function createSubprojectRecord(input: {
	projectId: string;
	name: string;
	description?: string;
}): AgentSubproject {
	return {
		id: createId("subproject"),
		projectId: input.projectId,
		name: input.name.trim(),
		description: input.description?.trim() || "No description added yet.",
	};
}

export function createEnvironmentRecord(input: {
	projectId: string;
	subprojectId: string;
	name: string;
}): AgentEnvironment {
	return {
		id: createId("environment"),
		projectId: input.projectId,
		subprojectId: input.subprojectId,
		name: input.name.trim(),
		slug: slugifyEnvironmentName(input.name),
		accountId: null,
	};
}

export function slugifyEnvironmentName(value: string): string {
	return value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function buildImportedStructure(keys: ApiKeyRecord[]): AgentStructure {
	const importedEnvironments = keys.filter(
		(key) => key.account_id && key.environment,
	);

	if (importedEnvironments.length === 0) {
		return emptyAgentStructure;
	}

	const projectId = "project-imported";
	const subprojectId = "subproject-imported";

	return {
		projects: [
			{
				id: projectId,
				name: "Imported environments",
				description:
					"Recovered from existing key inventory until dedicated structure APIs are wired.",
			},
		],
		subprojects: [
			{
				id: subprojectId,
				projectId,
				name: "Recovered targets",
				description:
					"Existing account and environment pairs discovered from active keys.",
			},
		],
		environments: dedupeByKey(
			importedEnvironments.map((key) => ({
				id: `imported-${key.account_id}-${key.environment}`,
				projectId,
				subprojectId,
				name: prettifyLabel(key.environment ?? ""),
				slug: key.environment ?? "",
				accountId: key.account_id ?? "",
			})),
			(environment) => `${environment.accountId}::${environment.slug}`,
		),
	};
}

function mergeAgentStructures(
	left: AgentStructure,
	right: AgentStructure,
): AgentStructure {
	return {
		projects: dedupeByKey(
			[...left.projects, ...right.projects],
			(item) => item.id,
		),
		subprojects: dedupeByKey(
			[...left.subprojects, ...right.subprojects],
			(item) => item.id,
		),
		environments: dedupeByKey(
			[...left.environments, ...right.environments],
			(item) => item.id,
		),
	};
}

function dedupeByKey<T>(items: T[], getKey: (item: T) => string): T[] {
	const seen = new Set<string>();
	return items.filter((item) => {
		const key = getKey(item);
		if (seen.has(key)) {
			return false;
		}
		seen.add(key);
		return true;
	});
}

function prettifyLabel(value: string): string {
	return value
		.split(/[-_]/g)
		.filter(Boolean)
		.map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
		.join(" ");
}

function createId(prefix: string): string {
	if (
		typeof crypto !== "undefined" &&
		typeof crypto.randomUUID === "function"
	) {
		return `${prefix}-${crypto.randomUUID()}`;
	}

	return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
