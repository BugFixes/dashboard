import { info, error as logError } from "bugfixes";
import type { BugListData, BugSummary } from "#/lib/bugs";
import { resolveBugList, snapshotBugList } from "#/lib/bugs";
import { env } from "#/lib/env";

export type OverviewTone = "good" | "warn" | "critical" | "neutral";
export type OverviewSource = "live" | "snapshot";

export type OverviewMetric = {
	label: string;
	value: string;
	change: string;
	note: string;
	tone: OverviewTone;
};

export type QueueLane = {
	name: string;
	count: number;
	note: string;
	tone: OverviewTone;
};

export type ActivityItem = {
	id: string;
	title: string;
	detail: string;
	time: string;
	actor: string;
	tone: OverviewTone;
};

export type WatchItem = {
	id: string;
	title: string;
	status: string;
	severity: string;
	owner: string;
	nextStep: string;
	tone: OverviewTone;
};

export type CoverageNote = {
	label: string;
	value: string;
	note: string;
};

export type OverviewData = {
	title: string;
	summary: string;
	shiftLabel: string;
	snapshotTakenAt: string;
	metrics: OverviewMetric[];
	queues: QueueLane[];
	activity: ActivityItem[];
	watchlist: WatchItem[];
	coverage: CoverageNote[];
};

export const snapshotOverview: OverviewData = {
	title: "Bugfixes workspace dashboard",
	summary:
		"Configure organizations, manage agents, and watch bug intake from one admin surface while the downstream workflows fill in behind it.",
	shiftLabel: "Admin shift - Sat 14 Mar",
	snapshotTakenAt: "14:18",
	metrics: [
		{
			label: "New bugs appeared today",
			value: "42",
			change: "+8 in the last hour",
			note: "Fresh intake is heaviest around checkout, auth recovery, and mobile session refresh.",
			tone: "warn",
		},
		{
			label: "Tickets created today",
			value: "11",
			change: "3 still syncing",
			note: "Ticket creation is flowing, but a small set still needs provider confirmation.",
			tone: "good",
		},
		{
			label: "Notification retries",
			value: "4",
			change: "2 Slack, 2 email",
			note: "Outbound alerts are mostly healthy, with a narrow retry cluster around workspace permissions.",
			tone: "critical",
		},
		{
			label: "Organizations ready",
			value: "6",
			change: "1 pending credentials",
			note: "Most organizations are live, but one tenant still needs provider configuration before agents can publish safely.",
			tone: "good",
		},
	],
	queues: [
		{
			name: "Needs triage",
			count: 12,
			note: "Bug clusters and fresh stacktraces waiting for the first triage pass.",
			tone: "warn",
		},
		{
			name: "Ticket sync",
			count: 3,
			note: "Bug records that already crossed into ticket creation but have not fully synced yet.",
			tone: "neutral",
		},
		{
			name: "Agent attention",
			count: 2,
			note: "Agents with stale heartbeats or pending credential rotation.",
			tone: "critical",
		},
		{
			name: "Notification retries",
			count: 4,
			note: "Outbound alerts that need a resend or destination fix.",
			tone: "good",
		},
	],
	activity: [
		{
			id: "act-1",
			title: "Checkout crash signatures were deduplicated into BF-184",
			detail:
				"Auto-triage linked eight incoming stacktraces to deploy web-2026.03.14.2 and marked the cluster ready for ticket review.",
			time: "4m ago",
			actor: "Rule engine",
			tone: "critical",
		},
		{
			id: "act-2",
			title: "A new production agent was issued for Acme EU",
			detail:
				"Operations created the agent, attached it to the organization environment, and the dashboard recorded the mapping for later audits.",
			time: "11m ago",
			actor: "Admin",
			tone: "warn",
		},
		{
			id: "act-3",
			title: "Zendesk ticket sync recovered after provider re-auth",
			detail:
				"Three queued bugs were pushed into the ticket system once the organization credentials were refreshed.",
			time: "23m ago",
			actor: "Ticket sync",
			tone: "good",
		},
		{
			id: "act-4",
			title: "Slack digest retried after a channel permission failure",
			detail:
				"The notification worker resent the digest and cleared one of the remaining retry items from the board.",
			time: "41m ago",
			actor: "Notifier",
			tone: "neutral",
		},
	],
	watchlist: [
		{
			id: "watch-1",
			title: "Acme checkout cluster needs a ticket owner",
			status: "Needs ticket",
			severity: "P1",
			owner: "Unassigned",
			nextStep:
				"Confirm the provider project and create the external ticket from the deduplicated bug record.",
			tone: "critical",
		},
		{
			id: "watch-2",
			title: "Northwind mobile agent has not checked in for 47 minutes",
			status: "Agent stale",
			severity: "P2",
			owner: "Marcus",
			nextStep:
				"Verify whether the credential rotation completed and confirm the device build still publishes events.",
			tone: "warn",
		},
		{
			id: "watch-3",
			title: "Digest delivery for Chewed Feed is retrying on email auth",
			status: "Notification retry",
			severity: "P3",
			owner: "Ava",
			nextStep:
				"Re-authorize the provider and re-send the queued organization digest once the destination is healthy.",
			tone: "good",
		},
	],
	coverage: [
		{
			label: "Organizations awaiting setup",
			value: "1 tenant pending credentials",
			note: "The shell is ready for organization configuration work even before every provider form lands.",
		},
		{
			label: "Agent posture",
			value: "14 agents active",
			note: "One agent is stale and two are scheduled for credential rotation before the next shift handoff.",
		},
		{
			label: "Next admin review",
			value: "17:30 UTC",
			note: "The digest should cover stalled ticket syncs, notification retries, and any organization that is not fully configured.",
		},
	],
};

