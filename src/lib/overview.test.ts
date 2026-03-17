import { describe, expect, it } from "vitest";
import {
	applyNewBugsMetric,
	normalizeOverviewPayload,
	snapshotOverview,
} from "#/lib/overview";

describe("normalizeOverviewPayload", () => {
	it("falls back to the snapshot copy when top-level fields are missing", () => {
		const payload = normalizeOverviewPayload({
			metrics: [],
			queues: [],
			activity: [],
			watchlist: [],
			coverage: [],
		});

		expect(payload).toMatchObject({
			title: snapshotOverview.title,
			summary: snapshotOverview.summary,
			shiftLabel: snapshotOverview.shiftLabel,
			metrics: [],
			queues: [],
			activity: [],
			watchlist: [],
			coverage: [],
		});
	});

	it("normalizes live data when the payload matches the overview contract", () => {
		const payload = normalizeOverviewPayload({
			title: "Live board",
			summary: "Realtime signal",
			shiftLabel: "Weekend shift",
			snapshotTakenAt: "16:02",
			metrics: [
				{
					label: "New reports today",
					value: "9",
					change: "+3 in the last hour",
					note: "Fresh intake remains manageable.",
					tone: "warn",
				},
			],
			queues: [
				{
					name: "Intake",
					count: 2,
					note: "Fresh reports waiting for triage.",
					tone: "warn",
				},
			],
			activity: [
				{
					id: "a1",
					title: "New incident grouped",
					detail: "Three reports were merged together.",
					time: "2m ago",
					actor: "Rule engine",
					tone: "critical",
				},
			],
			watchlist: [
				{
					id: "w1",
					title: "Checkout errors",
					status: "Investigating",
					severity: "P1",
					owner: "Nia",
					nextStep: "Review the last deploy diff.",
					tone: "critical",
				},
			],
			coverage: [
				{
					label: "On-call coverage",
					value: "2 operators online",
					note: "Coverage is healthy.",
				},
			],
		});

		expect(payload).toEqual({
			title: "Live board",
			summary: "Realtime signal",
			shiftLabel: "Weekend shift",
			snapshotTakenAt: "16:02",
			metrics: [
				{
					label: "New reports today",
					value: "9",
					change: "+3 in the last hour",
					note: "Fresh intake remains manageable.",
					tone: "warn",
				},
			],
			queues: [
				{
					name: "Intake",
					count: 2,
					note: "Fresh reports waiting for triage.",
					tone: "warn",
				},
			],
			activity: [
				{
					id: "a1",
					title: "New incident grouped",
					detail: "Three reports were merged together.",
					time: "2m ago",
					actor: "Rule engine",
					tone: "critical",
				},
			],
			watchlist: [
				{
					id: "w1",
					title: "Checkout errors",
					status: "Investigating",
					severity: "P1",
					owner: "Nia",
					nextStep: "Review the last deploy diff.",
					tone: "critical",
				},
			],
			coverage: [
				{
					label: "On-call coverage",
					value: "2 operators online",
					note: "Coverage is healthy.",
				},
			],
		});
	});

	it("returns null for non-object payloads", () => {
		expect(normalizeOverviewPayload(null)).toBeNull();
		expect(normalizeOverviewPayload("invalid")).toBeNull();
	});
});

describe("applyNewBugsMetric", () => {
	it("derives the first overview metric from bug first-seen timestamps", () => {
		const data = applyNewBugsMetric(snapshotOverview, {
			title: "Bug inbox",
			summary: "Live bugs",
			bugs: [
				{
					id: "bug-1",
					title: "Checkout crash",
					severity: "error",
					language: "ts",
					firstSeen: "2026-03-15T13:40:00Z",
					lastSeen: "2026-03-15T13:58:00Z",
					occurrenceCount: 10,
					ticketStatus: "open",
					ticketProvider: "jira",
					notificationStatus: "sent",
					tone: "critical",
				},
				{
					id: "bug-2",
					title: "Auth crash",
					severity: "error",
					language: "ts",
					firstSeen: "2026-03-15T12:20:00Z",
					lastSeen: "2026-03-15T13:55:00Z",
					occurrenceCount: 4,
					ticketStatus: "open",
					ticketProvider: "linear",
					notificationStatus: "sent",
					tone: "critical",
				},
				{
					id: "bug-3",
					title: "Older issue",
					severity: "warn",
					language: "go",
					firstSeen: "2026-03-14T21:00:00Z",
					lastSeen: "2026-03-15T11:00:00Z",
					occurrenceCount: 2,
					ticketStatus: "none",
					ticketProvider: "—",
					notificationStatus: "skipped",
					tone: "warn",
				},
			],
		});

		expect(data.metrics[0]).toEqual({
			label: "New bugs appeared today",
			value: "2",
			change: "+1 in the last hour",
			note: "Derived from the bug table using each bug's first-seen timestamp.",
			tone: "neutral",
		});
	});
});
