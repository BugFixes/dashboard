import { env } from "#/lib/env";

export type BugTone = "good" | "warn" | "critical" | "neutral";
export type BugSource = "live" | "snapshot";

export type BugSummary = {
	id: string;
	title: string;
	severity: string;
	language: string;
	firstSeen: string;
	lastSeen: string;
	occurrenceCount: number;
	ticketStatus: string;
	ticketProvider: string;
	notificationStatus: string;
	tone: BugTone;
};

export type BugOccurrence = {
	id: string;
	timestamp: string;
	severity: string;
	environment: string;
	service: string;
	agent: string;
};

export type BugTicket = {
	id: string;
	provider: string;
	remoteId: string;
	remoteUrl: string;
	priority: string;
	status: string;
	createdAt: string;
};

export type BugNotification = {
	id: string;
	provider: string;
	message: string;
	sentAt: string;
};

export type BugNotificationEvent = {
	id: string;
	provider: string;
	status: string;
	reason: string;
	severity: string;
	ticketAction: string;
	occurredAt: string;
};

export type BugDetail = {
	id: string;
	title: string;
	severity: string;
	language: string;
	firstSeen: string;
	lastSeen: string;
	occurrenceCount: number;
	tone: BugTone;
	stacktrace: string;
	normalizedStacktrace: string;
	hash: string;
	account: string;
	agent: string;
	occurrences: BugOccurrence[];
	tickets: BugTicket[];
	notifications: BugNotification[];
	notificationEvents: BugNotificationEvent[];
};

export type BugListData = {
	title: string;
	summary: string;
	bugs: BugSummary[];
};

export const snapshotBugList: BugListData = {
	title: "Bug inbox",
	summary:
		"Incoming stacktraces, deduplication clusters, and investigation entrypoints for the operator shift.",
	bugs: [
		{
			id: "0ecb8ffe-9be6-4f2a-8329-3febc7b824ed",
			title: "NullPointerException in CheckoutService.processPayment",
			severity: "error",
			language: "java",
			firstSeen: "2026-03-14T08:12:00+00:00",
			lastSeen: "2026-03-15T13:47:00+00:00",
			occurrenceCount: 47,
			ticketStatus: "open",
			ticketProvider: "jira",
			notificationStatus: "sent",
			tone: "critical",
		},
		{
			id: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
			title: "TypeError: Cannot read property 'userId' of undefined",
			severity: "error",
			language: "typescript",
			firstSeen: "2026-03-15T06:31:00+00:00",
			lastSeen: "2026-03-15T14:02:00+00:00",
			occurrenceCount: 23,
			ticketStatus: "open",
			ticketProvider: "linear",
			notificationStatus: "sent",
			tone: "critical",
		},
		{
			id: "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
			title: "IndexError: list index out of range in batch_processor",
			severity: "error",
			language: "python",
			firstSeen: "2026-03-13T19:45:00+00:00",
			lastSeen: "2026-03-15T11:18:00+00:00",
			occurrenceCount: 12,
			ticketStatus: "open",
			ticketProvider: "jira",
			notificationStatus: "sent",
			tone: "warn",
		},
		{
			id: "3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
			title: "panic: runtime error: index out of range [3] with length 2",
			severity: "warn",
			language: "go",
			firstSeen: "2026-03-14T14:22:00+00:00",
			lastSeen: "2026-03-15T09:55:00+00:00",
			occurrenceCount: 8,
			ticketStatus: "none",
			ticketProvider: "—",
			notificationStatus: "skipped",
			tone: "warn",
		},
		{
			id: "4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a",
			title: "ActiveRecord::RecordNotFound in AccountsController#show",
			severity: "warn",
			language: "ruby",
			firstSeen: "2026-03-12T11:08:00+00:00",
			lastSeen: "2026-03-14T22:34:00+00:00",
			occurrenceCount: 5,
			ticketStatus: "closed",
			ticketProvider: "github",
			notificationStatus: "sent",
			tone: "good",
		},
		{
			id: "5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
			title: "SIGSEGV in image_resize_worker thread pool",
			severity: "fatal",
			language: "rust",
			firstSeen: "2026-03-15T12:00:00+00:00",
			lastSeen: "2026-03-15T13:58:00+00:00",
			occurrenceCount: 3,
			ticketStatus: "none",
			ticketProvider: "—",
			notificationStatus: "skipped",
			tone: "critical",
		},
	],
};

