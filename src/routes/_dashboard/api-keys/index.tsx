import { useAuth, useOrganization } from "@clerk/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	Ban,
	Copy,
	Inbox,
	KeyRound,
	Plus,
	RefreshCw,
	ShieldCheck,
	Sparkles,
	TriangleAlert,
} from "lucide-react";
import {
	type FormEvent,
	type ReactNode,
	startTransition,
	useEffect,
	useMemo,
	useState,
} from "react";
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
	type ApiKeyRecord,
	type ApiKeyScope,
	type ApiKeySource,
	type ApiKeyType,
	type ApiKeyWithSecret,
	createApiKey,
	listApiKeys,
	revokeApiKey,
	snapshotApiKeys,
} from "#/lib/api-keys";
import { env } from "#/lib/env";
import { normalizeRole } from "#/lib/members";

export const Route = createFileRoute("/_dashboard/api-keys/")({
	component: AgentCredentialsPage,
});

type CreateFormState = {
	name: string;
	keyType: ApiKeyType;
	scope: ApiKeyScope;
	environmentKey: string;
	accountId: string;
	environment: string;
	expiresOn: string;
};

type ApiKeysState =
	| { kind: "loading" }
	| { kind: "ready"; keys: ApiKeyRecord[]; source: ApiKeySource }
	| { kind: "error"; message: string };

type SystemTargetOption = {
	value: string;
	label: string;
	accountId: string;
	environment: string;
};

const initialCreateForm: CreateFormState = {
	name: "",
	keyType: "dev",
	scope: "ingest",
	environmentKey: "",
	accountId: "",
	environment: "",
	expiresOn: "",
};

