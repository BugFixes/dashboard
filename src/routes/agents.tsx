import { createFileRoute } from "@tanstack/react-router";
import DashboardAreaPlaceholder from "#/components/dashboard-area-placeholder";

export const Route = createFileRoute("/agents")({
	component: AgentsRoute,
});

function AgentsRoute() {
	return (
		<DashboardAreaPlaceholder
			badge="Agents"
			title="Agent management has a stable lane now."
			description="Use this screen for agent creation, credential rotation, runtime status, and environment mapping so operators can manage ingestion surfaces without raw API calls."
			primaryAction={{ label: "Back to overview", to: "/" }}
			secondaryAction={{ label: "Open accounts", to: "/accounts" }}
			details={[
				{
					label: "Lifecycle",
					title: "Create and rotate agents safely",
					note: "The shell already reserves room for provisioning, credential replacement, and audit-friendly ownership details.",
				},
				{
					label: "Status",
					title: "Last seen and delivery state belong here",
					note: "Operators need immediate visibility into which agents are healthy, stale, or misconfigured before checking logs elsewhere.",
				},
				{
					label: "Reach",
					title: "Environment coverage stays attached",
					note: "Each agent should show which account and runtime it belongs to so stacktrace intake is never disconnected from ownership.",
				},
			]}
			checklist={[
				"Add the agent table and creation flow with room for copyable credentials and rotation actions.",
				"Expose account association, last-seen timestamps, and health states in a compact responsive layout.",
				"Keep destructive actions explicit so a future revoke/delete flow does not need another shell pass.",
			]}
		/>
	);
}
