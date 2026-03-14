import { createFileRoute } from "@tanstack/react-router";
import DashboardAreaPlaceholder from "#/components/dashboard-area-placeholder";

export const Route = createFileRoute("/_dashboard/tickets/")({
	component: TicketsRoute,
});

function TicketsRoute() {
	return (
		<DashboardAreaPlaceholder
			badge="Tickets"
			title="Ticket creation and sync now have a dedicated home."
			description="This screen is reserved for linked issue status, provider mapping, sync failures, and the operator controls that connect bug records to the external ticket system."
			primaryAction={{ label: "Back to overview", to: "/" }}
			secondaryAction={{ label: "Open bugs", to: "/bugs" }}
			details={[
				{
					label: "Sync",
					title: "Created tickets need visible state",
					note: "Operators should be able to tell whether a bug already has a ticket, where it lives, and whether the sync is healthy.",
				},
				{
					label: "Escalation",
					title: "Priority changes should stay attached",
					note: "The foundation keeps space for severity, owner handoff, and update history without forcing a future layout rewrite.",
				},
				{
					label: "Failures",
					title: "Broken ticket delivery is actionable",
					note: "If provider auth fails or ticket creation is rejected, the operator should see that here instead of digging through logs.",
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
