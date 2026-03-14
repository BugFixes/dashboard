import { createFileRoute } from "@tanstack/react-router";
import DashboardAreaPlaceholder from "#/components/dashboard-area-placeholder";

export const Route = createFileRoute("/accounts")({
	component: AccountsRoute,
});

function AccountsRoute() {
	return (
		<DashboardAreaPlaceholder
			badge="Accounts"
			title="Configure customer accounts without leaving the dashboard."
			description="This area is reserved for account setup, provider ownership, ingestion posture, and the customer-specific controls operators need before bug traffic scales."
			primaryAction={{ label: "Back to overview", to: "/" }}
			secondaryAction={{ label: "Open settings", to: "/settings" }}
			details={[
				{
					label: "Onboarding",
					title: "Accounts need a clear setup path",
					note: "Operators should be able to create accounts, confirm environment readiness, and see whether each tenant is ready to send bug data.",
				},
				{
					label: "Ownership",
					title: "Contacts and provider links stay visible",
					note: "Support owners, ticket providers, and notification targets should remain attached to each account instead of living in scattered notes.",
				},
				{
					label: "Health",
					title: "Delivery posture is obvious",
					note: "The first pass should reserve room for missing credentials, paused ingestion, and noisy tenants that need admin attention.",
				},
			]}
			checklist={[
				"Add the account list and creation flow without replacing the shell or top-level navigation.",
				"Surface provider status, ingestion health, and empty/loading/error states in a layout that still works on mobile.",
				"Reserve room for account-scoped actions such as enabling notifications or rotating downstream integrations.",
			]}
		/>
	);
}