export function AgentCredentialsPage() {
	const { isLoaded: authLoaded, userId } = useAuth();
	const {
		isLoaded: organizationLoaded,
		organization,
		membership,
	} = useOrganization();

	const [screenState, setScreenState] = useState<ApiKeysState>(() =>
		env.providers.clerkConfigured
			? { kind: "loading" }
			: { kind: "ready", keys: snapshotApiKeys, source: "snapshot" },
	);
	const [formState, setFormState] =
		useState<CreateFormState>(initialCreateForm);
	const [createdKey, setCreatedKey] = useState<ApiKeyWithSecret | null>(null);
	const [createError, setCreateError] = useState<string | null>(null);
	const [revokeError, setRevokeError] = useState<string | null>(null);
	const [pendingCreate, setPendingCreate] = useState(false);
	const [pendingRevokeId, setPendingRevokeId] = useState<string | null>(null);
	const [confirmingKey, setConfirmingKey] = useState<ApiKeyRecord | null>(null);
	const [copiedValue, setCopiedValue] = useState<string | null>(null);

	const isAdmin = normalizeRole(membership?.role ?? "") === "admin";

	useEffect(() => {
		if (!isAdmin && formState.keyType === "system") {
			setFormState((current) => ({
				...current,
				keyType: "dev",
				scope: "ingest",
			}));
		}
	}, [formState.keyType, isAdmin]);

	useEffect(() => {
		if (!env.providers.clerkConfigured) {
			startTransition(() => {
				setScreenState({
					kind: "ready",
					keys: snapshotApiKeys,
					source: "snapshot",
				});
			});
			return;
		}

		if (!authLoaded || !organizationLoaded || !userId) {
			startTransition(() => {
				setScreenState({ kind: "loading" });
			});
			return;
		}

		if (!organization) {
			return;
		}

		const abortController = new AbortController();

		startTransition(() => {
			setScreenState({ kind: "loading" });
		});

		void listApiKeys({
			clerkOrgId: organization.id,
			clerkUserId: userId,
			signal: abortController.signal,
		})
			.then((keys) => {
				startTransition(() => {
					setScreenState({ kind: "ready", keys, source: "live" });
				});
			})
			.catch((error) => {
				if (error instanceof Error && error.name === "AbortError") {
					return;
				}

				startTransition(() => {
					setScreenState({
						kind: "error",
						message:
							error instanceof Error
								? error.message
								: "Failed to load API keys.",
					});
				});
			});

		return () => abortController.abort();
	}, [authLoaded, organization, organizationLoaded, userId]);

	const liveContext =
		userId && organization
			? { clerkOrgId: organization.id, clerkUserId: userId }
			: null;

	function updateForm<K extends keyof CreateFormState>(
		key: K,
		value: CreateFormState[K],
	) {
		setFormState((current) => ({ ...current, [key]: value }));
	}

	function resetForm(nextType: ApiKeyType = formState.keyType) {
		setFormState({
			...initialCreateForm,
			keyType: nextType,
			scope: "ingest",
		});
	}

	async function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setCreateError(null);
		setRevokeError(null);
		const minimumExpiryDate = getMinimumExpiryDate();

		if (!liveContext) {
			setCreateError(
				"Connect Clerk and choose an organization to create live API keys.",
			);
			return;
		}

		if (!formState.name.trim()) {
			setCreateError("Name is required.");
			return;
		}

		if (formState.expiresOn && formState.expiresOn < minimumExpiryDate) {
			setCreateError("Expiry must be tomorrow or later.");
			return;
		}

		if (!formState.accountId.trim() || !formState.environment.trim()) {
			setCreateError(
				formState.keyType === "system"
					? "Select an agent first."
					: "Finish project and environment setup before creating dev keys.",
			);
			return;
		}

		startTransition(() => {
			setPendingCreate(true);
		});

		try {
			const result = await createApiKey({
				...liveContext,
				input: {
					name: formState.name,
					keyType: formState.keyType,
					scope: formState.keyType === "system" ? formState.scope : undefined,
					accountId: formState.accountId,
					environment: formState.environment,
					expiresAt: formState.expiresOn
						? `${formState.expiresOn}T23:59:59.000Z`
						: undefined,
				},
			});

			startTransition(() => {
				setPendingCreate(false);
				setCreatedKey(result);
				setScreenState((current) =>
					current.kind === "ready"
						? {
								...current,
								keys: [result, ...current.keys],
							}
						: current,
				);
				resetForm(result.key_type);
			});
		} catch (error) {
			startTransition(() => {
				setPendingCreate(false);
				setCreateError(
					error instanceof Error ? error.message : "Failed to create API key.",
				);
			});
		}
	}

	async function handleRevokeConfirm() {
		if (!confirmingKey || !liveContext) {
			setConfirmingKey(null);
			return;
		}

		startTransition(() => {
			setPendingRevokeId(confirmingKey.id);
			setRevokeError(null);
		});

		try {
			await revokeApiKey({
				...liveContext,
				keyId: confirmingKey.id,
			});

			startTransition(() => {
				setPendingRevokeId(null);
				setConfirmingKey(null);
				setScreenState((current) =>
					current.kind === "ready"
						? {
								...current,
								keys: current.keys.filter((key) => key.id !== confirmingKey.id),
							}
						: current,
				);
			});
		} catch (error) {
			startTransition(() => {
				setPendingRevokeId(null);
				setRevokeError(
					error instanceof Error ? error.message : "Failed to revoke API key.",
				);
			});
		}
	}

	async function handleCopy(label: string, value: string) {
		if (!navigator?.clipboard) {
			return;
		}

		await navigator.clipboard.writeText(value);
		setCopiedValue(label);
		window.setTimeout(() => {
			setCopiedValue((current) => (current === label ? null : current));
		}, 1600);
	}

	if (!env.providers.clerkConfigured) {
		return (
			<ApiKeysScreen
				canManageLive={false}
				canCreateSystemKeys={true}
				copyFeedback={copiedValue}
				createError={null}
				createdKey={createdKey}
				currentUserId={null}
				formState={formState}
				isCreating={false}
				keys={snapshotApiKeys}
				onCopy={handleCopy}
				onCreateSubmit={handleCreateSubmit}
				onFormChange={updateForm}
				onRevokeRequest={() => undefined}
				organizationName="Local snapshot"
				revokeError={null}
				source="snapshot"
				pendingRevokeId={null}
			/>
		);
	}

	if (!authLoaded || !organizationLoaded || screenState.kind === "loading") {
		return <ApiKeysSkeleton />;
	}

	if (!organization) {
		return <NoOrgPanel />;
	}

	if (screenState.kind === "error") {
		return <ApiKeysErrorPanel message={screenState.message} />;
	}

	return (
		<>
			<ApiKeysScreen
				canManageLive={screenState.source === "live"}
				canCreateSystemKeys={isAdmin}
				copyFeedback={copiedValue}
				createError={createError}
				createdKey={createdKey}
				currentUserId={userId}
				formState={formState}
				isCreating={pendingCreate}
				keys={screenState.keys}
				onCopy={handleCopy}
				onCreateSubmit={handleCreateSubmit}
				onFormChange={updateForm}
				onRevokeRequest={setConfirmingKey}
				organizationName={organization.name}
				revokeError={revokeError}
				source={screenState.source}
				pendingRevokeId={pendingRevokeId}
			/>

			<AlertDialog open={confirmingKey !== null}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Revoke API key?</AlertDialogTitle>
						<AlertDialogDescription>
							{confirmingKey ? (
								<>
									<strong>{confirmingKey.name}</strong> will stop working
									immediately. Daphne will keep the audit trail, but the key
									will be removed from the active list.
								</>
							) : null}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setConfirmingKey(null)}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction onClick={handleRevokeConfirm}>
							Revoke key
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}

