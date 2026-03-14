import { env } from "#/lib/env";

export default function Footer() {
	const year = new Date().getFullYear();

	return (
		<footer className="mt-12 border-t border-[var(--line)] px-4 pb-10 pt-8 text-[var(--sea-ink-soft)]">
			<div className="page-wrap flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div className="space-y-1">
					<p className="m-0 text-sm font-medium text-[var(--sea-ink)]">
						Daphne dashboard scaffold
					</p>
					<p className="m-0 text-sm">
						Bun, TanStack Start, shadcn, Clerk, and flags.gg are wired and ready
						for route work.
					</p>
					<p className="m-0 text-xs uppercase tracking-[0.18em]">
						&copy; {year} Chewed Feed
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-3 text-sm">
					<a
						href={env.daphneUrl}
						target="_blank"
						rel="noreferrer"
						className="nav-link"
					>
						Daphne local
					</a>
					<a
						href="https://ui.shadcn.com/docs"
						target="_blank"
						rel="noreferrer"
						className="nav-link"
					>
						shadcn docs
					</a>
					<a
						href="https://docs.flags.gg"
						target="_blank"
						rel="noreferrer"
						className="nav-link"
					>
						flags.gg docs
					</a>
				</div>
			</div>
		</footer>
	);
}
