import { createFileRoute, Link } from "@tanstack/react-router";
import {
	Activity,
	ArrowRight,
	BadgeCheck,
	CircleAlert,
	Clock3,
	ExternalLink,
	Radar,
	ShieldAlert,
	Siren,
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
import { env } from "#/lib/env";
import {
	type ActivityItem,
	type CoverageNote,
	emptyOverview,
	type OverviewData,
	type OverviewMetric,
	type OverviewSource,
	type OverviewTone,
	type QueueLane,
	resolveOverviewData,
	snapshotOverview,
	type WatchItem,
} from "#/lib/overview";

type SearchMode = "auto" | "snapshot" | "empty";

export const Route = createFileRoute("/")({
	validateSearch: (search: Record<string, unknown>) => ({
		mode:
			search.mode === "snapshot" || search.mode === "empty"
				? search.mode
				: "auto",
	}),
	component: OverviewRoute,
});

function OverviewRoute() {
	const { mode } = Route.useSearch();
	const [screenState, setScreenState] = useState<
		| { kind: "loading" }
		| { kind: "ready"; data: OverviewData; source: OverviewSource | "empty" }
	>(() => getInitialState(mode));

	useEffect(() => {
		const abortController = new AbortController();

		if (mode === "empty") {
			startTransition(() => {
				setScreenState({
					kind: "ready",
					data: emptyOverview,
					source: "empty",
				});
			});
			return () => abortController.abort();
		}

		if (mode === "snapshot") {
			startTransition(() => {
				setScreenState({
					kind: "ready",
					data: snapshotOverview,
					source: "snapshot",
				});
			});
			return () => abortController.abort();
		}

		startTransition(() => {
			setScreenState({ kind: "loading" });
		});

		void resolveOverviewData(abortController.signal)
			.then((result) => {
				startTransition(() => {
					setScreenState({
						kind: "ready",
						data: result.data,
						source: result.source,
					});
				});
			})
			.catch((error) => {
				if (error instanceof Error && error.name === "AbortError") {
					return;
				}

				startTransition(() => {
					setScreenState({
						kind: "ready",
						data: snapshotOverview,
						source: "snapshot",
					});
				});
			});

		return () => abortController.abort();
	}, [mode]);

	if (screenState.kind === "loading") {
		return <OverviewSkeleton />;
	}

	return (
		<OverviewScreen
			data={screenState.data}
			mode={mode}
			source={screenState.source}
		/>
	);
}

function OverviewScreen({
	data,
	mode,
	source,
}: {
	data: OverviewData;
	mode: SearchMode;
	source: OverviewSource | "empty";
}) {
	const sourceConfig = getSourceConfig(source);
	const queueMax = Math.max(...data.queues.map((lane) => lane.count), 1);

	return (
		<main className="page-wrap space-y-6 px-4 pb-16 pt-10">
			<section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
				<Card className="overview-hero overflow-hidden border-none text-white">
					<CardHeader className="space-y-5">
						<div className="flex flex-wrap items-center gap-2">
							<Badge className="bg-white/14 text-white shadow-none">
								Dashboard overview
							</Badge>
							<Badge
								variant={sourceConfig.badgeVariant}
								className={source === "live" ? "" : "bg-white/10 text-white"}
							>
								{sourceConfig.label}
							</Badge>
						</div>
						<div className="space-y-4">
							<CardTitle className="max-w-3xl font-display text-4xl leading-none font-semibold tracking-tight sm:text-5xl">
								{data.title}
							</CardTitle>
							<CardDescription className="max-w-2xl text-base leading-7 text-slate-100/88">
								{data.summary}
							</CardDescription>
						</div>
					</CardHeader>
					<CardContent className="grid gap-4 lg:grid-cols-[1fr_0.78fr]">
						<div className="space-y-5">
							<div className="grid gap-3 sm:grid-cols-3">
								<SignalPill
									icon={Siren}
									label={data.metrics[0]?.label ?? "Bug intake"}
									value={data.metrics[0]?.value ?? "0"}
								/>
								<SignalPill
									icon={BadgeCheck}
									label={data.metrics[1]?.label ?? "Verification"}
									value={data.metrics[1]?.value ?? "0"}
								/>
								<SignalPill
									icon={Clock3}
									label={data.metrics[3]?.label ?? "Intake age"}
									value={data.metrics[3]?.value ?? "0m"}
								/>
							</div>
							<div className="flex flex-wrap items-center gap-3">
								<Button asChild size="lg" className="rounded-full">
									<Link to="/setup">
										Review setup
										<ArrowRight />
									</Link>
								</Button>
								<Button
									asChild
									variant="secondary"
									size="lg"
									className="rounded-full border border-white/12 bg-white/10 text-white hover:bg-white/16"
								>
									<a href={env.daphneUrl} target="_blank" rel="noreferrer">
										Open Daphne
										<ExternalLink />
									</a>
								</Button>
							</div>
						</div>

						<div className="rounded-3xl border border-white/12 bg-white/8 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
							<p className="eyebrow text-white/72">Shift status</p>
							<p className="mt-3 text-2xl font-semibold tracking-tight">
								{data.shiftLabel}
							</p>
							<p className="mt-2 text-sm leading-6 text-slate-100/80">
								{sourceConfig.description}
							</p>
							<div className="mt-5 space-y-3">
								<div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/14 px-4 py-3">
									<span className="text-sm text-slate-100/80">Snapshot</span>
									<span className="text-sm font-medium text-white">
										{data.snapshotTakenAt}
									</span>
								</div>
								<div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/14 px-4 py-3">
									<span className="text-sm text-slate-100/80">Daphne</span>
									<span className="text-sm font-medium text-white">
										{env.daphneUrl}
									</span>
								</div>
								<div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/14 px-4 py-3">
									<span className="text-sm text-slate-100/80">Mode</span>
									<span className="text-sm font-medium text-white">
										{mode === "auto" ? "Auto detect" : mode}
									</span>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="surface panel-border">
					<CardHeader className="space-y-3">
						<Badge variant="outline" className="w-fit">
							Recent system activity
						</Badge>
						<CardTitle className="text-2xl">Activity feed</CardTitle>
						<CardDescription>
							A tight operator log instead of placeholder SaaS growth numbers.
						</CardDescription>
					</CardHeader>
					<CardContent>
						{data.activity.length > 0 ? (
							<div className="space-y-4">
								{data.activity.slice(0, 4).map((item, index) => (
									<div key={item.id} className="space-y-4">
										{index > 0 ? <Separator /> : null}
										<ActivityRow item={item} />
									</div>
								))}
							</div>
						) : (
							<EmptyPanel
								icon={Activity}
								title="No system activity yet"
								description="Recent queue movements, verifications, and escalations will appear here once the first workflow event lands."
							/>
						)}
					</CardContent>
				</Card>
			</section>

			<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				{data.metrics.map((metric) => (
					<MetricCard key={metric.label} metric={metric} />
				))}
			</section>

			<section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
				<Card className="surface panel-border">
					<CardHeader className="space-y-3">
						<Badge variant="outline" className="w-fit">
							Queue health
						</Badge>
						<CardTitle className="text-2xl">Bugfixes workflow lanes</CardTitle>
						<CardDescription>
							The overview keeps intake, investigation, and ship-room pressure
							visible.
						</CardDescription>
					</CardHeader>
					<CardContent>
						{data.queues.length > 0 ? (
							<div className="space-y-4">
								{data.queues.map((lane, index) => (
									<div key={lane.name} className="space-y-4">
										{index > 0 ? <Separator /> : null}
										<QueueRow lane={lane} max={queueMax} />
									</div>
								))}
							</div>
						) : (
							<EmptyPanel
								icon={Radar}
								title="All lanes are clear"
								description="Queue counts will fill in here once Daphne exposes workflow totals or the first incident enters triage."
							/>
						)}
					</CardContent>
				</Card>

				<Card className="surface panel-border">
					<CardHeader className="space-y-3">
						<div className="flex items-center gap-2">
							<Badge variant="outline">Ship room</Badge>
							<Badge variant="secondary">Current watchlist</Badge>
						</div>
						<CardTitle className="text-2xl">
							What needs operator attention
						</CardTitle>
						<CardDescription>
							Short, action-oriented cards for the bugs most likely to shape the
							next release.
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-4 md:grid-cols-3">
						{data.watchlist.length > 0 ? (
							data.watchlist.map((item) => (
								<WatchCard key={item.id} item={item} />
							))
						) : (
							<div className="md:col-span-3">
								<EmptyPanel
									icon={ShieldAlert}
									title="No hot issues on the watchlist"
									description="Escalated bugs, release blockers, and fixes waiting for verification will show here."
								/>
							</div>
						)}
					</CardContent>
				</Card>
			</section>

			<section className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
				<Card className="surface panel-border">
					<CardHeader className="space-y-3">
						<Badge variant="outline" className="w-fit">
							Coverage notes
						</Badge>
						<CardTitle className="text-2xl">Operator context</CardTitle>
						<CardDescription>
							Compact notes that keep the board useful even when the live feed
							is still thin.
						</CardDescription>
					</CardHeader>
					<CardContent>
						{data.coverage.length > 0 ? (
							<div className="space-y-4">
								{data.coverage.map((item, index) => (
									<div key={item.label} className="space-y-4">
										{index > 0 ? <Separator /> : null}
										<CoverageRow item={item} />
									</div>
								))}
							</div>
						) : (
							<EmptyPanel
								icon={CircleAlert}
								title="No handoff notes yet"
								description="Coverage summaries, staffing notes, and the next handoff time will appear here when the board has context to share."
							/>
						)}
					</CardContent>
				</Card>

				<Card className="surface panel-border">
					<CardHeader className="space-y-3">
						<Badge variant="outline" className="w-fit">
							Why this page exists
						</Badge>
						<CardTitle className="text-2xl">
							Useful before every module is built
						</CardTitle>
						<CardDescription>
							This overview is designed to read well in three states: live,
							fallback snapshot, and quiet board.
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-4 md:grid-cols-3">
						<SummaryCard
							title="Live feed"
							description="When Daphne serves `/api/dashboard/overview`, the dashboard hydrates directly from live workflow activity."
						/>
						<SummaryCard
							title="Snapshot fallback"
							description="If that endpoint is absent, the board stays useful with seeded Bugfixes data instead of empty template cards."
						/>
						<SummaryCard
							title="Quiet board"
							description="Use `?mode=empty` to preview the explicit no-data state and confirm the layout remains coherent."
						/>
					</CardContent>
				</Card>
			</section>
		</main>
	);
}

function MetricCard({ metric }: { metric: OverviewMetric }) {
	return (
		<Card className="surface panel-border fade-up">
			<CardHeader className="space-y-2">
				<div className="flex items-start justify-between gap-3">
					<p className="panel-label">{metric.label}</p>
					<ToneBadge tone={metric.tone}>{metric.change}</ToneBadge>
				</div>
				<CardTitle className="metric-value">{metric.value}</CardTitle>
				<CardDescription className="leading-6">{metric.note}</CardDescription>
			</CardHeader>
		</Card>
	);
}

function ActivityRow({ item }: { item: ActivityItem }) {
	return (
		<div className="flex gap-4">
			<div className="flex flex-col items-center">
				<span className={`tone-dot ${getToneDotClass(item.tone)}`} />
				<span className="mt-2 h-full w-px bg-border/70" />
			</div>
			<div className="space-y-2 pb-1">
				<div className="flex flex-wrap items-center gap-2">
					<p className="m-0 font-medium text-foreground">{item.title}</p>
					<ToneBadge tone={item.tone}>{item.actor}</ToneBadge>
					<span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
						{item.time}
					</span>
				</div>
				<p className="m-0 text-sm leading-6 text-muted-foreground">
					{item.detail}
				</p>
			</div>
		</div>
	);
}

function QueueRow({ lane, max }: { lane: QueueLane; max: number }) {
	const width = `${Math.max((lane.count / max) * 100, lane.count > 0 ? 12 : 0)}%`;

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between gap-3">
				<div>
					<p className="m-0 font-medium text-foreground">{lane.name}</p>
					<p className="m-0 mt-1 text-sm text-muted-foreground">{lane.note}</p>
				</div>
				<ToneBadge tone={lane.tone}>{lane.count}</ToneBadge>
			</div>
			<div className="queue-track">
				<div
					className={`queue-fill ${getQueueFillClass(lane.tone)}`}
					style={{ width }}
				/>
			</div>
		</div>
	);
}