function ApiKeysScreen({
	canManageLive,
	canCreateSystemKeys,
	copyFeedback,
	createError,
	createdKey,
	currentUserId,
	formState,
	isCreating,
	keys,
	onCopy,
	onCreateSubmit,
	onFormChange,
	onRevokeRequest,
	organizationName,
	revokeError,
	source,
	pendingRevokeId,
}: {
	canManageLive: boolean;
	canCreateSystemKeys: boolean;
	copyFeedback: string | null;
	createError: string | null;
	createdKey: ApiKeyWithSecret | null;
	currentUserId: string | null;
	formState: CreateFormState;
	isCreating: boolean;
	keys: ApiKeyRecord[];
	onCopy: (label: string, value: string) => Promise<void>;
	onCreateSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
	onFormChange: <K extends keyof CreateFormState>(
		key: K,
		value: CreateFormState[K],
	) => void;
	onRevokeRequest: (key: ApiKeyRecord) => void;
	organizationName: string;
	revokeError: string | null;
	source: ApiKeySource;
	pendingRevokeId: string | null;
}) {
	const minimumExpiryDate = useMemo(() => getMinimumExpiryDate(), []);
	const counts = useMemo(() => {
		const total = keys.length;
		const system = keys.filter((key) => key.key_type === "system").length;
		const expiringSoon = keys.filter((key) =>
			expiresSoon(key.expires_at),
		).length;
		return { total, system, expiringSoon };
	}, [keys]);
	const systemTargetOptions = useMemo(
		() => buildSystemTargetOptions(keys),
		[keys],
	);
	const canCreateSystemKey =
		canCreateSystemKeys && systemTargetOptions.length > 0;

	useEffect(() => {
		if (!canCreateSystemKey && formState.keyType === "system") {
			onFormChange("keyType", "dev");
			onFormChange("scope", "ingest");
		}
	}, [canCreateSystemKey, formState.keyType, onFormChange]);

	useEffect(() => {
		if (systemTargetOptions.length === 0) {
			if (
				formState.environmentKey ||
				formState.accountId ||
				formState.environment
			) {
				onFormChange("environmentKey", "");
				onFormChange("accountId", "");
				onFormChange("environment", "");
			}
			return;
		}

		const selected =
			systemTargetOptions.find(
				(option) => option.value === formState.environmentKey,
			) ?? systemTargetOptions[0];

		if (
			selected.value !== formState.environmentKey ||
			selected.accountId !== formState.accountId ||
			selected.environment !== formState.environment
		) {
			onFormChange("environmentKey", selected.value);
			onFormChange("accountId", selected.accountId);
			onFormChange("environment", selected.environment);
		}
	}, [
		systemTargetOptions,
		formState.accountId,
		formState.environment,
		formState.environmentKey,
		onFormChange,
	]);

	return (
		<main className="page-wrap space-y-6 px-4 pb-16 pt-10">
			<section className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
				<Card className="hero-panel overflow-hidden border-none text-white">
					<CardHeader className="space-y-5">
						<div className="flex flex-wrap items-center gap-2">
							<Badge className="bg-white/14 text-white shadow-none">
								Agents
							</Badge>
							<Badge
								variant="secondary"
								className={source === "live" ? "" : "bg-white/10 text-white"}
							>
								{source === "live" ? "Live" : "Snapshot"}
							</Badge>
						</div>
						<div className="space-y-4">
							<CardTitle className="max-w-3xl font-display text-4xl leading-none font-semibold tracking-tight sm:text-5xl">
								Create agent keys and manage ingestion credentials.
							</CardTitle>
							<CardDescription className="max-w-2xl text-base leading-7 text-slate-100/88">
								Issue dev and system keys for your agents, keep environment
								context attached, and see which credentials are active while the
								full agent detail APIs catch up.
							</CardDescription>
						</div>
					</CardHeader>
					<CardContent className="space-y-5">
						<div className="grid gap-3 sm:grid-cols-3">
							<MetricPill label="Agent keys" value={counts.total} />
							<MetricPill label="Shared keys" value={counts.system} />
							<MetricPill label="Expiring soon" value={counts.expiringSoon} />
						</div>
						<div className="flex flex-wrap items-center gap-3">
							<Button asChild size="lg" className="rounded-full">
								<Link to="/members">Open members</Link>
							</Button>
							<Button
								asChild
								variant="secondary"
								size="lg"
								className="rounded-full"
							>
								<Link to="/settings">Open settings</Link>
							</Button>
						</div>
					</CardContent>
				</Card>

				<Card className="surface panel-border">
					<CardHeader className="space-y-4">
						<div className="flex items-center gap-3">
							<div className="rounded-2xl border border-border/70 bg-background/80 p-3">
								<ShieldCheck className="size-5 text-primary" />
							</div>
							<div>
								<p className="eyebrow">Workspace access</p>
								<CardTitle className="mt-2 text-2xl font-semibold tracking-tight">
									{organizationName}
								</CardTitle>
							</div>
						</div>
						<CardDescription className="text-sm leading-7 sm:text-base">
							{source === "live"
								? canCreateSystemKeys
									? "You can issue personal dev keys and workspace-wide shared keys."
									: "You can issue dev keys for yourself. Shared system keys stay restricted to admins."
								: "Snapshot mode keeps the layout visible without Clerk, but live creation and revocation stay disabled."}
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-3">
						<InfoTile
							title="Dev keys"
							description="Attach automatically to the current signed-in member, always use ingest scope, and never require a customer to know their Clerk ID."
						/>
						<InfoTile
							title="Shared keys"
							description="Attach to a selected agent environment and support optional read scope for team-managed services."
						/>
						<InfoTile
							title="Current backend gap"
							description="Daphne still does not expose full project/system/environment APIs, so the environment selector is currently derived from existing key inventory."
						/>
					</CardContent>
				</Card>
			</section>

			<section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
				<Card className="surface panel-border">
					<CardHeader className="space-y-3">
						<div className="flex items-center gap-2">
							<Badge variant="outline">Create key</Badge>
							{canManageLive ? null : (
								<Badge variant="secondary">Read only</Badge>
							)}
						</div>
						<CardTitle className="text-2xl font-semibold tracking-tight">
							Issue a new agent key
						</CardTitle>
						<CardDescription>
							The secret is shown once after creation. Copy it immediately and
							store it outside the dashboard.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form className="space-y-4" onSubmit={onCreateSubmit}>
							<div className="grid gap-4 md:grid-cols-2">
								<FormField
									label="Key type"
									hint={
										canCreateSystemKey
											? "Choose whether this key belongs to you or to a shared workspace environment."
											: canCreateSystemKeys
												? "Create an agent first to unlock shared system keys."
												: "Only admins can create shared system keys."
									}
								>
									<select
										value={formState.keyType}
										onChange={(event) =>
											onFormChange("keyType", event.target.value as ApiKeyType)
										}
										disabled={!canManageLive || !canCreateSystemKeys}
										className="form-control"
									>
										<option value="dev">Dev</option>
										{canCreateSystemKey ? (
											<option value="system">System</option>
										) : null}
									</select>
								</FormField>

								{formState.keyType === "system" ? (
									<FormField
										label="Agent"
										hint={
											systemTargetOptions.length > 0
												? "Choose the agent environment these shared keys belong to."
												: "No agent environments are available yet. This should come from project setup."
										}
									>
										<select
											value={formState.environmentKey}
											onChange={(event) => {
												const selected = systemTargetOptions.find(
													(option) => option.value === event.target.value,
												);
												if (!selected) {
													return;
												}
												onFormChange("environmentKey", selected.value);
												onFormChange("accountId", selected.accountId);
												onFormChange("environment", selected.environment);
											}}
											disabled={
												!canManageLive || systemTargetOptions.length === 0
											}
											className="form-control"
										>
											{systemTargetOptions.length === 0 ? (
												<option value="">No agents available</option>
											) : (
												systemTargetOptions.map((option) => (
													<option key={option.value} value={option.value}>
														{option.label}
													</option>
												))
											)}
										</select>
									</FormField>
								) : null}
							</div>

							<div className="grid gap-4 md:grid-cols-2">
								<FormField
									label="Name"
									hint="Use a label you can identify later in audits."
								>
									<input
										value={formState.name}
										onChange={(event) =>
											onFormChange("name", event.target.value)
										}
										disabled={!canManageLive}
										className="form-control"
										placeholder="Production ingest"
									/>
								</FormField>

								{formState.keyType === "system" ? (
									<FormField
										label="Selected environment"
										hint="The matching backend account is attached automatically."
									>
										<input
											value={formState.environment || "No environment selected"}
											disabled
											className="form-control"
										/>
									</FormField>
								) : null}
							</div>

							<div className="grid gap-4 md:grid-cols-2">
								{formState.keyType === "system" ? (
									<FormField
										label="Scope"
										hint="Read scope is useful for service-to-service consumers."
									>
										<select
											value={formState.scope}
											onChange={(event) =>
												onFormChange("scope", event.target.value as ApiKeyScope)
											}
											disabled={!canManageLive}
											className="form-control"
										>
											<option value="ingest">Ingest</option>
											<option value="read">Read</option>
										</select>
									</FormField>
								) : null}

								<FormField
									label="Expires on"
									hint={
										formState.keyType === "dev"
											? "Daphne caps dev keys to 30 days. Earliest expiry is tomorrow."
											: "Daphne caps system keys to 365 days. Earliest expiry is tomorrow."
									}
								>
									<input
										type="date"
										value={formState.expiresOn}
										min={minimumExpiryDate}
										onChange={(event) =>
											onFormChange("expiresOn", event.target.value)
										}
										disabled={!canManageLive}
										className="form-control"
									/>
								</FormField>
							</div>

							{createError ? (
								<InlineMessage tone="critical">{createError}</InlineMessage>
							) : null}

							<div className="flex flex-wrap items-center gap-3">
								<Button type="submit" disabled={!canManageLive || isCreating}>
									{isCreating ? (
										<>
											<RefreshCw className="animate-spin" />
											Creating…
										</>
									) : (
										<>
											<Plus />
											Create key
										</>
									)}
								</Button>
								{!canManageLive ? (
									<p className="m-0 text-sm text-muted-foreground">
										Enable Clerk to create live keys.
									</p>
								) : null}
							</div>
						</form>
					</CardContent>
				</Card>

				<Card className="surface panel-border">
					<CardHeader className="space-y-3">
						<div className="flex items-center gap-2">
							<Badge variant="outline">One-time secret</Badge>
							<Badge variant="secondary">Copy now</Badge>
						</div>
						<CardTitle className="text-2xl font-semibold tracking-tight">
							Latest generated agent credentials
						</CardTitle>
						<CardDescription>
							Secrets are never returned by Daphne’s list endpoint after the
							initial creation response.
						</CardDescription>
					</CardHeader>
					<CardContent>
						{createdKey ? (
							<div className="space-y-4 rounded-3xl border border-border/70 bg-background/70 p-5">
								<div className="flex flex-wrap items-center gap-2">
									<KeyTypeBadge keyType={createdKey.key_type} />
									<ScopeBadge scope={createdKey.scope} />
									<StatusBadge expiresAt={createdKey.expires_at} />
								</div>
								<div>
									<p className="mb-1 text-sm font-medium text-foreground">
										{createdKey.name}
									</p>
									<p className="m-0 text-sm leading-6 text-muted-foreground">
										Copy both values now. The key stays visible later; the
										secret does not.
									</p>
								</div>
								<SecretField
									label="API key"
									value={createdKey.api_key}
									copyState={copyFeedback === "latest-key" ? "Copied" : "Copy"}
									onCopy={() => onCopy("latest-key", createdKey.api_key)}
								/>
								<SecretField
									label="API secret"
									value={createdKey.api_secret}
									copyState={
										copyFeedback === "latest-secret" ? "Copied" : "Copy"
									}
									onCopy={() => onCopy("latest-secret", createdKey.api_secret)}
								/>
							</div>
						) : (
							<EmptyPanel
								icon={Sparkles}
								title="No fresh key generated yet"
								description="Create a key from the form to reveal its one-time secret here."
							/>
						)}
					</CardContent>
				</Card>
			</section>

			<Card className="surface panel-border">
				<CardHeader className="space-y-3">
					<div className="flex flex-wrap items-center gap-2">
						<Badge variant="outline">Active keys</Badge>
						<Badge variant="secondary">{keys.length} total</Badge>
					</div>
					<CardTitle className="text-2xl font-semibold tracking-tight">
						Current agent key inventory
					</CardTitle>
					<CardDescription>
						Shared keys appear only for admins. Personal dev keys are scoped to
						the current signed-in member.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{revokeError ? (
						<InlineMessage tone="critical">{revokeError}</InlineMessage>
					) : null}

					{keys.length > 0 ? (
						<div className="space-y-4">
							{keys.map((key, index) => (
								<div key={key.id} className="space-y-4">
									{index > 0 ? <Separator /> : null}
									<ApiKeyRow
										copyFeedback={copyFeedback}
										currentUserId={currentUserId}
										keyRecord={key}
										onCopy={onCopy}
										onRevokeRequest={onRevokeRequest}
										canManageLive={canManageLive}
										canRevoke={
											canManageLive &&
											(key.key_type === "system" ||
												key.clerk_user_id === currentUserId)
										}
										isRevoking={pendingRevokeId === key.id}
									/>
								</div>
							))}
						</div>
					) : (
						<EmptyPanel
							icon={Inbox}
							title="No active agent keys"
							description="Issue a dev or shared key to make ingestion credentials available for your agents."
						/>
					)}
				</CardContent>
			</Card>
		</main>
	);
}

