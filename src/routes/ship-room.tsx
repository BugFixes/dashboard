import { createFileRoute } from "@tanstack/react-router";
import DashboardAreaPlaceholder from "#/components/dashboard-area-placeholder";

export const Route = createFileRoute("/ship-room")({
	component: ShipRoomRoute,
});

function ShipRoomRoute() {
	return (
		<DashboardAreaPlaceholder
			badge="Ship room"
			title="Verification and release coordination belong in one place."
			description="This section is where fixes graduate from investigation into validation, release readiness, and cross-shift handoff without losing the surrounding dashboard structure."
			primaryAction={{ label: "Back to overview", to: "/" }}
			secondaryAction={{ label: "Open investigations", to: "/investigations" }}
			details={[
				{
					label: "Readiness",
					title: "What can ship next",
					note: "Operators need a clean list of fixes that are merged, staged, and waiting on verification or release timing.",
				},
				{
					label: "Quality",
					title: "Verification is explicit",
					note: "Evidence, ownership, and pass/fail notes should stay attached so handoffs do not lose context.",
				},
				{
					label: "Handoff",
					title: "Shift transitions stay smooth",
					note: "Release candidates and unresolved risk need a durable place to live between operator shifts.",
				},
			]}
			checklist={[
				"Introduce a verification queue with status chips and owner visibility.",
				"Add release grouping that works as a desktop board and still reads cleanly on mobile.",
				"Preserve the same empty-state framing when there are no pending fixes to ship.",
			]}
		/>
	);
}