function WatchCard({ item }: { item: WatchItem }) {
	return (
		<div className="rounded-3xl border border-border/70 bg-background/75 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<ToneBadge tone={item.tone}>{item.severity}</ToneBadge>
				<Badge variant="outline">{item.status}</Badge>
			</div>
			<p className="mt-4 text-lg font-semibold tracking-tight text-foreground">
				{item.title}
			</p>
			<p className="mt-3 text-sm leading-6 text-muted-foreground">
				{item.nextStep}
			</p>
			<p className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
				Owner
			</p>
			<p className="mt-1 text-sm font-medium text-foreground">{item.owner}</p>
		</div>
	);
}

function CoverageRow({ item }: { item: CoverageNote }) {
	return (
		<div className="rounded-2xl border border-border/70 bg-background/75 p-4">
			<p className="eyebrow">{item.label}</p>
			<p className="mt-3 text-lg font-semibold tracking-tight text-foreground">
				{item.value}
			</p>
			<p className="mt-2 text-sm leading-6 text-muted-foreground">
				{item.note}
			</p>
		</div>
	);
}

function SignalPill({
	icon: Icon,
	label,
	value,
}: {
	icon: typeof Siren;
	label: string;
	value: string;
}) {
	return (
		<div className="rounded-2xl border border-white/12 bg-black/16 px-4 py-3">
			<div className="flex items-center gap-2 text-slate-100/78">
				<Icon className="size-4" />
				<span className="text-sm">{label}</span>
			</div>
			<p className="mt-3 text-2xl font-semibold tracking-tight text-white">
				{value}
			</p>
		</div>
	);
}

