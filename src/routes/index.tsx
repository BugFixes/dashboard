import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowRight,
	Gauge,
	GitBranchPlus,
	ShieldCheck,
	Sparkles,
	TimerReset,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarGroup } from "#/components/ui/avatar";
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
import { env } from "#/lib/env";

export const Route = createFileRoute("/")({ component: App });

const platformRails = [
	{
		title: "Bun runtime",
		description:
			"Fast install, fast dev boot, and a single package manager/runtime surface.",
	},
	{
		title: "TanStack Start",
		description:
			"File-based routing, SSR defaults, and server middleware hooks for auth.",
	},
	{
		title: "Clerk auth",
		description:
			"Current TanStack Start SDK wired into the root shell and request middleware.",
	},
	{
		title: "flags.gg",
		description:
			"Feature flag provider ready for gated modules once IDs are configured.",
	},
] as const;

const previewModules = [
	{
		name: "Release health",
		stat: "14 open regressions",
		note: "Triage lane with clear severity bands and owner handoff.",
	},
	{
		name: "Feed integrity",
		stat: "99.92% delivery",
		note: "Space for trend lines, environment toggles, and blast-radius callouts.",
	},
	{
		name: "Feature launches",
		stat: env.flags.isConfigured ? "flags.gg connected" : "flags.gg pending",
		note: "Safe rollout controls for Daphne-facing modules and internal previews.",
	},
] as const;

const launchChecklist = [
	{
		label: "Clerk publishable key",
		ready: env.providers.clerkConfigured,
	},
	{
		label: "flags.gg provider",
		ready: env.flags.isConfigured,
	},
	{
		label: "Runs beside Daphne on dedicated port",
		ready: true,
	},
] as const;

const team = ["DA", "PM", "BE"] as const;