export const emptyOverview: OverviewData = {
	title: "Quiet admin board",
	summary:
		"No recent bug intake or admin activity has landed yet. The overview stays useful so the first organization, agent, or stacktrace event has somewhere intentional to appear.",
	shiftLabel: "No active admin events",
	snapshotTakenAt: "Waiting for first event",
	metrics: [
		{
			label: "New bugs appeared today",
			value: "0",
			change: "No intake yet",
			note: "Fresh bug events will appear here once the first organization starts publishing.",
			tone: "good",
		},
		{
			label: "Tickets created today",
			value: "0",
			change: "No outbound sync",
			note: "No bug records have been promoted into tickets yet.",
			tone: "neutral",
		},
		{
			label: "Notification retries",
			value: "0",
			change: "Nothing retrying",
			note: "Notification delivery is clear right now.",
			tone: "good",
		},
		{
			label: "Organizations ready",
			value: "0",
			change: "No organizations yet",
			note: "Organization setup activity will appear here when onboarding starts.",
			tone: "neutral",
		},
	],
	queues: [],
	activity: [],
	watchlist: [],
	coverage: [],
};

export async function resolveOverviewData(
	clerkOrgId?: string | null,
	clerkUserId?: string | null,
	signal?: AbortSignal,
): Promise<{ data: OverviewData; source: OverviewSource }> {
	info("fetching overview data");
	try {
		const headers: Record<string, string> = {
			accept: "application/json",
		};
		if (clerkOrgId) {
			headers["X-Clerk-Org-Id"] = clerkOrgId;
		}
		if (clerkUserId) {
			headers["X-Clerk-User-Id"] = clerkUserId;
		}

		const [response, bugResult] = await Promise.all([
			fetch(new URL("/api/dashboard/overview", env.daphneUrl), {
				headers,
				signal,
			}),
			resolveBugList(clerkOrgId, clerkUserId, signal).catch(() => ({
				data: snapshotBugList,
				source: "snapshot" as const,
			})),
		]);

		if (!response.ok) {
			return {
				data: applyNewBugsMetric(snapshotOverview, bugResult.data),
				source: "snapshot",
			};
		}

		const payload = normalizeOverviewPayload(await response.json());

		if (!payload) {
			return {
				data: applyNewBugsMetric(snapshotOverview, bugResult.data),
				source: "snapshot",
			};
		}

		return {
			data: applyNewBugsMetric(payload, bugResult.data),
			source: "live",
		};
	} catch (err) {
		if (err instanceof Error && err.name === "AbortError") {
			throw err;
		}

		logError("failed to fetch overview data", err);
		return {
			data: applyNewBugsMetric(snapshotOverview, snapshotBugList),
			source: "snapshot",
		};
	}
}

export function normalizeOverviewPayload(
	payload: unknown,
): OverviewData | null {
	if (!isRecord(payload)) {
		return null;
	}

	const metrics = readArray(payload.metrics, normalizeMetric);
	const queues = readArray(payload.queues, normalizeQueueLane);
	const activity = readArray(payload.activity, normalizeActivityItem);
	const watchlist = readArray(payload.watchlist, normalizeWatchItem);
	const coverage = readArray(payload.coverage, normalizeCoverageNote);

	return {
		title: readString(payload.title) ?? snapshotOverview.title,
		summary: readString(payload.summary) ?? snapshotOverview.summary,
		shiftLabel: readString(payload.shiftLabel) ?? snapshotOverview.shiftLabel,
		snapshotTakenAt:
			readString(payload.snapshotTakenAt) ?? snapshotOverview.snapshotTakenAt,
		metrics: metrics ?? snapshotOverview.metrics,
		queues: queues ?? snapshotOverview.queues,
		activity: activity ?? snapshotOverview.activity,
		watchlist: watchlist ?? snapshotOverview.watchlist,
		coverage: coverage ?? snapshotOverview.coverage,
	};
}

