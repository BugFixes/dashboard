import { Link, createFileRoute } from "@tanstack/react-router";
import {
	ArrowRight,
	Bug,
	Clock,
	Hash,
	Inbox,
	RefreshCw,
} from "lucide-react";
import { useOrganization } from "@clerk/react";
import { startTransition, useEffect, useState } from "react";
import { Badge } from "#/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { Separator } from "#/components/ui/separator";
import { Skeleton } from "#/components/ui/skeleton";
import {
	type BugListData,
	type BugSource,
	type BugSummary,
	type BugTone,
	emptyBugList,
	resolveBugList,
	snapshotBugList,
} from "#/lib/bugs";

type SearchMode = "auto" | "snapshot" | "empty";

export const Route = createFileRoute("/_dashboard/bugs/")({
	validateSearch: (search: Record<string, unknown>) => ({
		mode:
			search.mode === "snapshot" || search.mode === "empty"
				? search.mode
				: "auto",
	}),
	component: BugsRoute,
});

function BugsRoute() {
	const { mode } = Route.useSearch();
	const { organization } = useOrganization();
	const clerkOrgId = organization?.id ?? null;
	const [screenState, setScreenState] = useState<
		| { kind: "loading" }
		| { kind: "ready"; data: BugListData; source: BugSource | "empty" }
	>(() => getInitialState(mode));

	useEffect(() => {
		const abortController = new AbortController();

		if (mode === "empty") {
			startTransition(() => {
				setScreenState({
					kind: "ready",
					data: emptyBugList,
					source: "empty",
				});
			});
			return () => abortController.abort();
		}

		if (mode === "snapshot") {
			startTransition(() => {
				setScreenState({
					kind: "ready",
					data: snapshotBugList,
					source: "snapshot",
				});
			});
			return () => abortController.abort();
		}

		startTransition(() => {
			setScreenState({ kind: "loading" });
		});

		void resolveBugList(clerkOrgId, abortController.signal)
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
						data: snapshotBugList,
						source: "snapshot",
					});
				});
			});

		return () => abortController.abort();
	}, [mode, clerkOrgId]);

	if (screenState.kind === "loading") {
		return <BugListSkeleton />;
	}

	return (
		<BugListScreen
			data={screenState.data}
			source={screenState.source}
		/>
	);
}

