import type { DashboardRoutePath } from "#/lib/dashboard-navigation";

export type OrganizationSetupMode = "live" | "snapshot";

export type OrganizationSetupStatus =
	| "complete"
	| "ready"
	| "blocked"
	| "stubbed"
	| "preview";

export type OrganizationSetupStep = {
	id:
		| "organization"
		| "members"
		| "agents"
		| "ai"
		| "ticketing"
		| "notifications";
	label: string;
	title: string;
	description: string;
	detail: string;
	status: OrganizationSetupStatus;
	href: DashboardRoutePath;
	actionLabel: string;
};

export type OrganizationSetupGap = {
	title: string;
	note: string;
};

export type OrganizationSetupState = {
	mode: OrganizationSetupMode;
	organizationLabel: string;
	summary: string;
	completedFoundationSteps: number;
	totalFoundationSteps: number;
	progressPercent: number;
	foundationSteps: OrganizationSetupStep[];
	providerSteps: OrganizationSetupStep[];
	gaps: OrganizationSetupGap[];
};

type BuildOrganizationSetupStateInput = {
	mode: OrganizationSetupMode;
	hasOrganization: boolean;
	organizationName?: string | null;
	memberCount?: number | null;
	apiKeyCount?: number | null;
};

export function buildOrganizationSetupState({
	mode,
	hasOrganization,
	organizationName,
	memberCount,
	apiKeyCount,
}: BuildOrganizationSetupStateInput): OrganizationSetupState {
	const safeMemberCount = Math.max(memberCount ?? 0, 0);
	const safeApiKeyCount = Math.max(apiKeyCount ?? 0, 0);
	const organizationLabel =
		organizationName?.trim() ||
		(hasOrganization ? "Current organization" : "No organization selected");

	const foundationSteps: OrganizationSetupStep[] = [
		{
			id: "organization",
			label: "Foundation",
			title: "Create or select an organization",
			description:
				"Every operator workflow is now organization-scoped instead of account-scoped.",
			detail:
				mode === "snapshot"
					? "Snapshot mode previews organization onboarding. Connect Clerk to create and switch live organizations."
					: hasOrganization
						? `${organizationLabel} is the active dashboard context.`
						: "Choose an organization to unlock memberships, agent credentials, and provider configuration.",
			status:
				mode === "snapshot"
					? "preview"
					: hasOrganization
						? "complete"
						: "blocked",
			href: "/settings",
			actionLabel: hasOrganization ? "Review setup" : "Select organization",
		},
		{
			id: "members",
			label: "Membership",
			title: "Add teammates and assign roles",
			description:
				"Manage members through the supported Clerk-backed membership workflow.",
			detail:
				mode === "snapshot"
					? `${safeMemberCount} seeded members appear in snapshot mode. Live invites and role changes require Clerk.`
					: !hasOrganization
						? "Membership controls stay blocked until an organization is selected."
						: safeMemberCount > 1
							? `${safeMemberCount} members currently have access to this organization.`
							: "Invite the first teammate or confirm role assignments from the Members section.",
			status:
				mode === "snapshot"
					? "preview"
					: !hasOrganization
						? "blocked"
						: safeMemberCount > 1
							? "complete"
							: "ready",
			href: "/members",
			actionLabel: safeMemberCount > 1 ? "Manage members" : "Open members",
		},
		{
			id: "agents",
			label: "Credentials",
			title: "Create an agent or API key",
			description:
				"Use the existing agent credentials flow to issue keys for services that send events.",
			detail:
				mode === "snapshot"
					? `${safeApiKeyCount} seeded keys are visible in snapshot mode. Live key creation requires a connected organization.`
					: !hasOrganization
						? "Agent credentials stay blocked until an organization is selected."
						: safeApiKeyCount > 0
							? `${safeApiKeyCount} API key${safeApiKeyCount === 1 ? "" : "s"} already exist for this organization.`
							: "Create at least one key so a service can publish bugs and operational events.",
			status:
				mode === "snapshot"
					? "preview"
					: !hasOrganization
						? "blocked"
						: safeApiKeyCount > 0
							? "complete"
							: "ready",
			href: "/agents",
			actionLabel: safeApiKeyCount > 0 ? "Manage agents" : "Create key",
		},
	];

	const providerStepStatus: OrganizationSetupStatus =
		mode === "snapshot" ? "preview" : hasOrganization ? "stubbed" : "blocked";

	const providerSteps: OrganizationSetupStep[] = [
		{
			id: "ai",
			label: "Provider setup",
			title: "AI configuration",
			description:
				"Reach AI setup from the dashboard, but the saved provider flow is still backend-dependent.",
			detail:
				mode === "snapshot"
					? "Snapshot mode shows where AI configuration will live once the provider APIs are wired."
					: hasOrganization
						? "UI direction is in place, but saved credentials, model selection, and validation still need Daphne APIs."
						: "Select an organization first, then complete the remaining AI provider work once the API exists.",
			status: providerStepStatus,
			href: "/settings",
			actionLabel: "Open settings",
		},
		{
			id: "ticketing",
			label: "Provider setup",
			title: "Ticketing configuration",
			description:
				"Ticket provider auth and project mapping are reachable from settings, with backend work still pending.",
			detail:
				mode === "snapshot"
					? "Snapshot mode marks ticketing as planned configuration work."
					: hasOrganization
						? "Connection health, auth handshakes, and project defaults still need backend support."
						: "Select an organization first, then finish ticketing setup after the missing APIs land.",
			status: providerStepStatus,
			href: "/settings",
			actionLabel: "Open settings",
		},
		{
			id: "notifications",
			label: "Provider setup",
			title: "Notification configuration",
			description:
				"Notification routing is exposed as part of organization setup, but the provider forms remain stubbed.",
			detail:
				mode === "snapshot"
					? "Snapshot mode shows the intended notification configuration path without live persistence."
					: hasOrganization
						? "Destination secrets, routing rules, and delivery status controls still need backend implementation."
						: "Select an organization first, then finish notification setup after the backend contracts are ready.",
			status: providerStepStatus,
			href: "/settings",
			actionLabel: "Open settings",
		},
	];

	const completedFoundationSteps = foundationSteps.filter(
		(step) => step.status === "complete",
	).length;
	const totalFoundationSteps = foundationSteps.length;
	const progressPercent = Math.round(
		(completedFoundationSteps / totalFoundationSteps) * 100,
	);

	return {
		mode,
		organizationLabel,
		summary:
			mode === "snapshot"
				? "Snapshot mode previews the organization onboarding path. Connect Clerk to create live organizations, invite members, and issue real API keys."
				: hasOrganization
					? `${completedFoundationSteps} of ${totalFoundationSteps} foundation steps are complete for ${organizationLabel}. Provider configuration remains reachable but partially stubbed.`
					: "Create or select an organization to start onboarding. Members, API keys, and provider setup stay intentionally blocked until that context exists.",
		completedFoundationSteps,
		totalFoundationSteps,
		progressPercent,
		foundationSteps,
		providerSteps,
		gaps: [
			{
				title: "AI provider persistence",
				note: "Credential storage, model selection, secret masking, and validation errors still need Daphne endpoints.",
			},
			{
				title: "Ticketing connection health",
				note: "Provider auth, project mapping, sync defaults, and failure states need backend contracts.",
			},
			{
				title: "Notification routing and delivery controls",
				note: "Destinations, secret handling, retry visibility, and saved notification preferences still need API support.",
			},
		],
	};
}
