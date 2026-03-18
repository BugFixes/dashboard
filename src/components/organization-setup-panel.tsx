import { OrganizationSwitcher, useAuth, useOrganization } from "@clerk/react";
import { Link, useLocation } from "@tanstack/react-router";
import {
	Brain,
	Building2,
	CheckCircle2,
	CircleAlert,
	KeyRound,
	Mail,
	Ticket,
	Users,
} from "lucide-react";
import { startTransition, useEffect, useState } from "react";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { Separator } from "#/components/ui/separator";
import { Skeleton } from "#/components/ui/skeleton";
import { listApiKeys, snapshotApiKeys } from "#/lib/api-keys";
import { env } from "#/lib/env";
import { snapshotMemberList } from "#/lib/members";
import {
	buildOrganizationSetupState,
	type OrganizationSetupState,
	type OrganizationSetupStatus,
	type OrganizationSetupStep,
} from "#/lib/organization-setup";

type ApiKeysState =
	| { kind: "loading" }
	| { kind: "ready"; count: number }
	| { kind: "error" };

export function OrganizationSetupPanel({
	title = "Organization onboarding",
	description = "Track what is already supported in the dashboard and what still depends on backend work.",
	showProviders = true,
	showGaps = true,
	compact = false,
}: {
	title?: string;
	description?: string;
	showProviders?: boolean;
	showGaps?: boolean;
	compact?: boolean;
}) {
	const pathname = useLocation({
		select: (location) => location.pathname,
	});
	const { isLoaded: authLoaded, userId } = useAuth();
	const {
		isLoaded: organizationLoaded,
		organization,
		memberships,
	} = useOrganization({
		memberships: { pageSize: 50, keepPreviousData: true },
	});
	const [apiKeysState, setApiKeysState] = useState<ApiKeysState>(() =>
		env.providers.clerkConfigured
			? { kind: "loading" }
			: { kind: "ready", count: snapshotApiKeys.length },
	);

	useEffect(() => {
		if (!env.providers.clerkConfigured) {
			startTransition(() => {
				setApiKeysState({ kind: "ready", count: snapshotApiKeys.length });
			});
			return;
		}

		if (!authLoaded || !organizationLoaded || !userId) {
			startTransition(() => {
				setApiKeysState({ kind: "loading" });
			});
			return;
		}

		if (!organization) {
			startTransition(() => {
				setApiKeysState({ kind: "ready", count: 0 });
			});
			return;
		}

		const abortController = new AbortController();

		void listApiKeys({
			clerkOrgId: organization.id,
			clerkUserId: userId,
			signal: abortController.signal,
		})
			.then((keys) => {
				startTransition(() => {
					setApiKeysState({ kind: "ready", count: keys.length });
				});
			})
			.catch((error) => {
				if (error instanceof Error && error.name === "AbortError") {
					return;
				}

				startTransition(() => {
					setApiKeysState({ kind: "error" });
				});
			});

		return () => abortController.abort();
	}, [authLoaded, organization, organizationLoaded, userId]);

	if (
		env.providers.clerkConfigured &&
		(!organizationLoaded ||
			memberships?.isLoading ||
			apiKeysState.kind === "loading")
	) {
		return <OrganizationSetupSkeleton compact={compact} />;
	}

	const mode = env.providers.clerkConfigured ? "live" : "snapshot";
	const memberCount = env.providers.clerkConfigured
		? (memberships?.data?.length ?? 0)
		: snapshotMemberList.members.length;
	const apiKeyCount = apiKeysState.kind === "ready" ? apiKeysState.count : 0;
	const state = buildOrganizationSetupState({
		mode,
		hasOrganization: Boolean(organization) || !env.providers.clerkConfigured,
		organizationName: organization?.name ?? null,
		memberCount,
		apiKeyCount,
	});

	return (
		<div className="space-y-6">
			<Card className="surface panel-border">
				<CardHeader className="space-y-3">
					<div className="flex flex-wrap items-center gap-2">
						<Badge variant="outline">{title}</Badge>
						<Badge variant="secondary">
							{state.mode === "live" ? "Live setup state" : "Snapshot preview"}
						</Badge>
					</div>
					<CardTitle className={compact ? "text-2xl" : "text-3xl"}>
						{state.organizationLabel}
					</CardTitle>
					<CardDescription className="max-w-3xl leading-6">
						{description}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid gap-4 lg:grid-cols-[0.84fr_1.16fr]">
						<div className="rounded-3xl border border-border/70 bg-background/72 p-5">
							<p className="eyebrow">Setup progress</p>
							<p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
								{state.completedFoundationSteps}/{state.totalFoundationSteps}
							</p>
							<p className="mt-2 text-sm leading-6 text-muted-foreground">
								{state.summary}
							</p>
							<div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
								<div
									className="h-full rounded-full bg-primary transition-[width]"
									style={{ width: `${state.progressPercent}%` }}
								/>
							</div>
							<div className="mt-5 flex flex-wrap gap-3">
								<Button asChild>
									<Link to="/settings">Open settings</Link>
								</Button>
								<Button asChild variant="outline">
									<Link to="/agents">Open agents</Link>
								</Button>
							</div>
							{!organization && env.providers.clerkConfigured ? (
								<div className="mt-5 rounded-2xl border border-dashed border-border bg-background/80 p-4">
									<p className="m-0 text-sm font-medium text-foreground">
										Create or select an organization
									</p>
									<p className="mt-2 mb-0 text-sm leading-6 text-muted-foreground">
										The switcher below opens the live Clerk flow for creating or
										changing organizations without leaving the dashboard.
									</p>
									<div className="mt-4">
										<OrganizationSwitcher
											hidePersonal
											afterCreateOrganizationUrl={pathname}
											afterLeaveOrganizationUrl={pathname}
											afterSelectOrganizationUrl={pathname}
											appearance={{
												elements: {
													rootBox: "w-full",
													organizationSwitcherTrigger:
														"flex items-center gap-3 w-full rounded-xl border border-[var(--line)] bg-white p-2 shadow-sm transition-all hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800",
													organizationPreviewMainIdentifier:
														"font-semibold text-sm truncate",
													organizationPreviewSecondaryIdentifier:
														"text-xs text-zinc-500",
													organizationPreviewAvatarBox: "size-8 rounded-lg",
												},
											}}
										/>
									</div>
								</div>
							) : null}
							{apiKeysState.kind === "error" ? (
								<div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
									API key inventory could not be loaded, so the setup progress
									is showing the safe minimum state.
								</div>
							) : null}
						</div>

						<div className="grid gap-4 md:grid-cols-3">
							{state.foundationSteps.map((step) => (
								<SetupStepCard key={step.id} step={step} compact={compact} />
							))}
						</div>
					</div>

					{showProviders ? (
						<>
							<Separator />
							<div className="space-y-4">
								<div>
									<p className="eyebrow">Provider configuration</p>
									<p className="mt-2 mb-0 text-sm leading-6 text-muted-foreground">
										These routes are part of onboarding now, but the saved
										provider contracts are still explicitly marked where backend
										work is missing.
									</p>
								</div>
								<div className="grid gap-4 md:grid-cols-3">
									{state.providerSteps.map((step) => (
										<SetupStepCard
											key={step.id}
											step={step}
											compact={compact}
										/>
									))}
								</div>
							</div>
						</>
					) : null}
				</CardContent>
			</Card>

			{showGaps ? <BackendGapCard state={state} compact={compact} /> : null}
		</div>
	);
}

