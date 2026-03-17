import { createFileRoute } from "@tanstack/react-router";
import DashboardAreaPlaceholder from "#/components/dashboard-area-placeholder";

export const Route = createFileRoute("/_dashboard/notifications/")({
	component: NotificationsRoute,
});

function NotificationsRoute() {
	return (
		<DashboardAreaPlaceholder
			badge="Notifications"
			title="Notifications TODO"
			description="Build notification delivery, channel configuration, retry status, and event history here."
			primaryAction={{ label: "Back to overview", to: "/" }}
			secondaryAction={{ label: "Open tickets", to: "/tickets" }}
			details={[
				{
					label: "Channels",
					title: "Slack, email, and webhook posture",
					note: "Teams need a direct view of which channels are configured for each account and whether recent sends succeeded.",
				},
				{
					label: "Failures",
					title: "Retries stay visible until resolved",
					note: "Add enough failure detail here so notification debugging does not require raw logs.",
				},
				{
					label: "Audit",
					title: "Recent sends become searchable",
					note: "The shell already reserves space for a feed of outbound events so alert noise and missed sends can be debugged later.",
				},
			]}
			checklist={[
				"Add recent notification activity and retry status once Daphne exposes the underlying events.",
				"Keep channel health, destination metadata, and error reasons readable on both desktop and mobile widths.",
				"Leave room for account-scoped notification controls without introducing a separate settings-only workflow.",
			]}
		/>
	);
}
