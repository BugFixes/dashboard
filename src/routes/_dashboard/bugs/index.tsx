import { createFileRoute } from "@tanstack/react-router";
import DashboardAreaPlaceholder from "#/components/dashboard-area-placeholder";

export const Route = createFileRoute("/_dashboard/bugs/")({
	component: BugsRoute,
});

function BugsRoute() {
	return (
		<DashboardAreaPlaceholder
			badge="Bugs and stacktraces"
			title="Recent bug activity has a first-class investigation surface."
			description="This route is where stacktrace intake, deduplication clusters, severity cues, and investigation entrypoints should live once the live Daphne data modules land."
			primaryAction={{ label: "Back to overview", to: "/" }}
			secondaryAction={{ label: "Open tickets", to: "/tickets" }}
			details={[
				{
					label: "Intake",
					title: "Fresh stacktraces land with context",
					note: "Operators should be able to see account, agent, release, and dedupe posture before deciding whether something is a new incident.",
				},
				{
					label: "Clusters",
					title: "Duplicates collapse into one workflow lane",
					note: "The page should reserve room for grouping signals, blast radius, and recent event volume instead of a flat unstructured log.",
				},
				{
					label: "Routing",
					title: "Ticket creation starts here",
					note: "Bug records need clear paths into linked tickets, notification fanout, and the follow-up workflows that come next.",
				},
			]}
			checklist={[
				"Mount recent bug and stacktrace data from Daphne with strong empty/loading/error states.",
				"Preserve enough horizontal structure for stacktrace metadata on desktop without breaking the mobile flow.",
				"Design the page so ticket actions and investigation details can be added incrementally inside the existing shell.",
			]}
		/>
	);
}
