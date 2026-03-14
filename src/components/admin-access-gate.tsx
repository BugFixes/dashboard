import { SignInButton, useAuth } from "@clerk/react";
import { Link } from "@tanstack/react-router";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import { env } from "#/lib/env";

export default function AdminAccessGate({
	children,
}: {
	children: React.ReactNode;
}) {
	if (!env.providers.clerkConfigured) {
		return (
			<div className="space-y-4">
				<div className="page-wrap px-4 pt-6">
					<Card className="surface panel-border">
						<CardContent className="flex flex-col gap-3 py-5 md:flex-row md:items-center md:justify-between">
							<div className="space-y-2">
								<div className="flex flex-wrap items-center gap-2">
									<Badge variant="outline">Local admin mode</Badge>
									<Badge variant="secondary">Auth bypassed</Badge>
								</div>
								<p className="m-0 text-sm leading-6 text-muted-foreground">
									Clerk is not configured, so the dashboard stays open for local
									development. Add auth keys in Settings when you want a real
									sign-in gate.
								</p>
							</div>
							<Button asChild variant="outline" className="shrink-0">
								<Link to="/settings">Open settings</Link>
							</Button>
						</CardContent>
					</Card>
				</div>
				{children}
			</div>
		);
	}

	return <AuthenticatedAdminAccess>{children}</AuthenticatedAdminAccess>;
}

function AuthenticatedAdminAccess({ children }: { children: React.ReactNode }) {
	const { isLoaded, userId } = useAuth();

	if (!isLoaded) {
		return (
			<div className="page-wrap space-y-6 px-4 pb-16 pt-8">
				<Skeleton className="h-20 rounded-[28px]" />
				<Skeleton className="h-72 rounded-[32px]" />
				<div className="grid gap-4 md:grid-cols-3">
					<Skeleton className="h-40 rounded-[28px]" />
					<Skeleton className="h-40 rounded-[28px]" />
					<Skeleton className="h-40 rounded-[28px]" />
				</div>
			</div>
		);
	}

	if (!userId) {
		return (
			<main className="page-wrap space-y-6 px-4 pb-16 pt-10">
				<Card className="hero-panel overflow-hidden border-none text-white">
					<CardHeader className="space-y-4">
						<div className="flex flex-wrap items-center gap-2">
							<Badge className="bg-white/14 text-white shadow-none">
								Admin access
							</Badge>
							<Badge
								variant="secondary"
								className="bg-white/10 text-white shadow-none"
							>
								Clerk protected
							</Badge>
						</div>
						<CardTitle className="max-w-3xl font-display text-4xl leading-none font-semibold tracking-tight sm:text-5xl">
							Sign in to open the operator dashboard.
						</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-wrap items-center gap-3">
						<SignInButton mode="modal">
							<Button size="lg" className="rounded-full">
								Sign in
							</Button>
						</SignInButton>
						<Button
							asChild
							variant="secondary"
							size="lg"
							className="rounded-full"
						>
							<Link to="/settings">Review setup</Link>
						</Button>
					</CardContent>
				</Card>

				<Card className="surface panel-border">
					<CardContent className="grid gap-4 py-6 md:grid-cols-3">
						<AccessNote
							title="Accounts and agents"
							description="The first pass trusts any authenticated Clerk session to access admin screens."
						/>
						<AccessNote
							title="Bug activity"
							description="Recent stacktraces, ticket creation, and notification flow stay behind the sign-in gate."
						/>
						<AccessNote
							title="Local development"
							description="Remove the Clerk keys to bypass auth locally while the dashboard is still under construction."
						/>
					</CardContent>
				</Card>
			</main>
		);
	}

	return children;
}

function AccessNote({
	title,
	description,
}: {
	title: string;
	description: string;
}) {
	return (
		<div className="rounded-3xl border border-border/70 bg-background/75 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
			<p className="text-base font-semibold tracking-tight text-foreground">
				{title}
			</p>
			<p className="mt-3 text-sm leading-6 text-muted-foreground">
				{description}
			</p>
		</div>
	);
}
