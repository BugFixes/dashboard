type EnvSource = Partial<Record<string, string | undefined>>;

function readEnvValue(source: EnvSource, key: string): string {
	return source[key]?.trim() || "";
}

export function resolveEnv(source: EnvSource) {
	const appUrl =
		readEnvValue(source, "VITE_APP_URL") || "http://localhost:3001";
	const daphneUrl =
		readEnvValue(source, "VITE_DAPHNE_URL") || "http://localhost:3000";
	const clerkPublishableKey = readEnvValue(
		source,
		"VITE_CLERK_PUBLISHABLE_KEY",
	);
	const flagsProjectId = readEnvValue(source, "VITE_FLAGS_PROJECT_ID");
	const flagsEnvironmentId = readEnvValue(source, "VITE_FLAGS_ENVIRONMENT_ID");
	const flagsAgentId = readEnvValue(source, "VITE_FLAGS_AGENT_ID");
	const bugfixesKey = readEnvValue(source, "VITE_BUGFIXES_KEY");
	const bugfixesSecret = readEnvValue(source, "VITE_BUGFIXES_SECRET");

	return {
		appName: "Bugfixes Dashboard",
		appUrl,
		daphneUrl,
		clerkPublishableKey,
		flags: {
			projectId: flagsProjectId,
			environmentId: flagsEnvironmentId,
			agentId: flagsAgentId,
			isConfigured:
				flagsProjectId.length > 0 &&
				flagsEnvironmentId.length > 0 &&
				flagsAgentId.length > 0,
		},
		bugfixes: {
			agentKey: bugfixesKey,
			agentSecret: bugfixesSecret,
			isConfigured: bugfixesKey.length > 0 && bugfixesSecret.length > 0,
		},
		providers: {
			clerkConfigured: clerkPublishableKey.length > 0,
		},
	} as const;
}

export const env = resolveEnv(import.meta.env);