function BugListScreen({
	data,
	source,
}: {
	data: BugListData;
	source: BugSource | "empty";
}) {
	return (
		<main className="page-wrap space-y-6 px-4 pb-16 pt-10">
			<Card className="hero-panel overflow-hidden border-none text-white">
				<CardHeader className="space-y-5">
					<div className="flex flex-wrap items-center gap-2">
						<Badge className="bg-white/14 text-white shadow-none">
							Bugs and stacktraces
						</Badge>
						<Badge
							variant="secondary"
							className={
								source === "live"
									? ""
									: "bg-white/10 text-white"
							}
						>
							{source === "live"
								? "Live signal"
								: source === "empty"
									? "No data"
									: "Snapshot"}
						</Badge>
					</div>
					<div className="space-y-4">
						<CardTitle className="max-w-3xl font-display text-3xl leading-none font-semibold tracking-tight sm:text-4xl">
							{data.title}
						</CardTitle>
						<CardDescription className="max-w-2xl text-base leading-7 text-slate-100/88">
							{data.summary}
						</CardDescription>
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid gap-3 sm:grid-cols-3">
						<SignalPill
							icon={Bug}
							label="Total bugs"
							value={String(data.bugs.length)}
						/>
						<SignalPill
							icon={RefreshCw}
							label="Total occurrences"
							value={String(
								data.bugs.reduce(
									(sum, bug) => sum + bug.occurrenceCount,
									0,
								),
							)}
						/>
						<SignalPill
							icon={Clock}
							label="Critical"
							value={String(
								data.bugs.filter(
									(bug) => bug.tone === "critical",
								).length,
							)}
						/>
					</div>
				</CardContent>
			</Card>

			{data.bugs.length > 0 ? (
				<Card className="surface panel-border">
					<CardHeader className="space-y-3">
						<Badge variant="outline" className="w-fit">
							Investigation inbox
						</Badge>
						<CardTitle className="text-2xl">
							Recent bug reports
						</CardTitle>
						<CardDescription>
							Stacktraces grouped by deduplication hash, sorted
							by last seen. Select a bug to inspect its
							stacktrace and operational outcomes.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{data.bugs.map((bug, index) => (
								<div key={bug.id} className="space-y-4">
									{index > 0 ? <Separator /> : null}
									<BugRow bug={bug} />
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			) : (
				<Card className="surface panel-border">
					<CardContent className="py-8">
						<EmptyPanel
							icon={Inbox}
							title="No bugs received yet"
							description="Stacktraces will appear here once the first agent starts publishing. Configure an account and agent from the overview to begin intake."
						/>
					</CardContent>
				</Card>
			)}
		</main>
	);
}

function BugRow({ bug }: { bug: BugSummary }) {
	return (
		<Link
			to="/bugs/$bugId"
			params={{ bugId: bug.id }}
			className="group block rounded-2xl p-4 no-underline transition-colors hover:bg-accent/50"
		>
			<div className="flex items-start justify-between gap-4">
				<div className="min-w-0 flex-1 space-y-3">
					<div className="flex flex-wrap items-center gap-2">
						<ToneBadge tone={bug.tone}>{bug.severity}</ToneBadge>
						<Badge variant="outline">{bug.language}</Badge>
						{bug.ticketStatus !== "none" ? (
							<Badge variant="secondary">
								{bug.ticketProvider} · {bug.ticketStatus}
							</Badge>
						) : null}
						{bug.notificationStatus === "skipped" ? (
							<Badge
								variant="secondary"
								className="border border-amber-200 bg-amber-50 text-amber-700"
							>
								Notification {bug.notificationStatus.toLowerCase()}
							</Badge>
						) : null}
					</div>
					<p className="m-0 font-medium leading-snug text-foreground group-hover:text-primary">
						{bug.title}
					</p>
					<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
						<span className="inline-flex items-center gap-1">
							<Hash className="size-3" />
							{bug.occurrenceCount} occurrence
							{bug.occurrenceCount !== 1 ? "s" : ""}
						</span>
						<span>First seen {formatTimestamp(bug.firstSeen)}</span>
						<span>Last seen {formatTimestamp(bug.lastSeen)}</span>
					</div>
				</div>
				<ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
			</div>
		</Link>
	);
}

function SignalPill({
	icon: Icon,
	label,
	value,
}: {
	icon: typeof Bug;
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

function EmptyPanel({
	icon: Icon,
	title,
	description,
}: {
	icon: typeof Inbox;
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
	tone: BugTone;
	children: React.ReactNode;
}) {
	return (
		<Badge className={getToneBadgeClass(tone)} variant="secondary">
			{children}
		</Badge>
	);
}

function BugListSkeleton() {
	return (
		<main className="page-wrap space-y-6 px-4 pb-16 pt-10">
			<Card className="hero-panel overflow-hidden border-none">
				<CardHeader className="space-y-5">
					<div className="flex gap-2">
						<Skeleton className="h-6 w-40 rounded-full bg-white/16" />
						<Skeleton className="h-6 w-24 rounded-full bg-white/16" />
					</div>
					<div className="space-y-3">
						<Skeleton className="h-10 w-full max-w-2xl bg-white/16" />
						<Skeleton className="h-5 w-full max-w-xl bg-white/14" />
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid gap-3 sm:grid-cols-3">
						{[0, 1, 2].map((item) => (
							<Skeleton
								key={item}
								className="h-24 rounded-2xl bg-white/14"
							/>
						))}
					</div>
				</CardContent>
			</Card>

			<Card className="surface panel-border">
				<CardHeader className="space-y-3">
					<Skeleton className="h-6 w-40 rounded-full" />
					<Skeleton className="h-8 w-48" />
					<Skeleton className="h-5 w-full max-w-sm" />
				</CardHeader>
				<CardContent className="space-y-4">
					{[0, 1, 2, 3].map((item) => (
						<Skeleton key={item} className="h-28 rounded-2xl" />
					))}
				</CardContent>
			</Card>
		</main>
	);
}

function formatTimestamp(value: string): string {
	if (value === "—") {
		return value;
	}

	try {
		const date = new Date(value);

		if (Number.isNaN(date.getTime())) {
			return value;
		}

		return date.toLocaleString("en-GB", {
			day: "2-digit",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		});
	} catch {
		return value;
	}
}

function getInitialState(mode: SearchMode) {
	if (mode === "empty") {
		return {
			kind: "ready" as const,
			data: emptyBugList,
			source: "empty" as const,
		};
	}

	if (mode === "snapshot") {
		return {
			kind: "ready" as const,
			data: snapshotBugList,
			source: "snapshot" as const,
		};
	}

	return { kind: "loading" as const };
}

function getToneBadgeClass(tone: BugTone) {
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
