import { Link, createFileRoute } from "@tanstack/react-router";
import {
	ArrowLeft,
	Bell,
	Clock,
	ExternalLink,
	FileCode2,
	Hash,
	Inbox,
	Layers,
	Server,
	Ticket,
} from "lucide-react";
import { useOrganization } from "@clerk/react";
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
import {
	type BugDetail,
	type BugNotification,
	type BugNotificationEvent,
	type BugOccurrence,
	type BugSource,
	type BugTicket,
	type BugTone,
	resolveBugDetail,
} from "#/lib/bugs";

export const Route = createFileRoute("/_dashboard/bugs/$bugId")({
	component: BugDetailRoute,
});

function BugDetailRoute() {
	const { bugId } = Route.useParams();
	const { organization } = useOrganization();
	const clerkOrgId = organization?.id ?? null;
	const [screenState, setScreenState] = useState<
		| { kind: "loading" }
		| { kind: "ready"; data: BugDetail | null; source: BugSource }
	>({ kind: "loading" });

	useEffect(() => {
		const abortController = new AbortController();

		startTransition(() => {
			setScreenState({ kind: "loading" });
		});

		void resolveBugDetail(bugId, clerkOrgId, abortController.signal)
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
						data: null,
						source: "snapshot",
					});
				});
			});

		return () => abortController.abort();
	}, [bugId, clerkOrgId]);

	if (screenState.kind === "loading") {
		return <BugDetailSkeleton />;
	}

	if (!screenState.data) {
		return <BugNotFound bugId={bugId} />;
	}

	return <BugDetailScreen data={screenState.data} source={screenState.source} />;
}

