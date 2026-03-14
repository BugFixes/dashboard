const appUrl = import.meta.env.VITE_APP_URL?.trim() || "http://localhost:3001";
const daphneUrl =
	import.meta.env.VITE_DAPHNE_URL?.trim() || "http://localhost:3000";
const clerkPublishableKey =
	import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim() || "";
const flagsProjectId = import.meta.env.VITE_FLAGS_PROJECT_ID?.trim() || "";
const flagsEnvironmentId =
	import.meta.env.VITE_FLAGS_ENVIRONMENT_ID?.trim() || "";
const flagsAgentId = import.meta.env.VITE_FLAGS_AGENT_ID?.trim() || "";

export const env = {
	appName: "Daphne Dashboard",
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
	providers: {
		clerkConfigured: clerkPublishableKey.length > 0,
	},
} as const;
