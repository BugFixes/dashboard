import { createFileRoute } from "@tanstack/react-router";
import DashboardAreaPlaceholder from "#/components/dashboard-area-placeholder";

export const Route = createFileRoute("/intake")({
	component: IntakeRoute,
});

function IntakeRoute() {
	return (
		<DashboardAreaPlaceholder
			badge="Intake"
			title="New reports land here first."
			description="This area is reserved for fresh bug intake, duplicate detection, SLA prioritisation, and the first operator decisions that shape the rest of the queue."
			primaryAction={{ label: "Back to overview", to: "/" }}
			secondaryAction={{ label: "Review setup", to: "/setup" }}
			details={[
				{
					label: "Queue",
					title: "Fresh reports and duplicates",
					note: "Operators need a fast way to sort genuine new incidents from repeats and noisy follow-ups.",
				},
				{
					label: "Signals",
					title: "SLA and severity cues",
					note: "First-response timers, account impact, and release correlation should all surface before handoff.",
				},
				{
					label: "Actions",
					title: "Escalate or route onward",
					note: "This page should be able to push work into investigation, verification, or a blocked state without changing layout.",
				},
			]}
			checklist={[
				"Mount the live intake list from Daphne and preserve the current shell spacing.",
				"Add batch triage actions and a filter model that works on both desktop and mobile.",
				"Introduce the empty, loading, and errored list states without replacing the page chrome.",
			]}
		/>
	);
}