function SummaryCard({
	title,
	description,
}: {
	title: string;
	description: string;
}) {
	return (
		<div className="rounded-3xl border border-border/70 bg-background/75 p-5">
			<p className="text-lg font-semibold tracking-tight text-foreground">
				{title}
			</p>
			<p className="mt-3 text-sm leading-6 text-muted-foreground">
				{description}
			</p>
		</div>
	);
}

function EmptyPanel({
	icon: Icon,
	title,
	description,
}: {
	icon: typeof Activity;
	title: string;
	description: string;
}) {
	return (
		<div className="rounded-3xl border border-dashed border-border bg-background/70 px-5 py-8 text-center">
			<div className="mx-auto flex size-11 items-center justify-center rounded-full border border-border/80 bg-background">
				<Icon className="size-5 text-muted-foreground" />
			</div>
			<p className="mt-4 text-lg font-semibold tracking-tight text-foreground">
				{title}
			</p>
			<p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
				{description}
			</p>
		</div>
	);
}

function ToneBadge({
	tone,
	children,
}: {
	tone: OverviewTone;
	children: React.ReactNode;
}) {
	return (
		<Badge className={getToneBadgeClass(tone)} variant="secondary">
			{children}
		</Badge>
	);
}

function OverviewSkeleton() {
	return (
		<main className="page-wrap space-y-6 px-4 pb-16 pt-10">
			<section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
				<Card className="overview-hero overflow-hidden border-none">
					<CardHeader className="space-y-5">
						<div className="flex gap-2">
							<Skeleton className="h-6 w-36 rounded-full bg-white/16" />
							<Skeleton className="h-6 w-28 rounded-full bg-white/16" />
						</div>
						<div className="space-y-3">
							<Skeleton className="h-14 w-full max-w-3xl bg-white/16" />
							<Skeleton className="h-5 w-full max-w-2xl bg-white/14" />
							<Skeleton className="h-5 w-full max-w-xl bg-white/14" />
						</div>
					</CardHeader>
					<CardContent className="grid gap-4 lg:grid-cols-[1fr_0.78fr]">
						<div className="grid gap-3 sm:grid-cols-3">
							{[0, 1, 2].map((item) => (
								<Skeleton key={item} className="h-28 rounded-2xl bg-white/14" />
							))}
						</div>
						<Skeleton className="h-60 rounded-3xl bg-white/14" />
					</CardContent>
				</Card>

				<Card className="surface panel-border">
					<CardHeader className="space-y-3">
						<Skeleton className="h-6 w-40 rounded-full" />
						<Skeleton className="h-8 w-48" />
						<Skeleton className="h-5 w-full max-w-sm" />
					</CardHeader>
					<CardContent className="space-y-4">
						{[0, 1, 2].map((item) => (
							<Skeleton key={item} className="h-24 rounded-2xl" />
						))}
					</CardContent>
				</Card>
			</section>

			<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				{[0, 1, 2, 3].map((item) => (
					<Card key={item} className="surface panel-border">
						<CardHeader className="space-y-3">
							<Skeleton className="h-4 w-28" />
							<Skeleton className="h-10 w-24" />
							<Skeleton className="h-5 w-full" />
							<Skeleton className="h-5 w-3/4" />
						</CardHeader>
					</Card>
				))}
			</section>

			<section className="grid gap-6 xl:grid-cols-2">
				{[0, 1].map((item) => (
					<Card key={item} className="surface panel-border">
						<CardHeader className="space-y-3">
							<Skeleton className="h-6 w-36 rounded-full" />
							<Skeleton className="h-8 w-56" />
						</CardHeader>
						<CardContent className="space-y-4">
							{[0, 1, 2].map((row) => (
								<Skeleton key={row} className="h-24 rounded-2xl" />
							))}
						</CardContent>
					</Card>
				))}
			</section>
		</main>
	);
}

