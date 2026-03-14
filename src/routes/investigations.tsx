import { createFileRoute } from "@tanstack/react-router";
import DashboardAreaPlaceholder from "#/components/dashboard-area-placeholder";

export const Route = createFileRoute("/investigations")({
	component: InvestigationsRoute,
});

function InvestigationsRoute() {
	return (
		<DashboardAreaPlaceholder
			badge="Investigations"
			title="Active debugging work needs its own lane."
			description="Use this screen for reproduction notes, blocker tracking, owner visibility, and the evidence operators need before something can move into the ship room."
			primaryAction={{ label: "Back to overview", to: "/" }}
			secondaryAction={{ label: "Open intake", to: "/intake" }}
			details={[
				{
					label: "Focus",
					title: "Repros, traces, and blast radius",
					note: "The investigation area should support deeper context than the top-level overview can carry.",
				},
				{
					label: "Blockers",
					title: "External waits stay visible",
					note: "Vendor dependencies, missing customer steps, and environment gaps should remain obvious until they clear.",
				},
				{
					label: "Owners",
					title: "Single-threaded accountability",
					note: "Each investigation should expose who is driving it and what the next verification-worthy step is.",
				},
			]}
			checklist={[
				"Add the investigation list and preserve enough horizontal space for notes on larger viewports.",
				"Keep the mobile view task-focused by collapsing secondary metadata behind clear sections.",
				"Wire route-level filters so blocked work and escalations can be isolated without changing the shell.",
			]}
		/>
	);
}
