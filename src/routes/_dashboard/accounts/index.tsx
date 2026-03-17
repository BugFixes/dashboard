import { useOrganization } from "@clerk/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import DashboardAreaPlaceholder from "#/components/dashboard-area-placeholder";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { env } from "#/lib/env";
import { isInternalBugfixesOrg } from "#/lib/internal-access";

export const Route = createFileRoute("/_dashboard/accounts/")({
	component: AccountsRoute,
});

function AccountsRoute() {
	const { organization } = useOrganization();
	const canAccessAccounts = isInternalBugfixesOrg(organization);

	if (!canAccessAccounts) {
		return (
			<main className="page-wrap space-y-6 px-4 pb-16 pt-10">
				<Card className="surface panel-border">
					<CardHeader className="space-y-3">
						<div className="flex flex-wrap items-center gap-2">
							<Badge variant="outline">Accounts</Badge>
							<Badge variant="secondary">Bugfixes internal</Badge>
						</div>
						<CardTitle className="text-2xl font-semibold tracking-tight">
							Accounts is an internal Bugfixes-only section.
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="rounded-3xl border border-dashed border-border bg-background/70 px-5 py-8 text-center">
							<div className="mx-auto flex size-11 items-center justify-center rounded-full border border-border/80 bg-background">
								<Building2 className="size-5 text-muted-foreground" />
							</div>
							<p className="mt-4 text-lg font-semibold tracking-tight text-foreground">
								Hide this from normal customer orgs
							</p>
							<p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
								Settings, Agents, Members, Tickets, and Notifications are the
								main product sections. Accounts should only appear for internal
								Bugfixes org contexts.
							</p>
						</div>
						<div className="flex flex-wrap items-center gap-3">
							<Button asChild>
								<Link to="/settings">Open settings</Link>
							</Button>
							<Button asChild variant="outline">
								<Link to="/agents">Open agents</Link>
							</Button>
						</div>
						<p className="m-0 text-xs leading-5 text-muted-foreground">
							Local development keeps this section available when Clerk is not
							configured. The current internal-org matchers are{" "}
							<code>{env.access.internalOrgMatchers.join(", ")}</code>.
						</p>
					</CardContent>
				</Card>
			</main>
		);
	}

	return (
		<DashboardAreaPlaceholder
			badge="Accounts"
			title="Accounts TODO (internal)"
			description="Build internal account provisioning, support ownership, and environment override controls here."
			primaryAction={{ label: "Back to overview", to: "/" }}
			secondaryAction={{ label: "Open settings", to: "/settings" }}
			details={[
				{
					label: "Internal",
					title: "This stays staff-only",
					note: "Use this space for account provisioning and support controls without mixing it into the main product workflow.",
				},
				{
					label: "Scope",
					title: "Customer-facing controls belong elsewhere",
					note: "AI configuration, notifications, ticketing, team management, and agent credentials map more cleanly to Settings, Members, and Agents.",
				},
				{
					label: "Decision",
					title: "Treat this as a protected internal lane",
					note: "Keep the route hidden unless the current org matches the approved internal-org rules.",
				},
			]}
			checklist={[
				"Add explicit staff-facing account tooling once the access policy and data model are confirmed.",
				"Keep this section hidden from non-internal orgs through org-based gating, not just copy.",
				"Avoid duplicating controls that already belong in Settings or Agents.",
			]}
		/>
	);
}