function ApiKeyRow({
	copyFeedback,
	currentUserId,
	keyRecord,
	onCopy,
	onRevokeRequest,
	canManageLive,
	canRevoke,
	isRevoking,
}: {
	copyFeedback: string | null;
	currentUserId: string | null;
	keyRecord: ApiKeyRecord;
	onCopy: (label: string, value: string) => Promise<void>;
	onRevokeRequest: (key: ApiKeyRecord) => void;
	canManageLive: boolean;
	canRevoke: boolean;
	isRevoking: boolean;
}) {
	const ownedByCurrentUser = keyRecord.clerk_user_id === currentUserId;
	const copyLabel = `key-${keyRecord.id}`;

	return (
		<div className="flex flex-col gap-4 rounded-2xl p-4 lg:flex-row lg:items-start lg:justify-between">
			<div className="min-w-0 flex-1 space-y-3">
				<div className="flex flex-wrap items-center gap-2">
					<KeyTypeBadge keyType={keyRecord.key_type} />
					<ScopeBadge scope={keyRecord.scope} />
					<StatusBadge expiresAt={keyRecord.expires_at} />
					{ownedByCurrentUser ? (
						<Badge variant="secondary">Your key</Badge>
					) : null}
				</div>
				<div>
					<p className="m-0 text-base font-semibold text-foreground">
						{keyRecord.name}
					</p>
					<p className="mt-1 mb-0 font-mono text-xs text-muted-foreground break-all">
						{keyRecord.api_key}
					</p>
				</div>
				<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
					<DataPoint
						label="Environment"
						value={keyRecord.environment || "Not set"}
					/>
					<DataPoint
						label="Created"
						value={formatDateTime(keyRecord.created_at) || "Unknown"}
					/>
					<DataPoint
						label="Last used"
						value={formatDateTime(keyRecord.last_used_at) || "Never"}
					/>
					<DataPoint
						label="Expires"
						value={formatDateTime(keyRecord.expires_at) || "Unknown"}
					/>
				</div>
			</div>

			<div className="flex shrink-0 flex-wrap items-center gap-2">
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => onCopy(copyLabel, keyRecord.api_key)}
				>
					<Copy />
					{copyFeedback === copyLabel ? "Copied" : "Copy key"}
				</Button>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => onRevokeRequest(keyRecord)}
					disabled={!canManageLive || !canRevoke || isRevoking}
				>
					{isRevoking ? (
						<>
							<RefreshCw className="animate-spin" />
							Revoking…
						</>
					) : (
						<>
							<Ban />
							Revoke
						</>
					)}
				</Button>
			</div>
		</div>
	);
}

