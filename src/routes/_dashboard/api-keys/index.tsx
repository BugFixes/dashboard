import { useAuth, useOrganization } from "@clerk/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	Ban,
	Boxes,
	Copy,
	FolderTree,
	Inbox,
	KeyRound,
	Layers3,
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
	AGENT_STRUCTURE_STORAGE_KEY,
	type AgentEnvironmentOption,
	type AgentStructure,
	buildAgentEnvironmentOptions,
	countAgentStructure,
	createEnvironmentRecord,
	createProjectRecord,
	createSubprojectRecord,
	resolveAgentStructure,
} from "#/lib/agent-structure";
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

type StructureMessage = {
	tone: "critical" | "neutral";
	text: string;
};

type ProjectFormState = {
	name: string;
	description: string;
};

type SubprojectFormState = {
	projectId: string;
	name: string;
	description: string;
};

type EnvironmentFormState = {
	projectId: string;
	subprojectId: string;
	name: string;
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

const initialProjectForm: ProjectFormState = {
	name: "",
	description: "",
};

const initialSubprojectForm: SubprojectFormState = {
	projectId: "",
	name: "",
	description: "",
};

const initialEnvironmentForm: EnvironmentFormState = {
	projectId: "",
	subprojectId: "",
	name: "",
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
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [persistedStructure, setPersistedStructure] =
		useState<AgentStructure | null>(null);
	const [structureLoaded, setStructureLoaded] = useState(false);
	const [projectForm, setProjectForm] =
		useState<ProjectFormState>(initialProjectForm);
	const [subprojectForm, setSubprojectForm] = useState<SubprojectFormState>(
		initialSubprojectForm,
	);
	const [environmentForm, setEnvironmentForm] = useState<EnvironmentFormState>(
		initialEnvironmentForm,
	);
	const [structureMessage, setStructureMessage] =
		useState<StructureMessage | null>(null);

	const isAdmin = normalizeRole(membership?.role ?? "") === "admin";

	const structureSource: ApiKeySource =
		env.providers.clerkConfigured && screenState.kind === "ready"
			? screenState.source
			: "snapshot";
	const structureKeys =
		env.providers.clerkConfigured && screenState.kind === "ready"
			? screenState.keys
			: snapshotApiKeys;
	const agentStructure = useMemo(
		() =>
			resolveAgentStructure({
				keys: structureKeys,
				source: structureSource,
				persisted: persistedStructure,
			}),
		[persistedStructure, structureKeys, structureSource],
	);
	const structureCounts = useMemo(
		() => countAgentStructure(agentStructure),
		[agentStructure],
	);
	const environmentOptions = useMemo(
		() => buildAgentEnvironmentOptions(agentStructure),
		[agentStructure],
	);

	useEffect(() => {
		if (typeof window === "undefined") {
			setStructureLoaded(true);
			return;
		}

		try {
			const stored = window.localStorage.getItem(AGENT_STRUCTURE_STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored) as unknown;
				if (isAgentStructure(parsed)) {
					setPersistedStructure(parsed);
				}
			}
		} catch {
			setStructureMessage({
				tone: "critical",
				text: "Stored project structure could not be restored. Starting from the seeded model instead.",
			});
		} finally {
			setStructureLoaded(true);
		}
	}, []);

	useEffect(() => {
		if (!structureLoaded || typeof window === "undefined") {
			return;
		}

		if (!persistedStructure || isEmptyStructure(persistedStructure)) {
			window.localStorage.removeItem(AGENT_STRUCTURE_STORAGE_KEY);
			return;
		}

		window.localStorage.setItem(
			AGENT_STRUCTURE_STORAGE_KEY,
			JSON.stringify(persistedStructure),
		);
	}, [persistedStructure, structureLoaded]);

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
		if (agentStructure.projects.length === 0) {
			if (subprojectForm.projectId) {
				setSubprojectForm((current) => ({
					...current,
					projectId: "",
				}));
			}
			if (environmentForm.projectId || environmentForm.subprojectId) {
				setEnvironmentForm((current) => ({
					...current,
					projectId: "",
					subprojectId: "",
				}));
			}
			return;
		}

		if (
			!subprojectForm.projectId ||
			!agentStructure.projects.some(
				(project) => project.id === subprojectForm.projectId,
			)
		) {
			setSubprojectForm((current) => ({
				...current,
				projectId: agentStructure.projects[0]?.id ?? "",
			}));
		}

		if (
			!environmentForm.projectId ||
			!agentStructure.projects.some(
				(project) => project.id === environmentForm.projectId,
			)
		) {
			setEnvironmentForm((current) => ({
				...current,
				projectId: agentStructure.projects[0]?.id ?? "",
			}));
		}
	}, [
		agentStructure.projects,
		environmentForm.projectId,
		environmentForm.subprojectId,
		subprojectForm.projectId,
	]);

	useEffect(() => {
		const availableSubprojects = agentStructure.subprojects.filter(
			(subproject) => subproject.projectId === environmentForm.projectId,
		);
		if (availableSubprojects.length === 0) {
			if (environmentForm.subprojectId) {
				setEnvironmentForm((current) => ({
					...current,
					subprojectId: "",
				}));
			}
			return;
		}

		if (
			!environmentForm.subprojectId ||
			!availableSubprojects.some(
				(subproject) => subproject.id === environmentForm.subprojectId,
			)
		) {
			setEnvironmentForm((current) => ({
				...current,
				subprojectId: availableSubprojects[0]?.id ?? "",
			}));
		}
	}, [
		agentStructure.subprojects,
		environmentForm.projectId,
		environmentForm.subprojectId,
	]);

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

	function updatePersistedStructure(
		updater: (current: AgentStructure | null) => AgentStructure,
	) {
		setPersistedStructure((current) => updater(current));
	}

	function handleProjectCreate(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setStructureMessage(null);

		if (!projectForm.name.trim()) {
			setStructureMessage({
				tone: "critical",
				text: "Project name is required.",
			});
			return;
		}

		const normalizedName = projectForm.name.trim().toLowerCase();
		if (
			agentStructure.projects.some(
				(project) => project.name.trim().toLowerCase() === normalizedName,
			)
		) {
			setStructureMessage({
				tone: "critical",
				text: "That project already exists.",
			});
			return;
		}

		const project = createProjectRecord(projectForm);
		updatePersistedStructure((current) => ({
			projects: [...(current?.projects ?? []), project],
			subprojects: current?.subprojects ?? [],
			environments: current?.environments ?? [],
		}));
		setProjectForm(initialProjectForm);
		setSubprojectForm((current) => ({
			...current,
			projectId: project.id,
		}));
		setEnvironmentForm((current) => ({
			...current,
			projectId: project.id,
			subprojectId: "",
		}));
		setStructureMessage({
			tone: "neutral",
			text: `Created project ${project.name}.`,
		});
	}

	function handleSubprojectCreate(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setStructureMessage(null);

		if (!subprojectForm.projectId) {
			setStructureMessage({
				tone: "critical",
				text: "Choose a project before creating a sub-project.",
			});
			return;
		}

		if (!subprojectForm.name.trim()) {
			setStructureMessage({
				tone: "critical",
				text: "Sub-project name is required.",
			});
			return;
		}

		const normalizedName = subprojectForm.name.trim().toLowerCase();
		if (
			agentStructure.subprojects.some(
				(subproject) =>
					subproject.projectId === subprojectForm.projectId &&
					subproject.name.trim().toLowerCase() === normalizedName,
			)
		) {
			setStructureMessage({
				tone: "critical",
				text: "That sub-project already exists in the selected project.",
			});
			return;
		}

		const subproject = createSubprojectRecord(subprojectForm);
		updatePersistedStructure((current) => ({
			projects: current?.projects ?? [],
			subprojects: [...(current?.subprojects ?? []), subproject],
			environments: current?.environments ?? [],
		}));
		setSubprojectForm((current) => ({
			...initialSubprojectForm,
			projectId: current.projectId,
		}));
		setEnvironmentForm((current) => ({
			...current,
			projectId: subproject.projectId,
			subprojectId: subproject.id,
		}));
		setStructureMessage({
			tone: "neutral",
			text: `Created sub-project ${subproject.name}.`,
		});
	}

	function handleEnvironmentCreate(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setStructureMessage(null);

		if (!environmentForm.projectId || !environmentForm.subprojectId) {
			setStructureMessage({
				tone: "critical",
				text: "Choose a project and sub-project before creating an environment.",
			});
			return;
		}

		if (!environmentForm.name.trim()) {
			setStructureMessage({
				tone: "critical",
				text: "Environment name is required.",
			});
			return;
		}

		const environment = createEnvironmentRecord(environmentForm);
		if (
			agentStructure.environments.some(
				(item) =>
					item.subprojectId === environment.subprojectId &&
					item.slug === environment.slug,
			)
		) {
			setStructureMessage({
				tone: "critical",
				text: "That environment slug already exists in the selected sub-project.",
			});
			return;
		}

		updatePersistedStructure((current) => ({
			projects: current?.projects ?? [],
			subprojects: current?.subprojects ?? [],
			environments: [...(current?.environments ?? []), environment],
		}));
		setEnvironmentForm((current) => ({
			...current,
			name: "",
		}));
		setStructureMessage({
			tone: "neutral",
			text: `Created environment ${environment.name}. It becomes a key target once Daphne binds it to an account.`,
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
					? "Select an environment target first."
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
				agentStructure={agentStructure}
				canManageLive={false}
				canCreateSystemKeys={true}
				copyFeedback={copiedValue}
				createError={null}
				createdKey={createdKey}
				currentUserId={null}
				environmentForm={environmentForm}
				environmentOptions={environmentOptions}
				formState={formState}
				isCreating={false}
				keys={snapshotApiKeys}
				onCopy={handleCopy}
				onCreateSubmit={handleCreateSubmit}
				onEnvironmentCreate={handleEnvironmentCreate}
				onEnvironmentFormChange={setEnvironmentForm}
				onFormChange={updateForm}
				onProjectCreate={handleProjectCreate}
				onProjectFormChange={setProjectForm}
				onRevokeRequest={() => undefined}
				onSubprojectCreate={handleSubprojectCreate}
				onSubprojectFormChange={setSubprojectForm}
				organizationName="Local snapshot"
				revokeError={null}
				projectForm={projectForm}
				source="snapshot"
				structureCounts={structureCounts}
				structureMessage={structureMessage}
				subprojectForm={subprojectForm}
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
				agentStructure={agentStructure}
				canManageLive={screenState.source === "live"}
				canCreateSystemKeys={isAdmin}
				copyFeedback={copiedValue}
				createError={createError}
				createdKey={createdKey}
				currentUserId={userId}
				environmentForm={environmentForm}
				environmentOptions={environmentOptions}
				formState={formState}
				isCreating={pendingCreate}
				keys={screenState.keys}
				onCopy={handleCopy}
				onCreateSubmit={handleCreateSubmit}
				onEnvironmentCreate={handleEnvironmentCreate}
				onEnvironmentFormChange={setEnvironmentForm}
				onFormChange={updateForm}
				onProjectCreate={handleProjectCreate}
				onProjectFormChange={setProjectForm}
				onRevokeRequest={setConfirmingKey}
				onSubprojectCreate={handleSubprojectCreate}
				onSubprojectFormChange={setSubprojectForm}
				organizationName={organization.name}
				revokeError={revokeError}
				projectForm={projectForm}
				source={screenState.source}
				structureCounts={structureCounts}
				structureMessage={structureMessage}
				subprojectForm={subprojectForm}
				isCreateModalOpen={isCreateModalOpen}
				onSetCreateModalOpen={setIsCreateModalOpen}
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
	agentStructure,
	canManageLive,
	canCreateSystemKeys,
	copyFeedback,
	createError,
	createdKey,
	currentUserId,
	environmentForm,
	environmentOptions,
	formState,
	isCreating,
	keys,
	onCopy,
	onCreateSubmit,
	onEnvironmentCreate,
	onEnvironmentFormChange,
	onFormChange,
	onProjectCreate,
	onProjectFormChange,
	onRevokeRequest,
	onSubprojectCreate,
	onSubprojectFormChange,
	organizationName,
	projectForm,
	revokeError,
	source,
	structureCounts,
	structureMessage,
	subprojectForm,
	pendingRevokeId,
}: {
	agentStructure: AgentStructure;
	canManageLive: boolean;
	canCreateSystemKeys: boolean;
	copyFeedback: string | null;
	createError: string | null;
	createdKey: ApiKeyWithSecret | null;
	currentUserId: string | null;
	environmentForm: EnvironmentFormState;
	environmentOptions: AgentEnvironmentOption[];
	formState: CreateFormState;
	isCreating: boolean;
	keys: ApiKeyRecord[];
	onCopy: (label: string, value: string) => Promise<void>;
	onCreateSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
	onEnvironmentCreate: (event: FormEvent<HTMLFormElement>) => void;
	onEnvironmentFormChange: (
		updater:
			| EnvironmentFormState
			| ((current: EnvironmentFormState) => EnvironmentFormState),
	) => void;
	onFormChange: <K extends keyof CreateFormState>(
		key: K,
		value: CreateFormState[K],
	) => void;
	onProjectCreate: (event: FormEvent<HTMLFormElement>) => void;
	onProjectFormChange: (
		updater:
			| ProjectFormState
			| ((current: ProjectFormState) => ProjectFormState),
	) => void;
	onRevokeRequest: (key: ApiKeyRecord) => void;
	onSubprojectCreate: (event: FormEvent<HTMLFormElement>) => void;
	onSubprojectFormChange: (
		updater:
			| SubprojectFormState
			| ((current: SubprojectFormState) => SubprojectFormState),
	) => void;
	organizationName: string;
	projectForm: ProjectFormState;
	revokeError: string | null;
	source: ApiKeySource;
	structureCounts: ReturnType<typeof countAgentStructure>;
	structureMessage: StructureMessage | null;
	subprojectForm: SubprojectFormState;
	isCreateModalOpen: boolean;
	onSetCreateModalOpen: (open: boolean) => void;
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
	const canCreateSystemKey =
		canCreateSystemKeys && environmentOptions.length > 0;
	const selectedSystemTarget =
		environmentOptions.find(
			(option) => option.value === formState.environmentKey,
		) ?? null;
	const inventoryCounts = useMemo(
		() => buildEnvironmentInventoryCounts(keys),
		[keys],
	);
	const filteredSubprojectOptions = useMemo(
		() =>
			agentStructure.subprojects.filter(
				(subproject) => subproject.projectId === environmentForm.projectId,
			),
		[agentStructure.subprojects, environmentForm.projectId],
	);

	useEffect(() => {
		if (!canCreateSystemKey && formState.keyType === "system") {
			onFormChange("keyType", "dev");
			onFormChange("scope", "ingest");
		}
	}, [canCreateSystemKey, formState.keyType, onFormChange]);

	useEffect(() => {
		if (environmentOptions.length === 0) {
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
			environmentOptions.find(
				(option) => option.value === formState.environmentKey,
			) ?? environmentOptions[0];

		if (
			selected.value !== formState.environmentKey ||
			selected.accountId !== formState.accountId ||
			selected.environmentSlug !== formState.environment
		) {
			onFormChange("environmentKey", selected.value);
			onFormChange("accountId", selected.accountId);
			onFormChange("environment", selected.environmentSlug);
		}
	}, [
		environmentOptions,
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
								Model projects, attach environments, and issue agent keys.
							</CardTitle>
							<CardDescription className="max-w-2xl text-base leading-7 text-slate-100/88">
								Define your workspace structure first, then reuse those
								environments when creating personal and shared credentials.
							</CardDescription>
						</div>
					</CardHeader>
					<CardContent className="space-y-5">
						<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
							<MetricPill label="Projects" value={structureCounts.projects} />
							<MetricPill
								label="Sub-projects"
								value={structureCounts.subprojects}
							/>
							<MetricPill
								label="Environments"
								value={structureCounts.environments}
							/>
							<MetricPill label="Agent keys" value={counts.total} />
						</div>
						<div className="flex flex-wrap items-center gap-3">
							<Button
								size="lg"
								className="rounded-full"
								onClick={() => onSetCreateModalOpen(true)}
							>
								<Plus />
								Create agent
							</Button>
							<Button
								asChild
								size="lg"
								variant="secondary"
								className="rounded-full"
							>
								<Link to="/members">Open members</Link>
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
									? "You can define workspace targets, issue personal dev keys, and create shared system keys."
									: "You can shape the workspace model and issue dev keys for yourself. Shared system keys stay restricted to admins."
								: "Snapshot mode keeps the structure and key flow visible without Clerk, but live creation and revocation stay disabled."}
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-3">
						<InfoTile
							title="Projects"
							description="Use projects for the top-level product or customer lane that owns the work."
						/>
						<InfoTile
							title="Sub-projects"
							description="Split projects into deployable surfaces, services, or platform slices before assigning environments."
						/>
						<InfoTile
							title="Environments"
							description="Create named environments here. They become key targets after Daphne binds the backend account."
						/>
					</CardContent>
				</Card>
			</section>

			<section className="grid gap-6 xl:grid-cols-[0.96fr_1.04fr]">
				<Card className="surface panel-border">
					<CardHeader className="space-y-3">
						<div className="flex items-center gap-2">
							<Badge variant="outline">Workspace structure</Badge>
							<Badge variant="secondary">
								{structureCounts.projects} projects
							</Badge>
						</div>
						<CardTitle className="text-2xl font-semibold tracking-tight">
							Create projects, sub-projects, and environments
						</CardTitle>
						<CardDescription>
							Named environments are created here first. Backend-bound
							environments appear in the key flow automatically.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-5">
						<div className="grid gap-3 sm:grid-cols-3">
							<StructureMetricCard
								icon={FolderTree}
								label="Projects"
								value={structureCounts.projects}
							/>
							<StructureMetricCard
								icon={Layers3}
								label="Sub-projects"
								value={structureCounts.subprojects}
							/>
							<StructureMetricCard
								icon={Boxes}
								label="Environments"
								value={structureCounts.environments}
							/>
						</div>

						{structureMessage ? (
							<InlineMessage tone={structureMessage.tone}>
								{structureMessage.text}
							</InlineMessage>
						) : null}

						<form className="space-y-4" onSubmit={onProjectCreate}>
							<div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
								<FormField
									label="Project"
									hint="Top-level product lane or customer space."
								>
									<input
										value={projectForm.name}
										onChange={(event) =>
											onProjectFormChange((current) => ({
												...current,
												name: event.target.value,
											}))
										}
										className="form-control"
										placeholder="Mobile apps"
									/>
								</FormField>
								<FormField
									label="Description"
									hint="Optional context for operators."
								>
									<input
										value={projectForm.description}
										onChange={(event) =>
											onProjectFormChange((current) => ({
												...current,
												description: event.target.value,
											}))
										}
										className="form-control"
										placeholder="Customer-facing mobile surfaces"
									/>
								</FormField>
							</div>
							<Button type="submit" variant="outline">
								<Plus />
								Add project
							</Button>
						</form>

						<Separator />

						<form className="space-y-4" onSubmit={onSubprojectCreate}>
							<div className="grid gap-4 md:grid-cols-[0.75fr_1fr_0.95fr]">
								<FormField
									label="Parent project"
									hint="Sub-projects are nested inside a project."
								>
									<select
										value={subprojectForm.projectId}
										onChange={(event) =>
											onSubprojectFormChange((current) => ({
												...current,
												projectId: event.target.value,
											}))
										}
										disabled={agentStructure.projects.length === 0}
										className="form-control"
									>
										{agentStructure.projects.length === 0 ? (
											<option value="">Create a project first</option>
										) : (
											agentStructure.projects.map((project) => (
												<option key={project.id} value={project.id}>
													{project.name}
												</option>
											))
										)}
									</select>
								</FormField>
								<FormField
									label="Sub-project"
									hint="Service, app surface, or team-owned slice."
								>
									<input
										value={subprojectForm.name}
										onChange={(event) =>
											onSubprojectFormChange((current) => ({
												...current,
												name: event.target.value,
											}))
										}
										className="form-control"
										placeholder="iOS client"
									/>
								</FormField>
								<FormField
									label="Description"
									hint="Optional operator context."
								>
									<input
										value={subprojectForm.description}
										onChange={(event) =>
											onSubprojectFormChange((current) => ({
												...current,
												description: event.target.value,
											}))
										}
										className="form-control"
										placeholder="Local builds and release lanes"
									/>
								</FormField>
							</div>
							<Button type="submit" variant="outline">
								<Plus />
								Add sub-project
							</Button>
						</form>

						<Separator />

						<form className="space-y-4" onSubmit={onEnvironmentCreate}>
							<div className="grid gap-4 md:grid-cols-2">
								<FormField
									label="Project"
									hint="Choose where the environment lives."
								>
									<select
										value={environmentForm.projectId}
										onChange={(event) =>
											onEnvironmentFormChange((current) => ({
												...current,
												projectId: event.target.value,
												subprojectId: "",
											}))
										}
										disabled={agentStructure.projects.length === 0}
										className="form-control"
									>
										{agentStructure.projects.length === 0 ? (
											<option value="">Create a project first</option>
										) : (
											agentStructure.projects.map((project) => (
												<option key={project.id} value={project.id}>
													{project.name}
												</option>
											))
										)}
									</select>
								</FormField>
								<FormField
									label="Sub-project"
									hint="Environments belong to one sub-project."
								>
									<select
										value={environmentForm.subprojectId}
										onChange={(event) =>
											onEnvironmentFormChange((current) => ({
												...current,
												subprojectId: event.target.value,
											}))
										}
										disabled={filteredSubprojectOptions.length === 0}
										className="form-control"
									>
										{filteredSubprojectOptions.length === 0 ? (
											<option value="">Create a sub-project first</option>
										) : (
											filteredSubprojectOptions.map((subproject) => (
												<option key={subproject.id} value={subproject.id}>
													{subproject.name}
												</option>
											))
										)}
									</select>
								</FormField>
							</div>
							<div className="grid gap-4 md:grid-cols-2">
								<FormField
									label="Environment"
									hint="Shown in the key flow and slugified for Daphne."
								>
									<input
										value={environmentForm.name}
										onChange={(event) =>
											onEnvironmentFormChange((current) => ({
												...current,
												name: event.target.value,
											}))
										}
										className="form-control"
										placeholder="Production"
									/>
								</FormField>
								<div className="rounded-2xl border border-border/70 bg-background/72 px-4 py-3">
									<p className="m-0 text-sm font-medium text-foreground">
										Backend binding
									</p>
									<p className="mt-2 mb-0 text-sm leading-6 text-muted-foreground">
										Account binding is now a backend concern. Users should not
										type raw IDs here.
									</p>
								</div>
							</div>
							<Button type="submit">
								<Plus />
								Add environment
							</Button>
						</form>
					</CardContent>
				</Card>

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
												? "Create an environment first to unlock shared system keys."
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
										label="Environment target"
										hint={
											environmentOptions.length > 0
												? "Choose the workspace environment these shared keys belong to."
												: agentStructure.environments.length > 0
													? "No backend-bound environments are available yet. Newly created environments appear here after Daphne syncs them."
													: "Create a project, sub-project, and environment first."
										}
									>
										<select
											value={formState.environmentKey}
											onChange={(event) => {
												const selected = environmentOptions.find(
													(option) => option.value === event.target.value,
												);
												if (!selected) {
													return;
												}
												onFormChange("environmentKey", selected.value);
												onFormChange("accountId", selected.accountId);
												onFormChange("environment", selected.environmentSlug);
											}}
											disabled={
												!canManageLive || environmentOptions.length === 0
											}
											className="form-control"
										>
											{environmentOptions.length === 0 ? (
												<option value="">No environments available</option>
											) : (
												environmentOptions.map((option) => (
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
										label="Selected target"
										hint="The matching backend binding is attached automatically."
									>
										<input
											value={
												selectedSystemTarget?.label || "No environment selected"
											}
											disabled
											className="form-control"
										/>
									</FormField>
								) : null}
							</div>

							{formState.keyType === "system" ? (
								<div className="grid gap-4 md:grid-cols-2">
									<FormField
										label="Environment slug"
										hint="Sent to Daphne as the environment identifier."
									>
										<input
											value={selectedSystemTarget?.environmentSlug || "—"}
											disabled
											className="form-control"
										/>
									</FormField>
									<div className="rounded-2xl border border-border/70 bg-background/72 px-4 py-3">
										<p className="m-0 text-sm font-medium text-foreground">
											Backend binding
										</p>
										<p className="mt-2 mb-0 text-sm leading-6 text-muted-foreground">
											The bound account is attached automatically when the
											environment is synced from Daphne.
										</p>
									</div>
								</div>
							) : null}

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
			</section>

			<section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
				<Card className="surface panel-border">
					<CardHeader className="space-y-3">
						<div className="flex items-center gap-2">
							<Badge variant="outline">Environment inventory</Badge>
							<Badge variant="secondary">
								{structureCounts.environments} targets
							</Badge>
						</div>
						<CardTitle className="text-2xl font-semibold tracking-tight">
							Current workspace hierarchy
						</CardTitle>
						<CardDescription>
							Projects roll up sub-projects, and each environment can be reused
							for future shared keys.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{agentStructure.projects.length > 0 ? (
							<div className="space-y-4">
								{agentStructure.projects.map((project, index) => (
									<div key={project.id} className="space-y-4">
										{index > 0 ? <Separator /> : null}
										<ProjectStructureCard
											inventoryCounts={inventoryCounts}
											project={project}
											structure={agentStructure}
										/>
									</div>
								))}
							</div>
						) : (
							<div className="space-y-6">
								<EmptyPanel
									icon={FolderTree}
									title="No structure defined yet"
									description="Define your projects and environments before creating system agents."
								/>
								<div className="rounded-2xl border border-dashed p-6 text-center">
									<p className="mb-4 text-sm text-muted-foreground leading-6">
										To provision agents for specific product lines, you first
										need to model your workspace by adding a{" "}
										<strong>Project</strong>, then a{" "}
										<strong>Sub-project</strong>, and finally an{" "}
										<strong>Environment</strong>.
									</p>
									<p className="text-sm font-medium">
										Start by adding a project in the section above.
									</p>
								</div>
							</div>
						)}
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
						All active credentials currently authorized to ingest data into your
						workspace environments.
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
						<div className="space-y-6">
							<EmptyPanel
								icon={Inbox}
								title="No active agent keys"
								description="Issue a dev or shared key to make ingestion credentials available for your agents."
							/>
							<div className="flex justify-center">
								<Button
									size="lg"
									className="rounded-full"
									onClick={() => onSetCreateModalOpen(true)}
								>
									<Plus />
									Create your first agent
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			<AlertDialog
				open={isCreateModalOpen}
				onOpenChange={(open) => {
					if (!open) {
						onSetCreateModalOpen(false);
					}
				}}
			>
				<AlertDialogContent className="max-w-2xl">
					<AlertDialogHeader>
						<AlertDialogTitle>
							{createdKey ? "Agent Provisioned" : "Provision New Agent"}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{createdKey
								? "Your agent has been successfully created. Copy the credentials below now."
								: "Agents use these credentials to securely ingest data into your chosen workspace environments."}
						</AlertDialogDescription>
					</AlertDialogHeader>

					{createdKey ? (
						<div className="space-y-6 py-4">
							<div className="space-y-4 rounded-3xl border border-border/70 bg-muted/30 p-6">
								<div className="flex flex-wrap items-center gap-2">
									<KeyTypeBadge keyType={createdKey.key_type} />
									<ScopeBadge scope={createdKey.scope} />
									<StatusBadge expiresAt={createdKey.expires_at} />
								</div>
								<div>
									<p className="mb-1 text-base font-semibold text-foreground">
										{createdKey.name}
									</p>
									<p className="m-0 text-sm leading-6 text-muted-foreground">
										Copy both values below. The secret will never be shown
										again.
									</p>
								</div>
								<SecretField
									label="Agent Key"
									value={createdKey.api_key}
									copyState={copyFeedback === "latest-key" ? "Copied" : "Copy"}
									onCopy={() => onCopy("latest-key", createdKey.api_key)}
								/>
								<SecretField
									label="Agent Secret"
									value={createdKey.api_secret}
									copyState={
										copyFeedback === "latest-secret" ? "Copied" : "Copy"
									}
									onCopy={() => onCopy("latest-secret", createdKey.api_secret)}
								/>
							</div>
							<AlertDialogFooter>
								<AlertDialogAction
									onClick={() => onSetCreateModalOpen(false)}
									className="rounded-full"
								>
									Done
								</AlertDialogAction>
							</AlertDialogFooter>
						</div>
					) : (
						<form onSubmit={onCreateSubmit} className="space-y-6 py-4">
							{createError ? (
								<InlineMessage tone="critical">{createError}</InlineMessage>
							) : null}

							<div className="grid gap-6 sm:grid-cols-2">
								<div className="space-y-2">
									<label className="text-sm font-medium" htmlFor="agent-name">
										Agent Name
									</label>
									<Input
										id="agent-name"
										placeholder="e.g. Production Ingest"
										value={formState.name}
										onChange={(e) => onFormChange("name", e.target.value)}
										required
									/>
								</div>

								<div className="space-y-2">
									<label className="text-sm font-medium" htmlFor="agent-type">
										Agent Type
									</label>
									<select
										id="agent-type"
										className="form-control"
										value={formState.keyType}
										onChange={(e) =>
											onFormChange(
												"keyType",
												e.target.value as CreateFormState["keyType"],
											)
										}
										disabled={!canCreateSystemKeys}
									>
										<option value="dev">Personal (Dev)</option>
										<option value="system">Shared (System)</option>
									</select>
									{!canCreateSystemKeys && (
										<p className="text-xs text-muted-foreground">
											Shared agents require admin permissions.
										</p>
									)}
								</div>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium" htmlFor="agent-target">
									Environment Target
								</label>
								<select
									id="agent-target"
									className="form-control"
									value={formState.environmentKey}
									onChange={(e) =>
										onFormChange("environmentKey", e.target.value)
									}
									disabled={formState.keyType === "dev"}
								>
									<option value="">Select target environment...</option>
									{environmentOptions.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
								{formState.keyType === "dev" ? (
									<p className="text-xs text-muted-foreground">
										Personal agents are bound to your user account
										automatically.
									</p>
								) : environmentOptions.length === 0 ? (
									<div className="rounded-xl border border-warning/30 bg-warning/10 p-4">
										<p className="text-sm text-warning-foreground leading-6">
											No environments found. Please define your workspace
											structure (Project &gt; Sub-project &gt; Environment)
											before creating shared agents.
										</p>
									</div>
								) : null}
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium" htmlFor="agent-expiry">
									Expiration (Optional)
								</label>
								<Input
									id="agent-expiry"
									type="date"
									min={minimumExpiryDate}
									value={formState.expiresOn}
									onChange={(e) => onFormChange("expiresOn", e.target.value)}
								/>
							</div>

							<AlertDialogFooter className="pt-4">
								<AlertDialogCancel
									onClick={() => onSetCreateModalOpen(false)}
									className="rounded-full"
								>
									Cancel
								</AlertDialogCancel>
								<Button
									type="submit"
									disabled={
										isCreating ||
										!formState.name ||
										(formState.keyType === "system" &&
											!formState.environmentKey) ||
										!canManageLive
									}
									className="rounded-full"
								>
									{isCreating ? (
										<span className="flex items-center gap-2">
											<Loader2 className="size-4 animate-spin" />
											Provisioning...
										</span>
									) : (
										"Provision Agent"
									)}
								</Button>
							</AlertDialogFooter>
						</form>
					)}
				</AlertDialogContent>
			</AlertDialog>
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

function StructureMetricCard({
	icon: Icon,
	label,
	value,
}: {
	icon: typeof FolderTree;
	label: string;
	value: number;
}) {
	return (
		<div className="rounded-2xl border border-border/70 bg-background/72 p-4">
			<div className="flex items-center justify-between gap-3">
				<p className="m-0 text-sm text-muted-foreground">{label}</p>
				<Icon className="size-4 text-primary" />
			</div>
			<p className="mt-3 mb-0 text-2xl font-semibold tracking-tight text-foreground">
				{value}
			</p>
		</div>
	);
}

function ProjectStructureCard({
	inventoryCounts,
	project,
	structure,
}: {
	inventoryCounts: Map<string, number>;
	project: AgentStructure["projects"][number];
	structure: AgentStructure;
}) {
	const subprojects = structure.subprojects.filter(
		(subproject) => subproject.projectId === project.id,
	);

	return (
		<div className="space-y-4 rounded-2xl border border-border/70 bg-background/72 p-5">
			<div className="space-y-2">
				<div className="flex flex-wrap items-center gap-2">
					<Badge variant="outline">Project</Badge>
					<p className="m-0 text-lg font-semibold tracking-tight text-foreground">
						{project.name}
					</p>
				</div>
				<p className="m-0 text-sm leading-6 text-muted-foreground">
					{project.description}
				</p>
			</div>

			{subprojects.length > 0 ? (
				<div className="space-y-3">
					{subprojects.map((subproject) => {
						const environments = structure.environments.filter(
							(environment) => environment.subprojectId === subproject.id,
						);

						return (
							<div
								key={subproject.id}
								className="rounded-2xl border border-border/70 bg-background/88 p-4"
							>
								<div className="flex flex-wrap items-center gap-2">
									<Badge variant="secondary">Sub-project</Badge>
									<p className="m-0 text-base font-semibold text-foreground">
										{subproject.name}
									</p>
								</div>
								<p className="mt-2 mb-0 text-sm leading-6 text-muted-foreground">
									{subproject.description}
								</p>
								<div className="mt-4 grid gap-3 md:grid-cols-2">
									{environments.length > 0 ? (
										environments.map((environment) => (
											<div
												key={environment.id}
												className="rounded-2xl border border-border/70 bg-background/72 p-4"
											>
												<div className="flex flex-wrap items-center gap-2">
													<Badge variant="outline">Environment</Badge>
													<p className="m-0 text-sm font-semibold text-foreground">
														{environment.name}
													</p>
												</div>
												<div className="mt-3 grid gap-3 sm:grid-cols-2">
													<DataPoint
														label="Slug"
														value={environment.slug}
														mono
													/>
													<DataPoint
														label="Key status"
														value={
															environment.accountId
																? "Ready for keys"
																: "Pending Daphne sync"
														}
													/>
													{environment.accountId ? (
														<DataPoint
															label="Active keys"
															value={String(
																inventoryCounts.get(
																	`${environment.accountId}::${environment.slug}`,
																) ?? 0,
															)}
														/>
													) : null}
												</div>
											</div>
										))
									) : (
										<div className="rounded-2xl border border-dashed border-border bg-background/72 px-4 py-5 text-sm text-muted-foreground">
											No environments added yet.
										</div>
									)}
								</div>
							</div>
						);
					})}
				</div>
			) : (
				<div className="rounded-2xl border border-dashed border-border bg-background/72 px-4 py-5 text-sm text-muted-foreground">
					No sub-projects added yet.
				</div>
			)}
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

function buildEnvironmentInventoryCounts(
	keys: ApiKeyRecord[],
): Map<string, number> {
	const targets = new Map<string, number>();
	for (const key of keys) {
		if (!key.account_id || !key.environment) {
			continue;
		}
		const value = `${key.account_id}::${key.environment}`;
		targets.set(value, (targets.get(value) ?? 0) + 1);
	}

	return targets;
}

function isAgentStructure(value: unknown): value is AgentStructure {
	if (!value || typeof value !== "object") {
		return false;
	}

	const candidate = value as Partial<AgentStructure>;
	return (
		Array.isArray(candidate.projects) &&
		Array.isArray(candidate.subprojects) &&
		Array.isArray(candidate.environments)
	);
}

function isEmptyStructure(value: AgentStructure): boolean {
	return (
		value.projects.length === 0 &&
		value.subprojects.length === 0 &&
		value.environments.length === 0
	);
}

function getMinimumExpiryDate(): string {
	const tomorrow = new Date();
	tomorrow.setHours(0, 0, 0, 0);
	tomorrow.setDate(tomorrow.getDate() + 1);

	return tomorrow.toISOString().slice(0, 10);
}