function App() {
	return (
		<main className="page-wrap space-y-6 px-4 pb-16 pt-10">
			<section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
				<Card className="surface hero-panel overflow-hidden border-none">
					<CardHeader className="space-y-4">
						<div className="flex flex-wrap items-center gap-2">
							<Badge>Daphne dashboard</Badge>
							<Badge variant="secondary">Frontend scaffold</Badge>
						</div>
						<div className="space-y-4">
							<CardTitle className="max-w-4xl text-4xl leading-none font-semibold tracking-tight sm:text-6xl">
								Ship the dashboard shell first, then plug Daphne data into
								something deliberate.
							</CardTitle>
							<CardDescription className="max-w-2xl text-base leading-7 text-slate-200/88">
								This starter replaces the generic template with a
								dashboard-focused entry point: Bun for runtime, TanStack Start
								for routes and SSR, shadcn for primitives, Clerk for auth, and
								flags.gg for rollout control.
							</CardDescription>
						</div>
					</CardHeader>
					<CardContent className="flex flex-wrap items-center gap-3">
						<Button asChild size="lg" className="rounded-full">
							<Link to="/setup">
								Review setup
								<ArrowRight />
							</Link>
						</Button>
						<Button
							asChild
							variant="secondary"
							size="lg"
							className="rounded-full"
						>
							<a
								href="https://ui.shadcn.com/docs"
								target="_blank"
								rel="noreferrer"
							>
								Browse shadcn docs
							</a>
						</Button>
					</CardContent>
				</Card>

				<Card className="surface panel-border">
					<CardHeader className="space-y-3">
						<Badge variant="outline" className="w-fit">
							Provider readiness
						</Badge>
						<CardTitle className="text-2xl">Foundation status</CardTitle>
						<CardDescription>
							The scaffold builds cleanly without secrets, but the provider
							rails are already in place.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{launchChecklist.map((item, index) => (
							<div key={item.label} className="space-y-4">
								{index > 0 ? <Separator /> : null}
								<div className="flex items-center justify-between gap-4">
									<div className="flex items-center gap-3">
										<span
											className={`status-dot ${item.ready ? "bg-emerald-500" : "bg-amber-500"}`}
										/>
										<span className="text-sm font-medium text-foreground">
											{item.label}
										</span>
									</div>
									<Badge variant={item.ready ? "default" : "secondary"}>
										{item.ready ? "Ready" : "Needs env"}
									</Badge>
								</div>
							</div>
						))}
						<div className="rounded-2xl border border-border/70 bg-background/80 p-4">
							<p className="eyebrow">Local URLs</p>
							<p className="mt-2 text-sm text-muted-foreground">
								Dashboard: <code>{env.appUrl}</code>
							</p>
							<p className="mt-2 text-sm text-muted-foreground">
								Daphne: <code>{env.daphneUrl}</code>
							</p>
						</div>
					</CardContent>
				</Card>
			</section>

			<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				{platformRails.map((rail, index) => (
					<Card
						key={rail.title}
						className="surface panel-border fade-up"
						style={{ animationDelay: `${index * 90}ms` }}
					>
						<CardHeader className="space-y-2">
							<CardTitle className="text-xl">{rail.title}</CardTitle>
							<CardDescription>{rail.description}</CardDescription>
						</CardHeader>
					</Card>
				))}
			</section>

			<section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
				<Card className="surface panel-border">
					<CardHeader className="space-y-3">
						<div className="flex items-center gap-2">
							<Badge variant="outline">Preview modules</Badge>
							<Badge variant="secondary">Placeholder content</Badge>
						</div>
						<CardTitle className="text-2xl">
							Dashboard lanes ready for real screens
						</CardTitle>
						<CardDescription>
							The cards below are structured placeholders for the first
							dashboard routes.
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-4 md:grid-cols-3">
						{previewModules.map((module, index) => (
							<div
								key={module.name}
								className="rounded-3xl border border-border/70 bg-background/80 p-5"
							>
								<div className="flex items-center justify-between gap-3">
									<p className="panel-label">{module.name}</p>
									{index === 0 ? (
										<Gauge className="size-4 text-emerald-500" />
									) : null}
									{index === 1 ? (
										<TimerReset className="size-4 text-sky-500" />
									) : null}
									{index === 2 ? (
										<GitBranchPlus className="size-4 text-amber-500" />
									) : null}
								</div>
								<p className="metric-value mt-6">{module.stat}</p>
								<p className="mt-3 text-sm leading-6 text-muted-foreground">
									{module.note}
								</p>
							</div>
						))}
					</CardContent>
				</Card>

				<Card className="surface panel-border">
					<CardHeader className="space-y-3">
						<Badge variant="outline" className="w-fit">
							Shared shell
						</Badge>
						<CardTitle className="text-2xl">
							Reusable dashboard chrome
						</CardTitle>
						<CardDescription>
							Header auth state, theme switching, status badges, and shadcn
							panels are already available.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-5">
						<div className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/80 p-4">
							<div>
								<p className="panel-label">Core team</p>
								<p className="mt-2 text-sm text-muted-foreground">
									Enough structure to stand up review, ownership, and health
									modules quickly.
								</p>
							</div>
							<AvatarGroup>
								{team.map((member) => (
									<Avatar key={member}>
										<AvatarFallback>{member}</AvatarFallback>
									</Avatar>
								))}
							</AvatarGroup>
						</div>

						<div className="rounded-2xl border border-border/70 bg-background/80 p-4">
							<div className="flex items-center gap-2">
								<ShieldCheck className="size-4 text-emerald-500" />
								<p className="panel-label">Loading and empty states</p>
							</div>
							<div className="mt-4 space-y-3">
								<Skeleton className="h-4 w-28" />
								<Skeleton className="h-10 w-full rounded-xl" />
								<Skeleton className="h-10 w-4/5 rounded-xl" />
							</div>
						</div>

						<div className="rounded-2xl border border-border/70 bg-background/80 p-4">
							<div className="flex items-center gap-2">
								<Sparkles className="size-4 text-cyan-500" />
								<p className="panel-label">First routes to build</p>
							</div>
							<ul className="mt-3 space-y-2 text-sm text-muted-foreground">
								<li>Overview metrics pulled from Daphne services.</li>
								<li>Queue health and regression triage views.</li>
								<li>Launch controls guarded behind flags.gg checks.</li>
							</ul>
						</div>
					</CardContent>
				</Card>
			</section>
		</main>
	);
}
