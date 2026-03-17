import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "#/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";

const settingsAreas = [
	{
		label: "AI settings",
		title:
			"Add provider credentials, model selection, and AI behavior controls",
		note: "Need forms, saved state, and validation from Daphne.",
	},
	{
		label: "Notification settings",
		title: "Add channel routing, destinations, and delivery preferences",
		note: "Need notification settings APIs plus status/error handling.",
	},
	{
		label: "Ticketing settings",
		title: "Add provider auth, project mapping, and sync defaults",
		note: "Need ticketing settings APIs and connection health states.",
	},
] as const;

export const Route = createFileRoute("/_dashboard/settings/")({
	component: SettingsPage,
});

function SettingsPage() {
	return (
		<main className="page-wrap space-y-6 px-4 pb-16 pt-10">
			<Card className="hero-panel overflow-hidden border-none text-white">
				<CardHeader className="space-y-5">
					<div className="flex flex-wrap items-center gap-2">
						<Badge className="bg-white/14 text-white shadow-none">
							Settings
						</Badge>
					</div>
					<div className="space-y-4">
						<CardTitle className="max-w-3xl font-display text-4xl leading-none font-semibold tracking-tight sm:text-5xl">
							Settings TODO
						</CardTitle>
						<p className="max-w-2xl text-base leading-7 text-slate-100/88">
							Build AI settings, notification settings, and ticketing settings
							here.
						</p>
					</div>
				</CardHeader>
				<CardContent className="grid gap-3 sm:grid-cols-3">
					<div className="rounded-2xl border border-white/12 bg-black/16 px-4 py-3">
						<p className="m-0 text-sm text-slate-100/76">AI providers</p>
						<p className="mt-3 mb-0 text-2xl font-semibold tracking-tight text-white">
							TODO
						</p>
					</div>
					<div className="rounded-2xl border border-white/12 bg-black/16 px-4 py-3">
						<p className="m-0 text-sm text-slate-100/76">
							Notification routing
						</p>
						<p className="mt-3 mb-0 text-2xl font-semibold tracking-tight text-white">
							TODO
						</p>
					</div>
					<div className="rounded-2xl border border-white/12 bg-black/16 px-4 py-3">
						<p className="m-0 text-sm text-slate-100/76">
							Ticketing connections
						</p>
						<p className="mt-3 mb-0 text-2xl font-semibold tracking-tight text-white">
							TODO
						</p>
					</div>
				</CardContent>
			</Card>

			<Card className="surface panel-border">
				<CardHeader>
					<CardTitle>What still needs building</CardTitle>
				</CardHeader>
				<CardContent className="grid gap-4 md:grid-cols-3">
					{settingsAreas.map((area) => (
						<div
							key={area.label}
							className="rounded-2xl border border-border/70 bg-background/72 p-5"
						>
							<p className="eyebrow">{area.label}</p>
							<p className="mt-3 mb-0 text-base font-semibold text-foreground">
								{area.title}
							</p>
							<p className="mt-2 mb-0 text-sm leading-6 text-muted-foreground">
								{area.note}
							</p>
						</div>
					))}
				</CardContent>
			</Card>
		</main>
	);
}
