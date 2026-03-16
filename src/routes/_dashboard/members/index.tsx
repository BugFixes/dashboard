import { useAuth, useOrganization } from "@clerk/react";
import { createFileRoute } from "@tanstack/react-router";
import { Inbox, Users } from "lucide-react";
import { startTransition, useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "#/components/ui/alert-dialog";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "#/components/ui/avatar";
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
import { env } from "#/lib/env";
import {
	type MemberRole,
	type OrgMember,
	normalizeRole,
	snapshotMemberList,
	updateMemberRole,
} from "#/lib/members";

export const Route = createFileRoute("/_dashboard/members/")({
	component: MembersRoute,
});

type PendingDowngrade = { member: OrgMember; newRole: MemberRole };

function MembersRoute() {
	const { organization, memberships, membership } = useOrganization({
		memberships: { pageSize: 50, keepPreviousData: true },
	});
	const { userId } = useAuth();

	const [localRoles, setLocalRoles] = useState<Record<string, MemberRole>>({});
	const [pendingUserId, setPendingUserId] = useState<string | null>(null);
	const [updateError, setUpdateError] = useState<{
		memberId: string;
		message: string;
	} | null>(null);
	const [pendingDowngrade, setPendingDowngrade] =
		useState<PendingDowngrade | null>(null);

	const clerkOrgId = organization?.id ?? null;
	const clerkUserId = userId ?? null;

	async function applyRoleChange(
		member: OrgMember,
		newRole: MemberRole,
	): Promise<void> {
		if (!clerkOrgId) return;

		startTransition(() => {
			setPendingUserId(member.userId);
			setUpdateError(null);
		});

		const result = await updateMemberRole(
			clerkOrgId,
			member.userId,
			newRole,
			clerkUserId,
		);

		startTransition(() => {
			setPendingUserId(null);
			if (result.ok) {
				setLocalRoles((prev) => ({ ...prev, [member.id]: newRole }));
			} else {
				setUpdateError({
					memberId: member.id,
					message: result.error ?? "Unknown error.",
				});
			}
		});
	}

	function handleRoleChange(member: OrgMember, newRole: MemberRole): void {
		if (newRole === member.role) return;
		setUpdateError(null);

		if (member.role === "admin") {
			const adminCount = (
				memberships?.data?.map((m) => ({
					id: m.id,
					role: localRoles[m.id] ?? normalizeRole(m.role),
				})) ?? snapshotMemberList.members
			).filter((m) => m.role === "admin").length;

			if (adminCount <= 1) {
				setUpdateError({
					memberId: member.id,
					message: "Cannot remove the last admin from the organization.",
				});
				return;
			}

			setPendingDowngrade({ member, newRole });
			return;
		}

		void applyRoleChange(member, newRole);
	}

	function handleConfirmDowngrade(): void {
		if (!pendingDowngrade) return;
		const { member, newRole } = pendingDowngrade;
		setPendingDowngrade(null);
		void applyRoleChange(member, newRole);
	}

	// Snapshot mode when Clerk is not configured
	if (!env.providers.clerkConfigured) {
		return (
			<MembersScreen
				members={snapshotMemberList.members}
				isAdmin={true}
				source="snapshot"
				pendingUserId={null}
				updateError={null}
				pendingDowngrade={null}
				onRoleChange={() => undefined}
				onConfirmDowngrade={() => undefined}
				onCancelDowngrade={() => undefined}
			/>
		);
	}

	// Loading state
	if (!memberships || memberships.isLoading) {
		return <MembersListSkeleton />;
	}

	// No organisation context
	if (!organization) {
		return <NoOrgPanel />;
	}

	const members: OrgMember[] = (memberships.data ?? []).map((m) => ({
		id: m.id,
		userId: m.publicUserData?.userId ?? m.id,
		name:
			[m.publicUserData?.firstName, m.publicUserData?.lastName]
				.filter(Boolean)
				.join(" ") ||
			m.publicUserData?.identifier ||
			"Unknown",
		email: m.publicUserData?.identifier ?? "",
		avatarUrl: m.publicUserData?.imageUrl ?? null,
		role: localRoles[m.id] ?? normalizeRole(m.role),
		joinedAt: m.createdAt.toISOString(),
	}));

	const isAdmin = normalizeRole(membership?.role ?? "") === "admin";

	return (
		<MembersScreen
			members={members}
			isAdmin={isAdmin}
			source="live"
			pendingUserId={pendingUserId}
			updateError={updateError}
			pendingDowngrade={pendingDowngrade}
			onRoleChange={handleRoleChange}
			onConfirmDowngrade={handleConfirmDowngrade}
			onCancelDowngrade={() => setPendingDowngrade(null)}
		/>
	);
}

function MembersScreen({
	members,
	isAdmin,
	source,
	pendingUserId,
	updateError,
	pendingDowngrade,
	onRoleChange,
	onConfirmDowngrade,
	onCancelDowngrade,
}: {
	members: OrgMember[];
	isAdmin: boolean;
	source: "live" | "snapshot";
	pendingUserId: string | null;
	updateError: { memberId: string; message: string } | null;
	pendingDowngrade: PendingDowngrade | null;
	onRoleChange: (member: OrgMember, newRole: MemberRole) => void;
	onConfirmDowngrade: () => void;
	onCancelDowngrade: () => void;
}) {
	const adminCount = members.filter((m) => m.role === "admin").length;
	const editorCount = members.filter((m) => m.role === "editor").length;
	const viewerCount = members.filter((m) => m.role === "viewer").length;

	return (
		<>
			<main className="page-wrap space-y-6 px-4 pb-16 pt-10">
				<Card className="hero-panel overflow-hidden border-none text-white">
					<CardHeader className="space-y-5">
						<div className="flex flex-wrap items-center gap-2">
							<Badge className="bg-white/14 text-white shadow-none">
								Organization members
							</Badge>
							<Badge
								variant="secondary"
								className={source === "live" ? "" : "bg-white/10 text-white"}
							>
								{source === "live" ? "Live" : "Snapshot"}
							</Badge>
						</div>
						<div className="space-y-4">
							<CardTitle className="max-w-3xl font-display text-3xl leading-none font-semibold tracking-tight sm:text-4xl">
								Manage team roles
							</CardTitle>
							<CardDescription className="max-w-2xl text-base leading-7 text-slate-100/88">
								View and assign roles for every member of this organization.
								Admins can promote or restrict access at any time.
							</CardDescription>
						</div>
					</CardHeader>
					<CardContent>
						<div className="grid gap-3 sm:grid-cols-3">
							<RolePill label="Admins" count={adminCount} />
							<RolePill label="Editors" count={editorCount} />
							<RolePill label="Viewers" count={viewerCount} />
						</div>
					</CardContent>
				</Card>

				{members.length > 0 ? (
					<Card className="surface panel-border">
						<CardHeader className="space-y-3">
							<Badge variant="outline" className="w-fit">
								Member list
							</Badge>
							<CardTitle className="text-2xl">
								{members.length} member{members.length !== 1 ? "s" : ""}
							</CardTitle>
							<CardDescription>
								{isAdmin
									? "Use the role selector to change a member's access level. Downgrading an admin requires confirmation."
									: "Role assignment is available to admins only."}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{members.map((member, index) => (
									<div key={member.id} className="space-y-4">
										{index > 0 ? <Separator /> : null}
										<MemberRow
											member={member}
											isAdmin={isAdmin}
											isPending={pendingUserId === member.userId}
											error={
												updateError?.memberId === member.id
													? updateError.message
													: null
											}
											onRoleChange={onRoleChange}
										/>
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
								title="No members found"
								description="Organization members will appear here once they are added."
							/>
						</CardContent>
					</Card>
				)}
			</main>

			<AlertDialog open={pendingDowngrade !== null}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Downgrade admin role?</AlertDialogTitle>
						<AlertDialogDescription>
							{pendingDowngrade ? (
								<>
									You are about to change{" "}
									<strong>{pendingDowngrade.member.name}</strong> from{" "}
									<strong>admin</strong> to{" "}
									<strong>{pendingDowngrade.newRole}</strong>. They will lose
									admin access immediately.
								</>
							) : null}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={onCancelDowngrade}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction onClick={onConfirmDowngrade}>
							Confirm downgrade
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}

function MemberRow({
	member,
	isAdmin,
	isPending,
	error,
	onRoleChange,
}: {
	member: OrgMember;
	isAdmin: boolean;
	isPending: boolean;
	error: string | null;
	onRoleChange: (member: OrgMember, newRole: MemberRole) => void;
}) {
	const initials = member.name
		.split(" ")
		.map((n) => n[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();

	return (
		<div className="flex items-start justify-between gap-4 rounded-2xl p-4">
			<div className="flex min-w-0 flex-1 items-center gap-3">
				<Avatar size="lg">
					{member.avatarUrl ? (
						<AvatarImage src={member.avatarUrl} alt={member.name} />
					) : null}
					<AvatarFallback>{initials}</AvatarFallback>
				</Avatar>
				<div className="min-w-0 flex-1 space-y-1">
					<p className="truncate font-medium leading-snug text-foreground">
						{member.name}
					</p>
					<p className="truncate text-sm text-muted-foreground">
						{member.email}
					</p>
					{error ? (
						<p className="text-xs text-destructive">{error}</p>
					) : null}
				</div>
			</div>

			<div className="flex shrink-0 items-center gap-3">
				{isAdmin && !isPending ? (
					<select
						value={member.role}
						onChange={(e) =>
							onRoleChange(member, e.target.value as MemberRole)
						}
						className="h-8 rounded-md border border-input bg-background px-2 py-1 text-sm shadow-xs outline-none focus:border-ring focus:ring-[3px] focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<option value="viewer">Viewer</option>
						<option value="editor">Editor</option>
						<option value="admin">Admin</option>
					</select>
				) : (
					<RoleBadge role={member.role} pending={isPending} />
				)}
			</div>
		</div>
	);
}

function RoleBadge({
	role,
	pending,
}: {
	role: MemberRole;
	pending?: boolean;
}) {
	if (pending) {
		return (
			<Badge variant="secondary" className="animate-pulse">
				Updating…
			</Badge>
		);
	}

	if (role === "admin") {
		return (
			<Badge className="border border-blue-200 bg-blue-50 text-blue-700">
				Admin
			</Badge>
		);
	}

	if (role === "editor") {
		return (
			<Badge className="border border-amber-200 bg-amber-50 text-amber-700">
				Editor
			</Badge>
		);
	}

	return (
		<Badge variant="secondary" className="border border-slate-200">
			Viewer
		</Badge>
	);
}

function RolePill({ label, count }: { label: string; count: number }) {
	return (
		<div className="rounded-2xl border border-white/12 bg-black/16 px-4 py-3">
			<div className="flex items-center gap-2 text-slate-100/78">
				<Users className="size-4" />
				<span className="text-sm">{label}</span>
			</div>
			<p className="mt-3 text-2xl font-semibold tracking-tight text-white">
				{count}
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

function NoOrgPanel() {
	return (
		<main className="page-wrap space-y-6 px-4 pb-16 pt-10">
			<Card className="surface panel-border">
				<CardContent className="py-8">
					<EmptyPanel
						icon={Users}
						title="No organization selected"
						description="Switch to an organization context to view and manage members."
					/>
				</CardContent>
			</Card>
		</main>
	);
}

function MembersListSkeleton() {
	return (
		<main className="page-wrap space-y-6 px-4 pb-16 pt-10">
			<Card className="hero-panel overflow-hidden border-none">
				<CardHeader className="space-y-5">
					<div className="flex gap-2">
						<Skeleton className="h-6 w-48 rounded-full bg-white/16" />
						<Skeleton className="h-6 w-20 rounded-full bg-white/16" />
					</div>
					<div className="space-y-3">
						<Skeleton className="h-10 w-64 bg-white/16" />
						<Skeleton className="h-5 w-full max-w-xl bg-white/14" />
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid gap-3 sm:grid-cols-3">
						{[0, 1, 2].map((item) => (
							<Skeleton key={item} className="h-24 rounded-2xl bg-white/14" />
						))}
					</div>
				</CardContent>
			</Card>

			<Card className="surface panel-border">
				<CardHeader className="space-y-3">
					<Skeleton className="h-6 w-28 rounded-full" />
					<Skeleton className="h-8 w-36" />
					<Skeleton className="h-5 w-full max-w-sm" />
				</CardHeader>
				<CardContent className="space-y-4">
					{[0, 1, 2, 3].map((item) => (
						<Skeleton key={item} className="h-16 rounded-2xl" />
					))}
				</CardContent>
			</Card>
		</main>
	);
}