function MetricPill({ label, value }: { label: string; value: number }) {
	return (
		<div className="rounded-2xl border border-white/12 bg-black/16 px-4 py-3">
			<p className="m-0 text-sm text-slate-100/76">{label}</p>
			<p className="mt-3 mb-0 text-2xl font-semibold tracking-tight text-white">
				{value}
			</p>
		</div>
	);
}

function InfoTile({
	title,
	description,
}: {
	title: string;
	description: string;
}) {
	return (
		<div className="rounded-2xl border border-border/70 bg-background/72 p-4">
			<p className="m-0 text-base font-semibold text-foreground">{title}</p>
			<p className="mt-2 mb-0 text-sm leading-6 text-muted-foreground">
				{description}
			</p>
		</div>
	);
}

function FormField({
	label,
	hint,
	children,
}: {
	label: string;
	hint: string;
	children: ReactNode;
}) {
	return (
		<div className="space-y-2">
			<span className="text-sm font-medium text-foreground">{label}</span>
			{children}
			<span className="block text-xs leading-5 text-muted-foreground">
				{hint}
			</span>
		</div>
	);
}

function SecretField({
	label,
	value,
	copyState,
	onCopy,
}: {
	label: string;
	value: string;
	copyState: string;
	onCopy: () => Promise<void>;
}) {
	return (
		<div className="rounded-2xl border border-border/70 bg-background/82 p-4">
			<div className="flex items-center justify-between gap-3">
				<p className="m-0 text-sm font-medium text-foreground">{label}</p>
				<Button type="button" variant="outline" size="sm" onClick={onCopy}>
					<Copy />
					{copyState}
				</Button>
			</div>
			<p className="mt-3 mb-0 font-mono text-xs break-all text-muted-foreground">
				{value}
			</p>
		</div>
	);
}

