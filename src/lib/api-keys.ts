import { info, error as logError } from "bugfixes";
import { env } from "#/lib/env";

export type ApiKeyType = "dev" | "system";
export type ApiKeyScope = "ingest" | "read";
export type ApiKeySource = "live" | "snapshot";

export type ApiKeyRecord = {
	id: string;
	organization_id: string;
	account_id: string | null;
	key_type: ApiKeyType;
	scope: ApiKeyScope;
	name: string;
	api_key: string;
	clerk_user_id: string | null;
	environment: string | null;
	expires_at: string;
	revoked_at: string | null;
	last_used_at: string | null;
	created_at: string;
	updated_at: string;
};

export type ApiKeyWithSecret = ApiKeyRecord & {
	api_secret: string;
};

export type CreateApiKeyInput = {
	name: string;
	keyType: ApiKeyType;
	scope?: ApiKeyScope;
	accountId?: string;
	environment?: string;
	expiresAt?: string;
};

const jsonHeaders = {
	accept: "application/json",
	"Content-Type": "application/json",
} as const;

export const snapshotApiKeys: ApiKeyRecord[] = [
	{
		id: "8f7ff513-26d7-4fa6-b28f-f85b1415f4fe",
		organization_id: "c07f7cc0-10f3-465c-ac2d-3f69138e95d7",
		account_id: "1c443ab2-ae0f-43d8-be0f-44a4cbdb72a8",
		key_type: "dev",
		scope: "ingest",
		name: "Alex local iOS",
		api_key: "bk_dev_7b4bce9c7d0c4b6fa2e9",
		clerk_user_id: "user_snapshot_1",
		environment: "local-ios",
		expires_at: "2026-04-14T12:00:00.000Z",
		revoked_at: null,
		last_used_at: "2026-03-16T18:42:00.000Z",
		created_at: "2026-03-14T09:10:00.000Z",
		updated_at: "2026-03-16T18:42:00.000Z",
	},
	{
		id: "0c99519d-7e7a-488a-81ed-2b890c51b326",
		organization_id: "c07f7cc0-10f3-465c-ac2d-3f69138e95d7",
		account_id: "1c443ab2-ae0f-43d8-be0f-44a4cbdb72a8",
		key_type: "system",
		scope: "ingest",
		name: "Production ingest",
		api_key: "bk_sys_5f07850bc07a4c8a9fd2",
		clerk_user_id: null,
		environment: "production",
		expires_at: "2027-03-01T12:00:00.000Z",
		revoked_at: null,
		last_used_at: "2026-03-17T08:15:00.000Z",
		created_at: "2026-03-01T09:00:00.000Z",
		updated_at: "2026-03-17T08:15:00.000Z",
	},
	{
		id: "6eb194d0-a449-4dc0-8477-6658a3545f21",
		organization_id: "c07f7cc0-10f3-465c-ac2d-3f69138e95d7",
		account_id: null,
		key_type: "system",
		scope: "read",
		name: "Reporting reader",
		api_key: "bk_sys_062b706128b34bc0b62b",
		clerk_user_id: null,
		environment: "staging",
		expires_at: "2026-03-24T12:00:00.000Z",
		revoked_at: null,
		last_used_at: null,
		created_at: "2026-02-27T11:25:00.000Z",
		updated_at: "2026-02-27T11:25:00.000Z",
	},
];

export async function listApiKeys({
	clerkOrgId,
	clerkUserId,
	signal,
}: {
	clerkOrgId: string;
	clerkUserId: string;
	signal?: AbortSignal;
}): Promise<ApiKeyRecord[]> {
	info("listing api keys", clerkOrgId, clerkUserId);

	const response = await fetch(new URL("/v1/api-keys", env.daphneUrl), {
		headers: {
			...jsonHeaders,
			"X-Clerk-Org-Id": clerkOrgId,
			"X-Clerk-User-Id": clerkUserId,
		},
		signal,
	});

	if (!response.ok) {
		throw new Error(await readApiError(response));
	}

	return (await response.json()) as ApiKeyRecord[];
}

export async function createApiKey({
	clerkOrgId,
	clerkUserId,
	input,
}: {
	clerkOrgId: string;
	clerkUserId: string;
	input: CreateApiKeyInput;
}): Promise<ApiKeyWithSecret> {
	info("creating api key", input.keyType, input.name);

	const response = await fetch(new URL("/v1/api-keys", env.daphneUrl), {
		method: "POST",
		headers: {
			...jsonHeaders,
			"X-Clerk-Org-Id": clerkOrgId,
			"X-Clerk-User-Id": clerkUserId,
		},
		body: JSON.stringify({
			name: input.name.trim(),
			key_type: input.keyType,
			scope: input.keyType === "system" ? input.scope : undefined,
			account_id: input.accountId?.trim() || undefined,
			environment: input.environment?.trim() || undefined,
			expires_at: input.expiresAt || undefined,
		}),
	});

	if (!response.ok) {
		throw new Error(await readApiError(response));
	}

	return (await response.json()) as ApiKeyWithSecret;
}

export async function revokeApiKey({
	clerkOrgId,
	clerkUserId,
	keyId,
}: {
	clerkOrgId: string;
	clerkUserId: string;
	keyId: string;
}): Promise<ApiKeyRecord> {
	info("revoking api key", keyId);

	const response = await fetch(
		new URL(`/v1/api-keys/${encodeURIComponent(keyId)}`, env.daphneUrl),
		{
			method: "DELETE",
			headers: {
				accept: "application/json",
				"X-Clerk-Org-Id": clerkOrgId,
				"X-Clerk-User-Id": clerkUserId,
			},
		},
	);

	if (!response.ok) {
		throw new Error(await readApiError(response));
	}

	return (await response.json()) as ApiKeyRecord;
}

async function readApiError(response: Response): Promise<string> {
	try {
		const body = (await response.json()) as { error?: string };
		if (body.error) {
			return body.error;
		}
	} catch (error) {
		logError("failed to decode api key error body", error);
	}

	switch (response.status) {
		case 400:
			return "The API key request was rejected.";
		case 403:
			return "You do not have permission to manage that API key.";
		case 404:
			return "The API key could not be found.";
		default:
			return `Request failed (${response.status}).`;
	}
}
