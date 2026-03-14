import { describe, expect, it } from "vitest";
import { normalizeOverviewPayload, snapshotOverview } from "#/lib/overview";

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
