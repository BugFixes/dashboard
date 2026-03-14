import { Link } from "@tanstack/react-router";
import { ArrowRight, CircleDashed, Sparkles } from "lucide-react";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import type { DashboardRoutePath } from "#/lib/dashboard-navigation";

type PlaceholderDetail = {
	label: string;
	title: string;
	note: string;
};

type PlaceholderAction = {
	label: string;
	to: DashboardRoutePath;
};

export default function DashboardAreaPlaceholder({
	badge,
	title,
	description,
	primaryAction,
	secondaryAction,
	details,
	checklist,
}: {
	badge: string;
	title: string;
	description: string;
	primaryAction: PlaceholderAction;
	secondaryAction?: PlaceholderAction;
	details: PlaceholderDetail[];
	checklist: string[];
}) {
	return (
		<main className="page-wrap space-y-6 px-4 pb-16 pt-8">
			<section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
				<Card className="hero-panel overflow-hidden border-none text-white">
					<CardHeader className="space-y-5">
						<div className="flex flex-wrap items-center gap-2">
							<Badge className="bg-white/14 text-white shadow-none">
								{badge}
							</Badge>
							<Badge
								variant="secondary"
								className="bg-white/10 text-white shadow-none"
							>
								Foundation module
							</Badge>
						</div>
						<div className="space-y-4">
							<CardTitle className="max-w-3xl font-display text-4xl leading-none font-semibold tracking-tight sm:text-5xl">
								{title}
							</CardTitle>
							<CardDescription className="max-w-2xl text-base leading-7 text-slate-100/88">
								{description}
							</CardDescription>
						</div>
					</CardHeader>
					<CardContent className="flex flex-wrap items-center gap-3">
						<Button asChild size="lg" className="rounded-full">
							<Link to={primaryAction.to}>
								{primaryAction.label}
								<ArrowRight />
							</Link>
						</Button>
						{secondaryAction ? (
							<Button
								asChild
								variant="secondary"
								size="lg"
								className="rounded-full border border-white/12 bg-white/10 text-white hover:bg-white/16"
							>
								<Link to={secondaryAction.to}>{secondaryAction.label}</Link>
							</Button>
						) : null}
					</CardContent>
				</Card>

				<Card className="surface panel-border">
					<CardHeader className="space-y-3">
						<div className="flex items-center gap-3">
							<div className="rounded-2xl border border-border/70 bg-background/80 p-3">
								<CircleDashed className="size-5 text-primary" />
							</div>
							<div>
								<p className="eyebrow">Why this screen exists</p>
								<CardTitle className="mt-2 text-2xl font-semibold tracking-tight">
									Stable shell before live admin workflows
								</CardTitle>
							</div>
						</div>
						<CardDescription className="text-sm leading-7 sm:text-base">
							Each top-level area can ship iteratively without forcing another
							layout pass. Navigation, spacing, and admin chrome stay fixed
							while domain modules replace these placeholders.
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-3 sm:grid-cols-3">
						{details.map((detail) => (
							<div
								key={detail.label}
								className="rounded-2xl border border-border/70 bg-background/72 p-4"
							>
								<p className="eyebrow">{detail.label}</p>
								<p className="mt-3 mb-0 text-base font-semibold text-foreground">
									{detail.title}
								</p>
								<p className="mt-2 mb-0 text-sm leading-6 text-muted-foreground">
									{detail.note}
								</p>
							</div>
						))}
					</CardContent>
				</Card>
			</section>

			<Card className="surface panel-border fade-up">
				<CardHeader className="space-y-3">
					<div className="flex items-center gap-3">
						<div className="rounded-2xl border border-border/70 bg-background/80 p-3">
							<Sparkles className="size-5 text-primary" />
						</div>
						<div>
							<p className="eyebrow">Next implementation pass</p>
							<CardTitle className="mt-2 text-2xl font-semibold tracking-tight">
								Replace the placeholder with real operator workflow
							</CardTitle>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<ol className="m-0 space-y-3 pl-5 text-sm leading-7 text-muted-foreground sm:text-base">
						{checklist.map((item) => (
							<li key={item}>{item}</li>
						))}
					</ol>
				</CardContent>
			</Card>
		</main>
	);
}