export default OrganizationSetupPanel;

function SetupStepCard({
	step,
	compact,
}: {
	step: OrganizationSetupStep;
	compact: boolean;
}) {
	const Icon = getStepIcon(step.id);

	return (
		<div className="rounded-3xl border border-border/70 bg-background/75 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
			<div className="flex items-start justify-between gap-3">
				<div className="rounded-2xl border border-border/70 bg-background p-3">
					<Icon className="size-5 text-primary" />
				</div>
				<SetupStatusBadge status={step.status} />
			</div>
			<p className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
				{step.label}
			</p>
			<p className="mt-2 text-lg font-semibold tracking-tight text-foreground">
				{step.title}
			</p>
			<p className="mt-2 text-sm leading-6 text-muted-foreground">
				{step.description}
			</p>
			<p
				className={`mt-3 text-sm leading-6 ${
					compact ? "text-muted-foreground" : "text-foreground"
				}`}
			>
				{step.detail}
			</p>
			<div className="mt-5">
				<Button asChild variant="outline" size="sm">
					<Link to={step.href}>{step.actionLabel}</Link>
				</Button>
			</div>
		</div>
	);
}

function BackendGapCard({
	state,
	compact,
}: {
	state: OrganizationSetupState;
	compact: boolean;
}) {
	return (
		<Card className="surface panel-border">
			<CardHeader className="space-y-3">
				<div className="flex flex-wrap items-center gap-2">
					<Badge variant="outline">Implementation gaps</Badge>
					<Badge variant="secondary">
						{state.mode === "live" ? "Needs backend/API work" : "Preview only"}
					</Badge>
				</div>
				<CardTitle className={compact ? "text-2xl" : "text-3xl"}>
					What is still stubbed
				</CardTitle>
				<CardDescription className="leading-6">
					The dashboard now points operators to the right setup lanes without
					hiding which parts still depend on Daphne or provider contracts.
				</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-4 md:grid-cols-3">
				{state.gaps.map((gap) => (
					<div
						key={gap.title}
						className="rounded-2xl border border-border/70 bg-background/72 p-5"
					>
						<p className="m-0 text-base font-semibold text-foreground">
							{gap.title}
						</p>
						<p className="mt-2 mb-0 text-sm leading-6 text-muted-foreground">
							{gap.note}
						</p>
					</div>
				))}
			</CardContent>
		</Card>
	);
}