function BugDetailScreen({
	data,
	source,
}: {
	data: BugDetail;
	source: BugSource;
}) {
	return (
		<main className="page-wrap space-y-6 px-4 pb-16 pt-10">
			<div className="flex items-center gap-3">
				<Button asChild variant="ghost" size="sm" className="gap-1.5">
					<Link to="/bugs">
						<ArrowLeft className="size-4" />
						Back to inbox
					</Link>
				</Button>
				<Badge
					variant="secondary"
					className={source === "live" ? "" : undefined}
				>
					{source === "live" ? "Live" : "Snapshot"}
				</Badge>
			</div>

			<Card className="hero-panel overflow-hidden border-none text-white">
				<CardHeader className="space-y-4">
					<div className="flex flex-wrap items-center gap-2">
						<ToneBadge tone={data.tone}>{data.severity}</ToneBadge>
						<Badge className="bg-white/14 text-white shadow-none">
							{data.language}
						</Badge>
						<Badge className="bg-white/10 text-white shadow-none">
							<Hash className="size-3" />
							{data.hash.length > 16 ? `${data.hash.slice(0, 16)}…` : data.hash}
						</Badge>
					</div>
					<CardTitle className="max-w-4xl font-display text-2xl leading-tight font-semibold tracking-tight sm:text-3xl">
						{data.title}
					</CardTitle>
					<div className="grid gap-3 sm:grid-cols-3">
						<MetaPill icon={Server} label="Account" value={data.account} />
						<MetaPill icon={Layers} label="Agent" value={data.agent} />
						<MetaPill
							icon={Hash}
							label="Occurrences"
							value={String(data.occurrenceCount)}
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-100/80">
						<span className="inline-flex items-center gap-1.5">
							<Clock className="size-3.5" />
							First seen {formatTimestamp(data.firstSeen)}
						</span>
						<span className="inline-flex items-center gap-1.5">
							<Clock className="size-3.5" />
							Last seen {formatTimestamp(data.lastSeen)}
						</span>
					</div>
				</CardContent>
			</Card>

			<section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
				<div className="space-y-6">
					<Card className="surface panel-border">
						<CardHeader className="space-y-3">
							<Badge variant="outline" className="w-fit">
								Latest stacktrace
							</Badge>
							<CardTitle className="text-xl">Raw stacktrace</CardTitle>
							<CardDescription>
								The most recent stacktrace received for this bug cluster.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<pre className="overflow-x-auto rounded-2xl border border-border/70 bg-slate-950 p-5 text-sm leading-6 text-slate-200">
								<code>{data.stacktrace}</code>
							</pre>
						</CardContent>
					</Card>

					{data.normalizedStacktrace ? (
						<Card className="surface panel-border">
							<CardHeader className="space-y-3">
								<Badge variant="outline" className="w-fit">
									Normalized
								</Badge>
								<CardTitle className="text-xl">
									Normalized stacktrace
								</CardTitle>
								<CardDescription>
									Stripped to application frames for deduplication matching.
									Hash: <code>{data.hash}</code>
								</CardDescription>
							</CardHeader>
							<CardContent>
								<pre className="overflow-x-auto rounded-2xl border border-border/70 bg-slate-950 p-5 text-sm leading-6 text-emerald-300">
									<code>{data.normalizedStacktrace}</code>
								</pre>
							</CardContent>
						</Card>
					) : null}
				</div>

				<div className="space-y-6">
					<Card className="surface panel-border">
						<CardHeader className="space-y-3">
							<div className="flex items-center gap-2">
								<Badge variant="outline">Occurrence history</Badge>
								<Badge variant="secondary">
									{data.occurrences.length} recorded
								</Badge>
							</div>
							<CardTitle className="text-xl">Repeat occurrences</CardTitle>
							<CardDescription>
								Each time this stacktrace hash was seen, with environment and
								service context.
							</CardDescription>
						</CardHeader>
						<CardContent>
							{data.occurrences.length > 0 ? (
								<div className="space-y-3">
									{data.occurrences.map((occ, index) => (
										<div key={occ.id} className="space-y-3">
											{index > 0 ? <Separator /> : null}
											<OccurrenceRow occurrence={occ} isLatest={index === 0} />
										</div>
									))}
								</div>
							) : (
								<EmptyPanel
									icon={Inbox}
									title="No occurrences recorded"
									description="Occurrence history will appear here as the same stacktrace hash is seen across environments."
								/>
							)}
						</CardContent>
					</Card>

					<Card className="surface panel-border">
						<CardHeader className="space-y-3">
							<Badge variant="outline" className="w-fit">
								Linked tickets
							</Badge>
							<CardTitle className="text-xl">Ticket activity</CardTitle>
							<CardDescription>
								Tickets created from this bug record and their sync status.
							</CardDescription>
						</CardHeader>
						<CardContent>
							{data.tickets.length > 0 ? (
								<div className="space-y-3">
									{data.tickets.map((ticket, index) => (
										<div key={ticket.id} className="space-y-3">
											{index > 0 ? <Separator /> : null}
											<TicketRow ticket={ticket} />
										</div>
									))}
								</div>
							) : (
								<EmptyPanel
									icon={Ticket}
									title="No linked tickets"
									description="No ticket has been created from this bug record yet. Ticket creation will surface here once the workflow runs."
								/>
							)}
						</CardContent>
					</Card>

					<Card className="surface panel-border">
						<CardHeader className="space-y-3">
							<Badge variant="outline" className="w-fit">
								Notifications
							</Badge>
							<CardTitle className="text-xl">
								Notification activity
							</CardTitle>
							<CardDescription>
								Outbound alerts triggered by this bug and their delivery status.
							</CardDescription>
						</CardHeader>
						<CardContent>
							{data.notifications.length > 0 || data.notificationEvents.length > 0 ? (
								<div className="space-y-3">
									{data.notifications.map((ntf, index) => (
										<div key={ntf.id} className="space-y-3">
											{index > 0 ? <Separator /> : null}
											<NotificationRow notification={ntf} />
										</div>
									))}
									{data.notifications.length > 0 && data.notificationEvents.length > 0 ? <Separator /> : null}
									{data.notificationEvents.map((evt, index) => (
										<div key={evt.id} className="space-y-3">
											{index > 0 ? <Separator /> : null}
											<NotificationEventRow event={evt} />
										</div>
									))}
								</div>
							) : (
								<EmptyPanel
									icon={Bell}
									title="No notifications sent"
									description="Notification delivery records will appear here once alerts are triggered for this bug."
								/>
							)}
						</CardContent>
					</Card>
				</div>
			</section>
		</main>
	);
}