export const emptyBugList: BugListData = {
	title: "Bug inbox",
	summary:
		"No bug reports have been received yet. Stacktraces will appear here once the first agent starts publishing.",
	bugs: [],
};

const snapshotBugDetails: Record<string, BugDetail> = {
	"0ecb8ffe-9be6-4f2a-8329-3febc7b824ed": {
		id: "0ecb8ffe-9be6-4f2a-8329-3febc7b824ed",
		title: "NullPointerException in CheckoutService.processPayment",
		severity: "error",
		language: "java",
		firstSeen: "2026-03-14T08:12:00+00:00",
		lastSeen: "2026-03-15T13:47:00+00:00",
		occurrenceCount: 47,
		tone: "critical",
		account: "Acme Corp",
		agent: "web-prod-eu-1",
		hash: "a4f8c91d2e7b3f60e1842d9c5a7b6f83024e91d7c8a5b3f2e6d4c0a1b9e8f7d2",
		stacktrace:
			'java.lang.NullPointerException: Cannot invoke "com.acme.model.Cart.getItems()" because "cart" is null\n    at com.acme.service.CheckoutService.processPayment(CheckoutService.java:142)\n    at com.acme.service.CheckoutService.checkout(CheckoutService.java:87)\n    at com.acme.controller.CheckoutController.submit(CheckoutController.java:63)\n    at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)\n    at org.springframework.web.servlet.FrameworkServlet.service(FrameworkServlet.java:897)\n    at javax.servlet.http.HttpServlet.service(HttpServlet.java:750)\n    at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:231)\n    at org.apache.catalina.core.StandardWrapperValve.invoke(StandardWrapperValve.java:213)',
		normalizedStacktrace:
			"NullPointerException\n    CheckoutService.processPayment:142\n    CheckoutService.checkout:87\n    CheckoutController.submit:63\n    FrameworkServlet.service:897\n    HttpServlet.service:750",
		occurrences: [
			{
				id: "occ-1a",
				timestamp: "2026-03-15T13:47:00+00:00",
				severity: "error",
				environment: "production",
				service: "checkout-api",
				agent: "web-prod-eu-1",
			},
			{
				id: "occ-1b",
				timestamp: "2026-03-15T13:22:00+00:00",
				severity: "error",
				environment: "production",
				service: "checkout-api",
				agent: "web-prod-eu-2",
			},
			{
				id: "occ-1c",
				timestamp: "2026-03-15T12:58:00+00:00",
				severity: "error",
				environment: "production",
				service: "checkout-api",
				agent: "web-prod-us-1",
			},
			{
				id: "occ-1d",
				timestamp: "2026-03-15T11:14:00+00:00",
				severity: "error",
				environment: "production",
				service: "checkout-api",
				agent: "web-prod-eu-1",
			},
			{
				id: "occ-1e",
				timestamp: "2026-03-14T22:01:00+00:00",
				severity: "error",
				environment: "staging",
				service: "checkout-api",
				agent: "web-stg-eu-1",
			},
		],
		tickets: [
			{
				id: "tkt-1",
				provider: "jira",
				remoteId: "ACME-4821",
				remoteUrl: "#",
				priority: "critical",
				status: "open",
				createdAt: "2026-03-14T09:00:00+00:00",
			},
		],
		notifications: [
			{
				id: "ntf-1a",
				provider: "slack",
				message: "P1 bug detected in checkout",
				sentAt: "2026-03-14T08:15:00+00:00",
			},
			{
				id: "ntf-1b",
				provider: "resend",
				message: "Critical: CheckoutService NPE",
				sentAt: "2026-03-14T08:16:00+00:00",
			},
		],
		notificationEvents: [
			{
				id: "ne-1a",
				provider: "slack",
				status: "sent",
				reason: "severity >= error",
				severity: "error",
				ticketAction: "created",
				occurredAt: "2026-03-14T08:15:00+00:00",
			},
		],
	},
	"1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d": {
		id: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
		title: "TypeError: Cannot read property 'userId' of undefined",
		severity: "error",
		language: "typescript",
		firstSeen: "2026-03-15T06:31:00+00:00",
		lastSeen: "2026-03-15T14:02:00+00:00",
		occurrenceCount: 23,
		tone: "critical",
		account: "Northwind",
		agent: "api-prod-1",
		hash: "e7c3b82f1a49d5c6a0b3e8f2d1c7a4b9e6f3d0c8a5b2e9f7d4c1a0b8e5f3d2c9",
		stacktrace:
			"TypeError: Cannot read property 'userId' of undefined\n    at AuthMiddleware.validate (/app/src/middleware/auth.ts:34:22)\n    at AuthMiddleware.handle (/app/src/middleware/auth.ts:18:16)\n    at processTickByOrder (/app/node_modules/express/lib/router/index.js:284:7)\n    at next (/app/node_modules/express/lib/router/route.js:149:14)\n    at SessionParser.parse (/app/src/middleware/session.ts:47:5)\n    at Layer.handle (/app/node_modules/express/lib/router/layer.js:95:5)",
		normalizedStacktrace:
			"TypeError: Cannot read property 'userId' of undefined\n    AuthMiddleware.validate:34\n    AuthMiddleware.handle:18\n    SessionParser.parse:47",
		occurrences: [
			{
				id: "occ-2a",
				timestamp: "2026-03-15T14:02:00+00:00",
				severity: "error",
				environment: "production",
				service: "auth-service",
				agent: "api-prod-1",
			},
			{
				id: "occ-2b",
				timestamp: "2026-03-15T13:41:00+00:00",
				severity: "error",
				environment: "production",
				service: "auth-service",
				agent: "api-prod-2",
			},
			{
				id: "occ-2c",
				timestamp: "2026-03-15T12:05:00+00:00",
				severity: "error",
				environment: "production",
				service: "auth-service",
				agent: "api-prod-1",
			},
		],
		tickets: [
			{
				id: "tkt-2",
				provider: "linear",
				remoteId: "NW-312",
				remoteUrl: "#",
				priority: "high",
				status: "open",
				createdAt: "2026-03-15T06:45:00+00:00",
			},
		],
		notifications: [
			{
				id: "ntf-2a",
				provider: "slack",
				message: "Auth middleware crash in production",
				sentAt: "2026-03-15T06:33:00+00:00",
			},
		],
		notificationEvents: [
			{
				id: "ne-2a",
				provider: "slack",
				status: "sent",
				reason: "severity >= error",
				severity: "error",
				ticketAction: "created",
				occurredAt: "2026-03-15T06:33:00+00:00",
			},
		],
	},
	"2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e": {
		id: "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
		title: "IndexError: list index out of range in batch_processor",
		severity: "error",
		language: "python",
		firstSeen: "2026-03-13T19:45:00+00:00",
		lastSeen: "2026-03-15T11:18:00+00:00",
		occurrenceCount: 12,
		tone: "warn",
		account: "Chewed Feed",
		agent: "worker-prod-1",
		hash: "d1f5a07e3c82b9d4e6f0a1c3b5e7d9f2a4c6b8e0d2f4a6c8b0e2d4f6a8c0b2d4",
		stacktrace:
			'Traceback (most recent call last):\n  File "/app/workers/batch_processor.py", line 89, in process_batch\n    item = batch.items[batch.cursor]\nIndexError: list index out of range\n\nDuring handling of the above exception, another exception occurred:\n\nTraceback (most recent call last):\n  File "/app/workers/runner.py", line 34, in execute\n    processor.process_batch(batch)\n  File "/app/workers/batch_processor.py", line 92, in process_batch\n    self.handle_error(batch, e)\n  File "/app/workers/batch_processor.py", line 118, in handle_error\n    raise BatchProcessingError(f"Failed batch {batch.id}") from original',
		normalizedStacktrace:
			"IndexError: list index out of range\n    batch_processor.process_batch:89\n    runner.execute:34\n    batch_processor.handle_error:118",
		occurrences: [
			{
				id: "occ-3a",
				timestamp: "2026-03-15T11:18:00+00:00",
				severity: "error",
				environment: "production",
				service: "batch-worker",
				agent: "worker-prod-1",
			},
			{
				id: "occ-3b",
				timestamp: "2026-03-15T04:22:00+00:00",
				severity: "error",
				environment: "production",
				service: "batch-worker",
				agent: "worker-prod-2",
			},
		],
		tickets: [
			{
				id: "tkt-3",
				provider: "jira",
				remoteId: "CF-1192",
				remoteUrl: "#",
				priority: "medium",
				status: "open",
				createdAt: "2026-03-14T08:30:00+00:00",
			},
		],
		notifications: [
			{
				id: "ntf-3a",
				provider: "slack",
				message: "Batch processing failure",
				sentAt: "2026-03-13T19:48:00+00:00",
			},
			{
				id: "ntf-3b",
				provider: "resend",
				message: "IndexError in batch_processor",
				sentAt: "2026-03-13T19:48:00+00:00",
			},
		],
		notificationEvents: [
			{
				id: "ne-3a",
				provider: "slack",
				status: "sent",
				reason: "severity >= error",
				severity: "error",
				ticketAction: "created",
				occurredAt: "2026-03-13T19:48:00+00:00",
			},
		],
	},
	"3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f": {
		id: "3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
		title: "panic: runtime error: index out of range [3] with length 2",
		severity: "warn",
		language: "go",
		firstSeen: "2026-03-14T14:22:00+00:00",
		lastSeen: "2026-03-15T09:55:00+00:00",
		occurrenceCount: 8,
		tone: "warn",
		account: "Acme Corp",
		agent: "ingest-prod-1",
		hash: "b9e2c74d8f13a5b6c0d2e4f6a8c0b2d4e6f8a0c2b4d6e8f0a2c4b6d8e0f2a4c6",
		stacktrace:
			"goroutine 1 [running]:\nmain.(*EventIngester).processEvents(0xc000142000, {0xc000218000, 0x2, 0x2})\n\t/app/cmd/ingest/main.go:187 +0x3a5\nmain.(*EventIngester).handleBatch(0xc000142000, {0xc000228000, 0x3, 0x4})\n\t/app/cmd/ingest/main.go:142 +0x1bc\nmain.(*Server).ServeHTTP(0xc000138000, {0x7f4a2c1d88e0, 0xc0002a6000}, 0xc000284300)\n\t/app/cmd/ingest/server.go:58 +0x2af\nnet/http.serverHandler.ServeHTTP({0xc000138000}, {0x7f4a2c1d88e0, 0xc0002a6000}, 0xc000284300)\n\t/usr/local/go/src/net/http/server.go:2936 +0x316",
		normalizedStacktrace:
			"panic: index out of range [3] with length 2\n    EventIngester.processEvents:187\n    EventIngester.handleBatch:142\n    Server.ServeHTTP:58",
		occurrences: [
			{
				id: "occ-4a",
				timestamp: "2026-03-15T09:55:00+00:00",
				severity: "warn",
				environment: "production",
				service: "ingest",
				agent: "ingest-prod-1",
			},
			{
				id: "occ-4b",
				timestamp: "2026-03-14T21:30:00+00:00",
				severity: "warn",
				environment: "production",
				service: "ingest",
				agent: "ingest-prod-1",
			},
		],
		tickets: [],
		notifications: [],
		notificationEvents: [
			{
				id: "ne-4a",
				provider: "slack",
				status: "skipped",
				reason: "severity below threshold",
				severity: "warn",
				ticketAction: "skipped",
				occurredAt: "2026-03-14T14:22:00+00:00",
			},
		],
	},
	"4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a": {
		id: "4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a",
		title: "ActiveRecord::RecordNotFound in AccountsController#show",
		severity: "warn",
		language: "ruby",
		firstSeen: "2026-03-12T11:08:00+00:00",
		lastSeen: "2026-03-14T22:34:00+00:00",
		occurrenceCount: 5,
		tone: "good",
		account: "Northwind",
		agent: "rails-prod-1",
		hash: "f3a1d96b4e28c0d5e7f9a1b3c5d7e9f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2",
		stacktrace:
			"ActiveRecord::RecordNotFound (Couldn't find Account with 'id'=9847):\n  app/controllers/accounts_controller.rb:24:in `show'\n  app/middleware/tenant_resolver.rb:18:in `call'\n  actionpack (7.1.3) lib/action_dispatch/middleware/debug_exceptions.rb:69:in `call'\n  actionpack (7.1.3) lib/action_dispatch/middleware/show_exceptions.rb:32:in `call'\n  railties (7.1.3) lib/rails/rack/logger.rb:40:in `call_app'\n  railties (7.1.3) lib/rails/rack/logger.rb:26:in `call'",
		normalizedStacktrace:
			"ActiveRecord::RecordNotFound\n    AccountsController#show:24\n    TenantResolver#call:18",
		occurrences: [
			{
				id: "occ-5a",
				timestamp: "2026-03-14T22:34:00+00:00",
				severity: "warn",
				environment: "production",
				service: "rails-api",
				agent: "rails-prod-1",
			},
		],
		tickets: [
			{
				id: "tkt-5",
				provider: "github",
				remoteId: "NW-88412",
				remoteUrl: "#",
				priority: "low",
				status: "closed",
				createdAt: "2026-03-12T12:00:00+00:00",
			},
		],
		notifications: [
			{
				id: "ntf-5a",
				provider: "resend",
				message: "RecordNotFound in AccountsController",
				sentAt: "2026-03-12T11:10:00+00:00",
			},
		],
		notificationEvents: [
			{
				id: "ne-5a",
				provider: "resend",
				status: "sent",
				reason: "new bug created",
				severity: "warn",
				ticketAction: "created",
				occurredAt: "2026-03-12T11:10:00+00:00",
			},
		],
	},
	"5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b": {
		id: "5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
		title: "SIGSEGV in image_resize_worker thread pool",
		severity: "fatal",
		language: "rust",
		firstSeen: "2026-03-15T12:00:00+00:00",
		lastSeen: "2026-03-15T13:58:00+00:00",
		occurrenceCount: 3,
		tone: "critical",
		account: "Chewed Feed",
		agent: "media-prod-1",
		hash: "c8d4e2f7a195b3d6e0f2a4c6b8d0e2f4a6c8b0d2e4f6a8c0b2d4e6f8a0c2b4d6",
		stacktrace:
			"thread 'worker-3' panicked at 'index out of bounds: the len is 0 but the index is 0', src/resize/pool.rs:214:18\nstack backtrace:\n   0: std::panicking::begin_panic_handler\n   1: core::panicking::panic_fmt\n   2: core::panicking::panic_bounds_check\n   3: media_worker::resize::pool::ResizePool::process_job\n             at ./src/resize/pool.rs:214:18\n   4: media_worker::resize::pool::ResizePool::run_worker\n             at ./src/resize/pool.rs:147:13\n   5: media_worker::main::spawn_workers::{{closure}}\n             at ./src/main.rs:89:9\n   6: std::thread::Builder::spawn_unchecked_::{{closure}}\n             at /rustc/hash/library/std/src/thread/mod.rs:529:17",
		normalizedStacktrace:
			"SIGSEGV: index out of bounds\n    ResizePool::process_job:214\n    ResizePool::run_worker:147\n    spawn_workers:89",
		occurrences: [
			{
				id: "occ-6a",
				timestamp: "2026-03-15T13:58:00+00:00",
				severity: "fatal",
				environment: "production",
				service: "media-worker",
				agent: "media-prod-1",
			},
			{
				id: "occ-6b",
				timestamp: "2026-03-15T12:44:00+00:00",
				severity: "fatal",
				environment: "production",
				service: "media-worker",
				agent: "media-prod-1",
			},
			{
				id: "occ-6c",
				timestamp: "2026-03-15T12:00:00+00:00",
				severity: "fatal",
				environment: "staging",
				service: "media-worker",
				agent: "media-stg-1",
			},
		],
		tickets: [],
		notifications: [],
		notificationEvents: [
			{
				id: "ne-6a",
				provider: "slack",
				status: "skipped",
				reason: "no notification provider configured",
				severity: "fatal",
				ticketAction: "skipped",
				occurredAt: "2026-03-15T12:00:00+00:00",
			},
		],
	},
};

