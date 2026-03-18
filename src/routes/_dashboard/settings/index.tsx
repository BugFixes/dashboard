import { OrganizationProfile, useOrganization } from "@clerk/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Settings2 } from "lucide-react";
import OrganizationSetupPanel from "#/components/organization-setup-panel";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { env } from "#/lib/env";

export const Route = createFileRoute("/_dashboard/settings/")({
	component: SettingsPage,
});

function SettingsPage() {
	const { organization, isLoaded } = useOrganization();

	return (
		<main className="page-wrap space-y-6 px-4 pb-16 pt-10">
			<Card className="hero-panel overflow-hidden border-none text-white">
				<CardHeader className="space-y-5">
					<div className="flex flex-wrap items-center gap-2">
						<Badge className="bg-white/14 text-white shadow-none">
							Organization settings
						</Badge>
						<Badge className="bg-white/10 text-white shadow-none">
							Onboarding hub
						</Badge>
					</div>
					<div className="space-y-4">
						<CardTitle className="max-w-3xl font-display text-4xl leading-none font-semibold tracking-tight sm:text-5xl">
							Configure the organization, not an account
						</CardTitle>
						<p className="max-w-3xl text-base leading-7 text-slate-100/88">
							This page now anchors the real operator setup flow: organization
							context, memberships, agent credentials, and the provider areas
							that are still waiting on backend contracts.
						</p>
					</div>
				</CardHeader>
				<CardContent className="grid gap-3 sm:grid-cols-3">
					<HeroPill
						label="Organization context"
						value={organization?.name ?? (isLoaded ? "Select one" : "Loading")}
					/>
					<HeroPill label="Membership workflow" value="Supported" />
					<HeroPill label="Provider setup" value="Partially stubbed" />
				</CardContent>
			</Card>

			<OrganizationSetupPanel
				title="Setup progress"
				description="Use this checklist to move a team from an empty dashboard shell to a usable organization workspace."
			/>

			<Card className="surface panel-border">
				<CardHeader className="space-y-3">
					<div className="flex flex-wrap items-center gap-2">
						<Badge variant="outline">Organization controls</Badge>
						<Badge variant="secondary">
							{env.providers.clerkConfigured ? "Clerk-backed" : "Preview only"}
						</Badge>
					</div>
					<CardTitle className="text-3xl">Organization settings</CardTitle>
					<CardDescription className="leading-6">
						Profile edits and membership administration stay grounded in the
						organization context instead of a separate account setup flow.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{env.providers.clerkConfigured ? (
						organization ? (
							<div className="overflow-hidden rounded-3xl border border-border/70 bg-background/75 p-2">
								<OrganizationProfile
									appearance={{
										elements: {
											rootBox: "w-full",
											card: "shadow-none border-none p-0 w-full bg-transparent",
											navbar: "border-r border-border/70",
											pageScrollBox: "p-0",
											content: "p-0 w-full",
											organizationProfile: "w-full",
										},
									}}
								/>
							</div>
						) : (
							<EmptyOrgSettingsCard />
						)
					) : (
						<PreviewSettingsCard />
					)}
				</CardContent>
			</Card>
		</main>
	);
}

function HeroPill({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-2xl border border-white/12 bg-black/16 px-4 py-3">
			<p className="m-0 text-sm text-slate-100/76">{label}</p>
			<p className="mt-3 mb-0 text-2xl font-semibold tracking-tight text-white">
				{value}
			</p>
		</div>
	);
}

function EmptyOrgSettingsCard() {
	return (
		<div className="rounded-3xl border border-dashed border-border bg-background/70 px-5 py-8 text-center">
			<div className="mx-auto flex size-11 items-center justify-center rounded-full border border-border/80 bg-background">
				<Building2 className="size-5 text-muted-foreground" />
			</div>
			<p className="mt-4 text-lg font-semibold tracking-tight text-foreground">
				No organization selected
			</p>
			<p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
				Select or create an organization above to unlock the live settings and
				membership workflow.
			</p>
			<div className="mt-6 flex justify-center">
				<Button asChild>
					<Link to="/members">Open members</Link>
				</Button>
			</div>
		</div>
	);
}

function PreviewSettingsCard() {
	return (
		<div className="rounded-3xl border border-dashed border-border bg-background/70 px-5 py-8 text-center">
			<div className="mx-auto flex size-11 items-center justify-center rounded-full border border-border/80 bg-background">
				<Settings2 className="size-5 text-muted-foreground" />
			</div>
			<p className="mt-4 text-lg font-semibold tracking-tight text-foreground">
				Provider settings are in preview mode
			</p>
			<p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
				Clerk is not configured locally, so this page shows the organization
				onboarding structure without live organization settings.
			</p>
		</div>
	);
}
