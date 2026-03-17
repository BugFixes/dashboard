import { createFileRoute } from "@tanstack/react-router";
import DashboardAreaPlaceholder from "#/components/dashboard-area-placeholder";

export const Route = createFileRoute("/_dashboard/tickets/")({
	component: TicketsRoute,
});

function TicketsRoute() {
	return (
		<DashboardAreaPlaceholder
			badge="Tickets"
			title="Tickets TODO"
			description="Build ticket provider mapping, sync status, failure handling, and outbound ticket actions here."
			primaryAction={{ label: "Back to overview", to: "/" }}
			secondaryAction={{ label: "Open bugs", to: "/bugs" }}
			details={[
				{
					label: "Sync",
					title: "Created tickets need visible state",
					note: "Show whether a bug already has a ticket, where it lives, and whether sync is healthy.",
				},
				{
					label: "Escalation",
					title: "Priority changes should stay attached",
					note: "The foundation keeps space for severity, owner handoff, and update history without forcing a future layout rewrite.",
				},
				{
					label: "Failures",
					title: "Broken ticket delivery is actionable",
					note: "If provider auth fails or ticket creation is rejected, surface it here instead of relying on logs.",
				},
			]}
			checklist={[
				"Add a ticket list grouped by sync health, provider, or priority without changing the outer shell.",
				"Reserve inline room for outbound links, retry actions, and provider-specific metadata.",
				"Keep the responsive layout readable when tickets have long summaries or multiple linked bugs.",
			]}
		/>
	);
}