function DataPoint({
	label,
	value,
	mono = false,
}: {
	label: string;
	value: string;
	mono?: boolean;
}) {
	return (
		<div className="rounded-2xl border border-border/70 bg-background/72 p-3">
			<p className="m-0 text-xs uppercase tracking-[0.18em] text-muted-foreground">
				{label}
			</p>
			<p
				className={`mt-2 mb-0 text-sm text-foreground ${mono ? "font-mono break-all" : ""}`}
			>
				{value}
			</p>
		</div>
	);
}

function InlineMessage({
	tone,
	children,
}: {
	tone: "critical" | "neutral";
	children: ReactNode;
}) {
	return (
		<div
			className={`rounded-2xl border px-4 py-3 text-sm ${
				tone === "critical"
					? "border-destructive/30 bg-destructive/8 text-destructive"
					: "border-border bg-background/70 text-muted-foreground"
			}`}
		>
			{children}
		</div>
	);
}

function KeyTypeBadge({ keyType }: { keyType: ApiKeyType }) {
	return keyType === "system" ? (
		<Badge className="border border-blue-200 bg-blue-50 text-blue-700">
			System
		</Badge>
	) : (
		<Badge className="border border-emerald-200 bg-emerald-50 text-emerald-700">
			Dev
		</Badge>
	);
}