function normalizeMetric(value: unknown): OverviewMetric | null {
	if (!isRecord(value)) {
		return null;
	}

	const label = readString(value.label);
	const metricValue = readString(value.value);
	const change = readString(value.change);
	const note = readString(value.note);

	if (!label || !metricValue || !change || !note) {
		return null;
	}

	return {
		label,
		value: metricValue,
		change,
		note,
		tone: readTone(value.tone),
	};
}

export function applyNewBugsMetric(
	data: OverviewData,
	bugData: BugListData,
): OverviewData {
	const metrics = [...data.metrics];
	const metric = buildNewBugsMetric(bugData.bugs);

	if (metrics.length === 0) {
		metrics.push(metric);
	} else {
		metrics[0] = metric;
	}

	return {
		...data,
		metrics,
	};
}

function buildNewBugsMetric(bugs: BugSummary[]): OverviewMetric {
	const timestamps = bugs
		.flatMap((bug) => [parseDate(bug.firstSeen), parseDate(bug.lastSeen)])
		.filter((value): value is Date => value !== null)
		.sort((a, b) => b.getTime() - a.getTime());
	const reference = timestamps[0] ?? new Date();
	const startOfDay = new Date(reference);
	startOfDay.setHours(0, 0, 0, 0);
	const hourAgo = new Date(reference.getTime() - 1000 * 60 * 60);

	const newToday = bugs.filter((bug) => {
		const firstSeen = parseDate(bug.firstSeen);
		return (
			firstSeen !== null && firstSeen >= startOfDay && firstSeen <= reference
		);
	});
	const lastHourCount = bugs.filter((bug) => {
		const firstSeen = parseDate(bug.firstSeen);
		return firstSeen !== null && firstSeen > hourAgo && firstSeen <= reference;
	}).length;

	return {
		label: "New bugs appeared today",
		value: String(newToday.length),
		change:
			newToday.length === 0
				? "No new bugs yet"
				: `+${lastHourCount} in the last hour`,
		note: "Derived from the bug table using each bug's first-seen timestamp.",
		tone:
			newToday.length === 0
				? "good"
				: newToday.length >= 8
					? "warn"
					: "neutral",
	};
}

function parseDate(value: string): Date | null {
	if (!value || value === "—") {
		return null;
	}

	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeQueueLane(value: unknown): QueueLane | null {
	if (!isRecord(value)) {
		return null;
	}

	const name = readString(value.name);
	const count = readNumber(value.count);
	const note = readString(value.note);

	if (!name || count === null || !note) {
		return null;
	}

	return {
		name,
		count,
		note,
		tone: readTone(value.tone),
	};
}

function normalizeActivityItem(value: unknown): ActivityItem | null {
	if (!isRecord(value)) {
		return null;
	}

	const id = readString(value.id);
	const title = readString(value.title);
	const detail = readString(value.detail);
	const time = readString(value.time);
	const actor = readString(value.actor);

	if (!id || !title || !detail || !time || !actor) {
		return null;
	}

	return {
		id,
		title,
		detail,
		time,
		actor,
		tone: readTone(value.tone),
	};
}

function normalizeWatchItem(value: unknown): WatchItem | null {
	if (!isRecord(value)) {
		return null;
	}

	const id = readString(value.id);
	const title = readString(value.title);
	const status = readString(value.status);
	const severity = readString(value.severity);
	const owner = readString(value.owner);
	const nextStep = readString(value.nextStep);

	if (!id || !title || !status || !severity || !owner || !nextStep) {
		return null;
	}

	return {
		id,
		title,
		status,
		severity,
		owner,
		nextStep,
		tone: readTone(value.tone),
	};
}

function normalizeCoverageNote(value: unknown): CoverageNote | null {
	if (!isRecord(value)) {
		return null;
	}

	const label = readString(value.label);
	const noteValue = readString(value.value);
	const note = readString(value.note);

	if (!label || !noteValue || !note) {
		return null;
	}

	return {
		label,
		value: noteValue,
		note,
	};
}

function readArray<T>(
	value: unknown,
	mapItem: (item: unknown) => T | null,
): T[] | null {
	if (value === undefined) {
		return null;
	}

	if (!Array.isArray(value)) {
		return null;
	}

	return value.map(mapItem).filter((item): item is T => item !== null);
}

function readTone(value: unknown): OverviewTone {
	return value === "good" ||
		value === "warn" ||
		value === "critical" ||
		value === "neutral"
		? value
		: "neutral";
}

function readString(value: unknown): string | null {
	return typeof value === "string" && value.trim().length > 0
		? value.trim()
		: null;
}

function readNumber(value: unknown): number | null {
	return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}
