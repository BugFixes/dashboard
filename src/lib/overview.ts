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
	title: "Bugfixes command center",
	summary:
		"Keep first response, investigation, and ship-room work visible before every feature area has its own route.",
	shiftLabel: "Operator shift - Sat 14 Mar",
	snapshotTakenAt: "14:18",
	metrics: [
		{
			label: "New reports today",
			value: "18",
			change: "+6 since deploy",
			note: "Most fresh intake is clustered around checkout and identity.",
			tone: "warn",
		},
		{
			label: "Ready for verification",
			value: "7",
			change: "2 waiting on QA",
			note: "Fixes are staged and only need validation or product sign-off.",
			tone: "good",
		},
		{
			label: "Blocked investigations",
			value: "3",
			change: "Auth + payments",
			note: "These reports need vendor input or missing repro details.",
			tone: "critical",
		},
		{
			label: "Median intake age",
			value: "14m",
			change: "Target under 20m",
			note: "Fresh reports are still reaching first triage inside the target window.",
			tone: "good",
		},
	],
	queues: [
		{
			name: "Intake",
			count: 5,
			note: "Fresh reports waiting for first look and duplication checks.",
			tone: "warn",
		},
		{
			name: "Investigating",
			count: 9,
			note: "Engineers collecting repros, traces, and blast radius notes.",
			tone: "neutral",
		},
		{
			name: "Blocked",
			count: 3,
			note: "Need external confirmation, missing logs, or customer follow-up.",
			tone: "critical",
		},
		{
			name: "Ready to ship",
			count: 4,
			note: "Patches are merged and queued for verification or release.",
			tone: "good",
		},
	],
	activity: [
		{
			id: "act-1",
			title: "Checkout failures were grouped into BF-184",
			detail:
				"Auto-triage linked six incoming reports to deploy web-2026.03.14.2 and raised the issue to the ship room.",
			time: "4m ago",
			actor: "Rule engine",
			tone: "critical",
		},
		{
			id: "act-2",
			title: "Customer-facing repro steps landed for BF-177",
			detail:
				"Support attached a reliable Safari mobile repro, which moved the bug from intake to active investigation.",
			time: "11m ago",
			actor: "Support",
			tone: "warn",
		},
		{
			id: "act-3",
			title: "Auth token regression was verified in staging",
			detail:
				"QA marked the patched flow as stable after running the recovery and refresh-token paths.",
			time: "23m ago",
			actor: "Verification",
			tone: "good",
		},
		{
			id: "act-4",
			title: "Nightly digest posted to incident handoff",
			detail:
				"The queue summary was pushed to operators so the next shift sees blocked work and ship candidates immediately.",
			time: "41m ago",
			actor: "Ops bot",
			tone: "neutral",
		},
	],
	watchlist: [
		{
			id: "watch-1",
			title: "Stripe retries fail for some EU cards",
			status: "Investigating",
			severity: "P1",
			owner: "Nia",
			nextStep:
				"Replay the failing flow against the payment sandbox after config rollback.",
			tone: "critical",
		},
		{
			id: "watch-2",
			title: "iOS session refresh drops users into a login loop",
			status: "Fix merged",
			severity: "P2",
			owner: "Marcus",
			nextStep:
				"Verify on staging and release once the mobile smoke suite is green.",
			tone: "warn",
		},
		{
			id: "watch-3",
			title: "Digest email misses attachment previews",
			status: "Ready to ship",
			severity: "P3",
			owner: "Ava",
			nextStep: "Bundle with the noon release once regression checks finish.",
			tone: "good",
		},
	],
	coverage: [
		{
			label: "On-call coverage",
			value: "2 operators online",
			note: "Queue is staffed for intake and one concurrent ship-room escalation.",
		},
		{
			label: "Verification lane",
			value: "7 fixes queued",
			note: "QA is the current pinch point, so ready-to-ship work needs batching.",
		},
		{
			label: "Next handoff",
			value: "17:30 UTC",
			note: "Digest will include blocked issues, vendor waits, and anything still above the SLA band.",
		},
	],
};

export const emptyOverview: OverviewData = {
	title: "Quiet board",
	summary:
		"No new bug intake or operator activity has landed yet. The overview stays readable so the next incident has somewhere useful to appear.",
	shiftLabel: "No active incidents",
	snapshotTakenAt: "Waiting for first event",
	metrics: [
		{
			label: "New reports today",
			value: "0",
			change: "No intake yet",
			note: "Fresh customer reports will appear here once the first workflow event lands.",
			tone: "good",
		},
		{
			label: "Ready for verification",
			value: "0",
			change: "No queued fixes",
			note: "Verification load is clear right now.",
			tone: "neutral",
		},
		{
			label: "Blocked investigations",
			value: "0",
			change: "Nothing waiting",
			note: "No open investigations are stalled on external input.",
			tone: "good",
		},
		{
			label: "Median intake age",
			value: "0m",
			change: "No open intake",
			note: "The queue is empty, so there is no intake ageing to report.",
			tone: "neutral",
		},
	],
	queues: [],
	activity: [],
	watchlist: [],
	coverage: [],
};

export async function resolveOverviewData(
	signal?: AbortSignal,
): Promise<{ data: OverviewData; source: OverviewSource }> {
	try {
		const response = await fetch(
			new URL("/api/dashboard/overview", env.daphneUrl),
			{
				headers: {
					accept: "application/json",
				},
				signal,
			},
		);

		if (!response.ok) {
			return { data: snapshotOverview, source: "snapshot" };
		}

		const payload = normalizeOverviewPayload(await response.json());

		if (!payload) {
			return { data: snapshotOverview, source: "snapshot" };
		}

		return { data: payload, source: "live" };
	} catch (error) {
		if (error instanceof Error && error.name === "AbortError") {
			throw error;
		}

		return { data: snapshotOverview, source: "snapshot" };
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