function SetupStatusBadge({ status }: { status: OrganizationSetupStatus }) {
	if (status === "complete") {
		return (
			<Badge className="border border-emerald-200 bg-emerald-50 text-emerald-700">
				<CheckCircle2 className="mr-1 size-3.5" />
				Complete
			</Badge>
		);
	}

	if (status === "ready") {
		return (
			<Badge className="border border-sky-200 bg-sky-50 text-sky-700">
				Ready now
			</Badge>
		);
	}

	if (status === "stubbed") {
		return (
			<Badge className="border border-amber-200 bg-amber-50 text-amber-700">
				Stubbed
			</Badge>
		);
	}

	if (status === "preview") {
		return (
			<Badge className="border border-violet-200 bg-violet-50 text-violet-700">
				Preview
			</Badge>
		);
	}

	return (
		<Badge className="border border-rose-200 bg-rose-50 text-rose-700">
			<CircleAlert className="mr-1 size-3.5" />
			Blocked
		</Badge>
	);
}

function OrganizationSetupSkeleton({ compact }: { compact: boolean }) {
	return (
		<div className="space-y-6">
			<Card className="surface panel-border">
				<CardHeader className="space-y-3">
					<div className="flex gap-2">
						<Skeleton className="h-6 w-44 rounded-full" />
						<Skeleton className="h-6 w-28 rounded-full" />
					</div>
					<Skeleton className={`h-10 ${compact ? "w-64" : "w-80"}`} />
					<Skeleton className="h-5 w-full max-w-2xl" />
				</CardHeader>
				<CardContent className="grid gap-4 lg:grid-cols-[0.84fr_1.16fr]">
					<Skeleton className="h-72 rounded-3xl" />
					<div className="grid gap-4 md:grid-cols-3">
						{[0, 1, 2].map((item) => (
							<Skeleton key={item} className="h-72 rounded-3xl" />
						))}
					</div>
				</CardContent>
			</Card>
			<Skeleton className="h-72 rounded-3xl" />
		</div>
	);
}

function getStepIcon(stepId: OrganizationSetupStep["id"]) {
	if (stepId === "organization") {
		return Building2;
	}

	if (stepId === "members") {
		return Users;
	}

	if (stepId === "agents") {
		return KeyRound;
	}

	if (stepId === "ai") {
		return Brain;
	}

	if (stepId === "ticketing") {
		return Ticket;
	}

	return Mail;
}