export async function resolveBugList(
	clerkOrgId?: string | null,
	clerkUserId?: string | null,
	signal?: AbortSignal,
): Promise<{ data: BugListData; source: BugSource }> {
	try {
		const headers: Record<string, string> = { accept: "application/json" };
		if (clerkOrgId) {
			headers["X-Clerk-Org-Id"] = clerkOrgId;
		}
		if (clerkUserId) {
			headers["X-Clerk-User-Id"] = clerkUserId;
		}
		const response = await fetch(
			new URL("/api/dashboard/bugs", env.daphneUrl),
			{ headers, signal },
		);

		if (!response.ok) {
			return { data: snapshotBugList, source: "snapshot" };
		}

		const payload = normalizeBugListPayload(await response.json());

		if (!payload) {
			return { data: snapshotBugList, source: "snapshot" };
		}

		return { data: payload, source: "live" };
	} catch (error) {
		if (error instanceof Error && error.name === "AbortError") {
			throw error;
		}

		return { data: snapshotBugList, source: "snapshot" };
	}
}

export async function resolveBugDetail(
	bugId: string,
	clerkOrgId?: string | null,
	clerkUserId?: string | null,
	signal?: AbortSignal,
): Promise<{ data: BugDetail | null; source: BugSource }> {
	try {
		const headers: Record<string, string> = { accept: "application/json" };
		if (clerkOrgId) {
			headers["X-Clerk-Org-Id"] = clerkOrgId;
		}
		if (clerkUserId) {
			headers["X-Clerk-User-Id"] = clerkUserId;
		}
		const response = await fetch(
			new URL(
				`/api/dashboard/bugs/${encodeURIComponent(bugId)}`,
				env.daphneUrl,
			),
			{ headers, signal },
		);

		if (!response.ok) {
			const snapshot = snapshotBugDetails[bugId] ?? null;
			return { data: snapshot, source: "snapshot" };
		}

		const payload = normalizeBugDetailPayload(await response.json());

		if (!payload) {
			const snapshot = snapshotBugDetails[bugId] ?? null;
			return { data: snapshot, source: "snapshot" };
		}

		return { data: payload, source: "live" };
	} catch (error) {
		if (error instanceof Error && error.name === "AbortError") {
			throw error;
		}

		const snapshot = snapshotBugDetails[bugId] ?? null;
		return { data: snapshot, source: "snapshot" };
	}
}