function ScopeBadge({ scope }: { scope: ApiKeyScope }) {
	return scope === "read" ? (
		<Badge className="border border-amber-200 bg-amber-50 text-amber-700">
			Read
		</Badge>
	) : (
		<Badge variant="secondary">Ingest</Badge>
	);
}

function StatusBadge({ expiresAt }: { expiresAt: string }) {
	if (isExpired(expiresAt)) {
		return (
			<Badge className="border border-red-200 bg-red-50 text-red-700">
				Expired
			</Badge>
		);
	}

	if (expiresSoon(expiresAt)) {
		return (
			<Badge className="border border-orange-200 bg-orange-50 text-orange-700">
				Expiring soon
			</Badge>
		);
	}

	return <Badge variant="outline">Active</Badge>;
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

function ApiKeysErrorPanel({ message }: { message: string }) {
	return (
		<main className="page-wrap space-y-6 px-4 pb-16 pt-10">
			<Card className="surface panel-border">
				<CardContent className="py-8">
					<EmptyPanel
						icon={TriangleAlert}
						title="Failed to load API keys"
						description={message}
					/>
				</CardContent>
			</Card>
		</main>
	);
}

function NoOrgPanel() {
	return (
		<main className="page-wrap space-y-6 px-4 pb-16 pt-10">
			<Card className="surface panel-border">
				<CardContent className="py-8">
					<EmptyPanel
						icon={KeyRound}
						title="No organization selected"
						description="Switch to an organization context to manage API keys."
					/>
				</CardContent>
			</Card>
		</main>
	);
}

function ApiKeysSkeleton() {
	return (
		<main className="page-wrap space-y-6 px-4 pb-16 pt-10">
			<Card className="hero-panel overflow-hidden border-none">
				<CardHeader className="space-y-5">
					<div className="flex gap-2">
						<Skeleton className="h-6 w-40 rounded-full bg-white/16" />
						<Skeleton className="h-6 w-20 rounded-full bg-white/16" />
					</div>
					<div className="space-y-3">
						<Skeleton className="h-12 w-full max-w-2xl bg-white/16" />
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

			<section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
				<Card className="surface panel-border">
					<CardHeader className="space-y-3">
						<Skeleton className="h-6 w-28 rounded-full" />
						<Skeleton className="h-8 w-44" />
						<Skeleton className="h-5 w-full max-w-sm" />
					</CardHeader>
					<CardContent className="space-y-4">
						{[0, 1, 2, 3].map((item) => (
							<Skeleton key={item} className="h-14 rounded-2xl" />
						))}
					</CardContent>
				</Card>

				<Card className="surface panel-border">
					<CardHeader className="space-y-3">
						<Skeleton className="h-6 w-32 rounded-full" />
						<Skeleton className="h-8 w-56" />
					</CardHeader>
					<CardContent>
						<Skeleton className="h-60 rounded-3xl" />
					</CardContent>
				</Card>
			</section>

			<Card className="surface panel-border">
				<CardHeader className="space-y-3">
					<Skeleton className="h-6 w-24 rounded-full" />
					<Skeleton className="h-8 w-48" />
				</CardHeader>
				<CardContent className="space-y-4">
					{[0, 1, 2].map((item) => (
						<Skeleton key={item} className="h-28 rounded-2xl" />
					))}
				</CardContent>
			</Card>
		</main>
	);
}

function formatDateTime(value: string | null): string | null {
	if (!value) {
		return null;
	}

	return new Intl.DateTimeFormat(undefined, {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}

function isExpired(expiresAt: string): boolean {
	return new Date(expiresAt).getTime() <= Date.now();
}

function expiresSoon(expiresAt: string): boolean {
	const ms = new Date(expiresAt).getTime() - Date.now();
	return ms > 0 && ms <= 1000 * 60 * 60 * 24 * 14;
}

function buildSystemTargetOptions(keys: ApiKeyRecord[]): SystemTargetOption[] {
	const targets = new Map<
		string,
		SystemTargetOption & { createdAt: string; preferred: boolean }
	>();

	for (const key of keys) {
		if (!key.account_id || !key.environment) {
			continue;
		}

		const value = `${key.account_id}::${key.environment}`;
		const label = key.name.trim()
			? `${key.name} (${key.environment})`
			: key.environment;
		const next = {
			value,
			label,
			accountId: key.account_id,
			environment: key.environment,
			createdAt: key.created_at,
			preferred: key.key_type === "system",
		};
		const current = targets.get(value);

		if (
			!current ||
			(next.preferred && !current.preferred) ||
			(next.preferred === current.preferred &&
				new Date(next.createdAt).getTime() >
					new Date(current.createdAt).getTime())
		) {
			targets.set(value, next);
		}
	}

	return [...targets.values()]
		.sort((left, right) => left.label.localeCompare(right.label))
		.map(
			({ createdAt: _createdAt, preferred: _preferred, ...option }) => option,
		);
}

function getMinimumExpiryDate(): string {
	const tomorrow = new Date();
	tomorrow.setHours(0, 0, 0, 0);
	tomorrow.setDate(tomorrow.getDate() + 1);

	return tomorrow.toISOString().slice(0, 10);
}
