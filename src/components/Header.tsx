import { Link } from "@tanstack/react-router";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { env } from "#/lib/env";
import ClerkHeader from "../integrations/clerk/header-user.tsx";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
	return (
		<header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-xl">
			<nav className="page-wrap flex flex-wrap items-center gap-3 py-4">
				<h2 className="m-0 flex-shrink-0 text-base font-semibold tracking-tight">
					<Link
						to="/"
						className="inline-flex items-center gap-3 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 no-underline shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
					>
						<span className="status-dot bg-emerald-500" />
						<span className="font-display text-sm font-semibold tracking-[0.18em] uppercase">
							Daphne
						</span>
						<Badge variant="secondary" className="hidden sm:inline-flex">
							Dashboard
						</Badge>
					</Link>
				</h2>

				<div className="order-3 flex w-full flex-wrap items-center gap-2 text-sm font-medium sm:order-2 sm:w-auto">
					<Link
						to="/"
						className="nav-link"
						activeOptions={{ exact: true }}
						activeProps={{ className: "nav-link is-active" }}
					>
						Overview
					</Link>
					<Link
						to="/setup"
						className="nav-link"
						activeProps={{ className: "nav-link is-active" }}
					>
						Setup
					</Link>
					<a
						href="https://tanstack.com/start/latest/docs/framework/react/overview"
						className="nav-link"
						target="_blank"
						rel="noreferrer"
					>
						TanStack Start
					</a>
					<a
						href="https://clerk.com/docs/references/tanstack-start/overview"
						className="nav-link"
						target="_blank"
						rel="noreferrer"
					>
						Clerk
					</a>
				</div>

				<div className="ml-auto flex items-center gap-2 sm:order-3">
					<Badge variant="outline" className="hidden sm:inline-flex">
						Bun runtime
					</Badge>
					<Button
						asChild
						variant="ghost"
						size="sm"
						className="hidden md:inline-flex"
					>
						<a href={env.daphneUrl} target="_blank" rel="noreferrer">
							Open Daphne
						</a>
					</Button>
					<ClerkHeader />
					<ThemeToggle />
				</div>
			</nav>
		</header>
	);
}