function OccurrenceRow({
	occurrence,
	isLatest,
}: {
	occurrence: BugOccurrence;
	isLatest: boolean;
}) {
	return (
		<div className="rounded-2xl border border-border/70 bg-background/75 p-4">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<span className="text-sm font-medium text-foreground">
						{formatTimestamp(occurrence.timestamp)}
					</span>
					{isLatest ? (
						<Badge variant="secondary" className="text-xs">
							Latest
						</Badge>
					) : null}
				</div>
				<div className="flex items-center gap-2">
					<SeverityBadge severity={occurrence.severity} />
					{occurrence.environment !== "—" ? (
						<Badge variant="outline">{occurrence.environment}</Badge>
					) : null}
				</div>
			</div>
			<div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
				{occurrence.service !== "—" ? (
					<span className="inline-flex items-center gap-1">
						<Layers className="size-3" />
						{occurrence.service}
					</span>
				) : null}
				{occurrence.agent !== "—" ? (
					<span className="inline-flex items-center gap-1">
						<Server className="size-3" />
						{occurrence.agent}
					</span>
				) : null}
			</div>
		</div>
	);
}

function TicketRow({ ticket }: { ticket: BugTicket }) {
	return (
		<div className="rounded-2xl border border-border/70 bg-background/75 p-4">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<Badge variant="secondary">{ticket.provider}</Badge>
					<span className="text-sm font-medium text-foreground">
						{ticket.remoteId}
					</span>
					{ticket.priority !== "—" ? (
						<PriorityBadge priority={ticket.priority} />
					) : null}
				</div>
				<TicketStatusBadge status={ticket.status} />
			</div>
			<div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
				<span>Created {formatTimestamp(ticket.createdAt)}</span>
				{ticket.remoteUrl !== "#" ? (
					<a
						href={ticket.remoteUrl}
						target="_blank"
						rel="noreferrer"
						className="inline-flex items-center gap-1 text-primary hover:underline"
					>
						Open in {ticket.provider}
						<ExternalLink className="size-3" />
					</a>
				) : null}
			</div>
		</div>
	);
}

function NotificationRow({
	notification,
}: {
	notification: BugNotification;
}) {
	return (
		<div className="rounded-2xl border border-border/70 bg-background/75 p-4">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<Badge variant="secondary">{notification.provider}</Badge>
				<span className="text-xs text-muted-foreground">
					{formatTimestamp(notification.sentAt)}
				</span>
			</div>
			<p className="mt-2 text-sm text-foreground">
				{notification.message}
			</p>
		</div>
	);
}

function NotificationEventRow({
	event,
}: {
	event: BugNotificationEvent;
}) {
	return (
		<div className="rounded-2xl border border-border/70 bg-background/75 p-4">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<Badge variant="secondary">{event.provider}</Badge>
					<Badge
						variant="secondary"
						className={
							event.status === "sent"
								? "border border-emerald-200 bg-emerald-50 text-emerald-700"
								: ""
						}
					>
						{event.status}
					</Badge>
				</div>
				<span className="text-xs text-muted-foreground">
					{formatTimestamp(event.occurredAt)}
				</span>
			</div>
			<p className="mt-2 text-xs text-muted-foreground">
				{event.reason}
			</p>
		</div>
	);
}