function normalizeBugListPayload(payload: unknown): BugListData | null {
	if (!isRecord(payload)) {
		return null;
	}

	const bugs = readArray(payload.bugs, normalizeBugSummary);

	return {
		title: readString(payload.title) ?? snapshotBugList.title,
		summary: readString(payload.summary) ?? snapshotBugList.summary,
		bugs: bugs ?? snapshotBugList.bugs,
	};
}

function normalizeBugSummary(value: unknown): BugSummary | null {
	if (!isRecord(value)) {
		return null;
	}

	const id = readString(value.id);
	const title =
		readString(value.title) ??
		readString(value.normalized_stacktrace) ??
		readString(value.latest_stacktrace);

	if (!id || !title) {
		return null;
	}

	return {
		id,
		title,
		severity: readString(value.severity) ?? "—",
		language: readString(value.language) ?? "—",
		firstSeen:
			readString(value.first_seen_at) ?? readString(value.firstSeen) ?? "—",
		lastSeen:
			readString(value.last_seen_at) ?? readString(value.lastSeen) ?? "—",
		occurrenceCount:
			readNumber(value.occurrence_count) ??
			readNumber(value.occurrenceCount) ??
			0,
		ticketStatus:
			readString(value.ticket_status) ??
			readString(value.ticketStatus) ??
			"none",
		ticketProvider:
			readString(value.ticket_provider) ??
			readString(value.ticketProvider) ??
			"—",
		notificationStatus:
			readString(value.notification_status) ??
			readString(value.notificationStatus) ??
			"none",
		tone: readTone(value.tone),
	};
}

