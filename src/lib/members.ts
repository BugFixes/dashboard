import { error as logError, info } from "bugfixes";
import { env } from "#/lib/env";

export type MemberRole = "viewer" | "editor" | "admin";
export type MemberSource = "live" | "snapshot";

export type OrgMember = {
	id: string;
	userId: string;
	name: string;
	email: string;
	avatarUrl: string | null;
	role: MemberRole;
	joinedAt: string;
};

export type MemberListData = {
	members: OrgMember[];
};

export const snapshotMemberList: MemberListData = {
	members: [
		{
			id: "mem-1",
			userId: "user_snapshot_1",
			name: "Alex Morgan",
			email: "alex@example.com",
			avatarUrl: null,
			role: "admin",
			joinedAt: "2026-01-10T09:00:00+00:00",
		},
		{
			id: "mem-2",
			userId: "user_snapshot_2",
			name: "Jordan Lee",
			email: "jordan@example.com",
			avatarUrl: null,
			role: "editor",
			joinedAt: "2026-02-01T14:30:00+00:00",
		},
		{
			id: "mem-3",
			userId: "user_snapshot_3",
			name: "Sam Rivera",
			email: "sam@example.com",
			avatarUrl: null,
			role: "viewer",
			joinedAt: "2026-02-15T11:00:00+00:00",
		},
		{
			id: "mem-4",
			userId: "user_snapshot_4",
			name: "Taylor Kim",
			email: "taylor@example.com",
			avatarUrl: null,
			role: "viewer",
			joinedAt: "2026-03-01T08:15:00+00:00",
		},
	],
};

export function normalizeRole(clerkRole: string): MemberRole {
	const lower = clerkRole.toLowerCase();
	if (lower === "admin" || lower === "org:admin") return "admin";
	if (lower === "editor" || lower.includes("editor")) return "editor";
	return "viewer";
}

export async function updateMemberRole(
	clerkOrgId: string,
	targetUserId: string,
	role: MemberRole,
	clerkUserId?: string | null,
): Promise<{ ok: boolean; error?: string }> {
	info("updating member role", targetUserId, role);
	try {
		const headers: Record<string, string> = {
			"Content-Type": "application/json",
			accept: "application/json",
			"X-Clerk-Org-Id": clerkOrgId,
		};
		if (clerkUserId) {
			headers["X-Clerk-User-Id"] = clerkUserId;
		}

		const response = await fetch(
			new URL(
				`/v1/organizations/${encodeURIComponent(clerkOrgId)}/members/${encodeURIComponent(targetUserId)}`,
				env.daphneUrl,
			),
			{
				method: "PATCH",
				headers,
				body: JSON.stringify({ role }),
			},
		);

		if (!response.ok) {
			if (response.status === 409) {
				return {
					ok: false,
					error: "Cannot remove the last admin from the organization.",
				};
			}
			return {
				ok: false,
				error: `Request failed (${response.status}).`,
			};
		}

		return { ok: true };
	} catch (err) {
		logError("failed to update member role", err);
		if (err instanceof Error) {
			return { ok: false, error: err.message };
		}
		return { ok: false, error: "An unexpected error occurred." };
	}
}
