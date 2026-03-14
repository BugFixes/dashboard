import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "#/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Separator } from "#/components/ui/separator";
import { env } from "#/lib/env";

const envVars = [
	{
		name: "VITE_APP_URL",
		required: true,
		description: "Public dashboard URL used for local links and redirects.",
	},
	{
		name: "VITE_DAPHNE_URL",
		required: true,
		description: "Local Daphne origin so both apps can run side by side.",
	},
	{
		name: "VITE_CLERK_PUBLISHABLE_KEY",
		required: true,
		description:
			"Client key for Clerk UI components and session bootstrapping.",
	},
	{
		name: "CLERK_SECRET_KEY",
		required: false,
		description: "Enables Clerk request middleware for SSR-aware auth flows.",
	},
	{
		name: "VITE_FLAGS_PROJECT_ID",
		required: false,
		description: "flags.gg project identifier for the dashboard environment.",
	},
	{
		name: "VITE_FLAGS_ENVIRONMENT_ID",
		required: false,
		description: "flags.gg environment id.",
	},
	{
		name: "VITE_FLAGS_AGENT_ID",
		required: false,
		description: "flags.gg agent id used by the React provider.",
	},
] as const;

const nextSteps = [
	"Replace the placeholder route cards with real data modules from Daphne.",
	"Protect authenticated routes with Clerk once the dashboard screens exist.",
	"Add typed flag keys around new modules before shipping gated UI.",
] as const;

export const Route = createFileRoute("/setup")({
	component: SetupPage,
});

function SetupPage() {
	return (
		<main className="page-wrap space-y-6 px-4 pb-16 pt-10">
			<Card className="surface panel-border">
				<CardHeader className="space-y-4">
					<Badge variant="outline" className="w-fit">
						Local development
					</Badge>
					<div className="space-y-3">
						<CardTitle className="text-3xl font-semibold tracking-tight sm:text-4xl">
							Boot the dashboard next to Daphne.
						</CardTitle>
						<p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
							The dashboard runs on <code>{env.appUrl}</code> by default and
							assumes Daphne is reachable at <code>{env.daphneUrl}</code>. Bun
							owns install and runtime; TanStack Start owns routing and SSR.
						</p>
					</div>
				</CardHeader>
				<CardContent className="grid gap-5 lg:grid-cols-2">
					<div className="rounded-2xl border border-border/70 bg-background/70 p-5">
						<p className="eyebrow">Commands</p>
						<pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950/95 p-4 text-sm text-slate-50">
							<code>{`cp .env.example .env.local
bun install
bun run dev`}</code>
						</pre>
					</div>
					<div className="rounded-2xl border border-border/70 bg-background/70 p-5">
						<p className="eyebrow">What is already wired</p>
						<ul className="mt-3 space-y-3 text-sm text-muted-foreground">
							<li>Clerk provider in the root shell with TanStack Start SDK.</li>
							<li>
								Optional Clerk request middleware in <code>src/start.ts</code>{" "}
								when a secret key is present.
							</li>
							<li>flags.gg provider gated behind public env configuration.</li>
							<li>
								Reusable shadcn components for cards, badges, buttons, and
								loading states.
							</li>
						</ul>
					</div>
				</CardContent>
			</Card>

			<Card className="surface panel-border">
				<CardHeader>
					<CardTitle>Environment contract</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{envVars.map((variable, index) => (
						<div key={variable.name} className="space-y-4">
							{index > 0 ? <Separator /> : null}
							<div className="flex flex-wrap items-start justify-between gap-3">
								<div className="space-y-2">
									<p className="m-0 font-mono text-sm font-medium text-foreground">
										{variable.name}
									</p>
									<p className="m-0 max-w-3xl text-sm text-muted-foreground">
										{variable.description}
									</p>
								</div>
								<Badge variant={variable.required ? "default" : "secondary"}>
									{variable.required ? "Required" : "Optional"}
								</Badge>
							</div>
						</div>
					))}
				</CardContent>
			</Card>

			<Card className="surface panel-border">
				<CardHeader>
					<CardTitle>Next implementation passes</CardTitle>
				</CardHeader>
				<CardContent>
					<ol className="space-y-3 pl-5 text-sm text-muted-foreground">
						{nextSteps.map((step) => (
							<li key={step}>{step}</li>
						))}
					</ol>
				</CardContent>
			</Card>
		</main>
	);
}