function normalizeBugDetailPayload(payload: unknown): BugDetail | null {
	if (!isRecord(payload)) {
		return null;
	}

	const id = readString(payload.id);
	const title =
		readString(payload.title) ??
		readString(payload.normalized_stacktrace) ??
		readString(payload.latest_stacktrace);
	const stacktrace =
		readString(payload.latest_stacktrace) ?? readString(payload.stacktrace);

	if (!id || !title || !stacktrace) {
		return null;
	}

	return {
		id,
		title,
		severity: readString(payload.severity) ?? "—",
		language: readString(payload.language) ?? "—",
		firstSeen:
			readString(payload.first_seen_at) ?? readString(payload.firstSeen) ?? "—",
		lastSeen:
			readString(payload.last_seen_at) ?? readString(payload.lastSeen) ?? "—",
		occurrenceCount:
			readNumber(payload.occurrence_count) ??
			readNumber(payload.occurrenceCount) ??
			0,
		tone: readTone(payload.tone),
		stacktrace,
		normalizedStacktrace:
			readString(payload.normalized_stacktrace) ??
			readString(payload.normalizedStacktrace) ??
			"",
		hash:
			readString(payload.stacktrace_hash) ?? readString(payload.hash) ?? "—",
		account:
			readString(payload.account_name) ?? readString(payload.account) ?? "—",
		agent: readString(payload.agent_name) ?? readString(payload.agent) ?? "—",
		occurrences: readArray(payload.occurrences, normalizeOccurrence) ?? [],
		tickets: readArray(payload.tickets, normalizeTicket) ?? [],
		notifications:
			readArray(payload.notifications, normalizeNotification) ?? [],
		notificationEvents:
			readArray(
				payload.notification_events ?? payload.notificationEvents,
				normalizeNotificationEvent,
			) ?? [],
	};
}