function getInitialState(mode: SearchMode) {
	if (mode === "empty") {
		return {
			kind: "ready" as const,
			data: emptyOverview,
			source: "empty" as const,
		};
	}

	if (mode === "snapshot") {
		return {
			kind: "ready" as const,
			data: snapshotOverview,
			source: "snapshot" as const,
		};
	}

	return { kind: "loading" as const };
}

function getSourceConfig(source: OverviewSource | "empty") {
	if (source === "live") {
		return {
			label: "Live signal",
			badgeVariant: "default" as const,
			description:
				"The board is hydrated from Daphne workflow data, so queue movement and recent events reflect the active operational state.",
		};
	}

	if (source === "empty") {
		return {
			label: "Quiet board",
			badgeVariant: "outline" as const,
			description:
				"No recent workflow activity is available yet, but the overview still shows what will populate once intake begins.",
		};
	}

	return {
		label: "Snapshot fallback",
		badgeVariant: "secondary" as const,
		description:
			"Daphne is not serving the overview feed yet, so the screen falls back to a seeded Bugfixes snapshot instead of empty scaffold content.",
	};
}

function getToneBadgeClass(tone: OverviewTone) {
	if (tone === "good") {
		return "border border-emerald-200 bg-emerald-50 text-emerald-700";
	}

	if (tone === "warn") {
		return "border border-amber-200 bg-amber-50 text-amber-700";
	}

	if (tone === "critical") {
		return "border border-rose-200 bg-rose-50 text-rose-700";
	}

	return "border border-slate-200 bg-slate-100 text-slate-700";
}

function getToneDotClass(tone: OverviewTone) {
	if (tone === "good") {
		return "bg-emerald-500";
	}

	if (tone === "warn") {
		return "bg-amber-500";
	}

	if (tone === "critical") {
		return "bg-rose-500";
	}

	return "bg-sky-500";
}

function getQueueFillClass(tone: OverviewTone) {
	if (tone === "good") {
		return "bg-emerald-500";
	}

	if (tone === "warn") {
		return "bg-amber-500";
	}

	if (tone === "critical") {
		return "bg-rose-500";
	}

	return "bg-sky-500";
}