function MetaPill({
	icon: Icon,
	label,
	value,
}: {
	icon: typeof Server;
	label: string;
	value: string;
}) {
	return (
		<div className="rounded-2xl border border-white/12 bg-black/16 px-4 py-3">
			<div className="flex items-center gap-2 text-slate-100/78">
				<Icon className="size-3.5" />
				<span className="text-xs">{label}</span>
			</div>
			<p className="mt-1.5 text-sm font-medium text-white truncate">
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

function SeverityBadge({ severity }: { severity: string }) {
	const lower = severity.toLowerCase();

	if (lower === "fatal" || lower === "error") {
		return (
			<Badge className="border border-rose-200 bg-rose-50 text-rose-700" variant="secondary">
				{severity}
			</Badge>
		);
	}

	if (lower === "warn") {
		return (
			<Badge className="border border-amber-200 bg-amber-50 text-amber-700" variant="secondary">
				{severity}
			</Badge>
		);
	}

	return <Badge variant="outline">{severity}</Badge>;
}

function PriorityBadge({ priority }: { priority: string }) {
	const lower = priority.toLowerCase();

	if (lower === "critical") {
		return (
			<Badge className="border border-rose-200 bg-rose-50 text-rose-700" variant="secondary">
				{priority}
			</Badge>
		);
	}

	if (lower === "high") {
		return (
			<Badge className="border border-amber-200 bg-amber-50 text-amber-700" variant="secondary">
				{priority}
			</Badge>
		);
	}

	return <Badge variant="outline">{priority}</Badge>;
}

function TicketStatusBadge({ status }: { status: string }) {
	const lower = status.toLowerCase();

	if (lower === "resolved" || lower === "closed") {
		return (
			<Badge className="border border-emerald-200 bg-emerald-50 text-emerald-700" variant="secondary">
				{status}
			</Badge>
		);
	}

	if (lower.includes("pending") || lower.includes("sync")) {
		return (
			<Badge className="border border-amber-200 bg-amber-50 text-amber-700" variant="secondary">
				{status}
			</Badge>
		);
	}

	return <Badge variant="outline">{status}</Badge>;
}

function BugNotFound({ bugId }: { bugId: string }) {
	return (
		<main className="page-wrap space-y-6 px-4 pb-16 pt-10">
			<Button asChild variant="ghost" size="sm" className="gap-1.5">
				<Link to="/bugs">
					<ArrowLeft className="size-4" />
					Back to inbox
				</Link>
			</Button>
			<Card className="surface panel-border">
				<CardContent className="py-8">
					<EmptyPanel
						icon={FileCode2}
						title="Bug not found"
						description={`No bug record was found for "${bugId}". It may have been removed or the ID is incorrect.`}
					/>
				</CardContent>
			</Card>
		</main>
	);
}

function BugDetailSkeleton() {
	return (
		<main className="page-wrap space-y-6 px-4 pb-16 pt-10">
			<Skeleton className="h-8 w-36 rounded-lg" />

			<Card className="hero-panel overflow-hidden border-none">
				<CardHeader className="space-y-4">
					<div className="flex gap-2">
						<Skeleton className="h-6 w-16 rounded-full bg-white/16" />
						<Skeleton className="h-6 w-24 rounded-full bg-white/16" />
						<Skeleton className="h-6 w-32 rounded-full bg-white/16" />
					</div>
					<Skeleton className="h-10 w-full max-w-3xl bg-white/16" />
					<div className="grid gap-3 sm:grid-cols-3">
						{[0, 1, 2].map((item) => (
							<Skeleton key={item} className="h-20 rounded-2xl bg-white/14" />
						))}
					</div>
				</CardHeader>
				<CardContent>
					<Skeleton className="h-5 w-64 bg-white/14" />
				</CardContent>
			</Card>

			<section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
				<div className="space-y-6">
					<Card className="surface panel-border">
						<CardHeader className="space-y-3">
							<Skeleton className="h-6 w-36 rounded-full" />
							<Skeleton className="h-7 w-44" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-64 rounded-2xl" />
						</CardContent>
					</Card>
					<Card className="surface panel-border">
						<CardHeader className="space-y-3">
							<Skeleton className="h-6 w-28 rounded-full" />
							<Skeleton className="h-7 w-52" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-40 rounded-2xl" />
						</CardContent>
					</Card>
				</div>
				<div className="space-y-6">
					{[0, 1, 2].map((item) => (
						<Card key={item} className="surface panel-border">
							<CardHeader className="space-y-3">
								<Skeleton className="h-6 w-36 rounded-full" />
								<Skeleton className="h-7 w-44" />
							</CardHeader>
							<CardContent className="space-y-3">
								{[0, 1].map((row) => (
									<Skeleton key={row} className="h-20 rounded-2xl" />
								))}
							</CardContent>
						</Card>
					))}
				</div>
			</section>
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