function normalizeOccurrence(value: unknown): BugOccurrence | null {
	if (!isRecord(value)) {
		return null;
	}

	const id = readString(value.id);
	const timestamp =
		readString(value.occurred_at) ?? readString(value.timestamp);

	if (!id || !timestamp) {
		return null;
	}

	return {
		id,
		timestamp,
		severity: readString(value.severity) ?? "—",
		environment: readString(value.environment) ?? "—",
		service: readString(value.service) ?? "—",
		agent: readString(value.agent) ?? "—",
	};
}

function normalizeTicket(value: unknown): BugTicket | null {
	if (!isRecord(value)) {
		return null;
	}

	const id = readString(value.id);
	const provider = readString(value.provider);

	if (!id || !provider) {
		return null;
	}

	return {
		id,
		provider,
		remoteId: readString(value.remote_id) ?? readString(value.remoteId) ?? "—",
		remoteUrl:
			readString(value.remote_url) ?? readString(value.remoteUrl) ?? "#",
		priority: readString(value.priority) ?? "—",
		status: readString(value.status) ?? "—",
		createdAt:
			readString(value.created_at) ?? readString(value.createdAt) ?? "—",
	};
}

function normalizeNotification(value: unknown): BugNotification | null {
	if (!isRecord(value)) {
		return null;
	}

	const id = readString(value.id);
	const provider = readString(value.provider);

	if (!id || !provider) {
		return null;
	}

	return {
		id,
		provider,
		message: readString(value.message) ?? "—",
		sentAt: readString(value.sent_at) ?? readString(value.sentAt) ?? "—",
	};
}

function normalizeNotificationEvent(
	value: unknown,
): BugNotificationEvent | null {
	if (!isRecord(value)) {
		return null;
	}

	const id = readString(value.id);
	const provider = readString(value.provider);

	if (!id || !provider) {
		return null;
	}

	return {
		id,
		provider,
		status: readString(value.status) ?? "—",
		reason: readString(value.reason) ?? "—",
		severity: readString(value.severity) ?? "—",
		ticketAction:
			readString(value.ticket_action) ?? readString(value.ticketAction) ?? "—",
		occurredAt:
			readString(value.occurred_at) ?? readString(value.occurredAt) ?? "—",
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

function readTone(value: unknown): BugTone {
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
