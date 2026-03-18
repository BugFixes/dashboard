import { OrganizationSwitcher, useOrganization } from "@clerk/react";
import { Link, useLocation } from "@tanstack/react-router";
import { Menu, PanelLeft, Plus, X } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import AdminAccessGate from "#/components/admin-access-gate";
import ClerkHeader from "#/integrations/clerk/header-user";
import {
	dashboardNavItems,
	getActiveDashboardItem,
} from "#/lib/dashboard-navigation";
import { filterDashboardNavForOrg } from "#/lib/internal-access";
import ThemeToggle from "./ThemeToggle";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

export default function DashboardShell({ children }: { children: ReactNode }) {
	const { organization, isLoaded: isOrgLoaded } = useOrganization();
	const pathname = useLocation({
		select: (location) => location.pathname,
	});
	const activeItem = getActiveDashboardItem(pathname);
	const visibleNavItems = filterDashboardNavForOrg(
		dashboardNavItems,
		organization,
	);
	const [mobileNavOpen, setMobileNavOpen] = useState(false);
	const previousPathnameRef = useRef(pathname);

	useEffect(() => {
		if (previousPathnameRef.current === pathname) {
			return;
		}

		previousPathnameRef.current = pathname;
		setMobileNavOpen(false);
	}, [pathname]);

	useEffect(() => {
		if (!mobileNavOpen) {
			return;
		}

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setMobileNavOpen(false);
			}
		};

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		window.addEventListener("keydown", onKeyDown);

		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener("keydown", onKeyDown);
		};
	}, [mobileNavOpen]);

	return (
		<div className="dashboard-shell min-h-screen lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
			<aside className="hidden p-4 lg:block">
				<div className="dashboard-sidebar-frame flex flex-col gap-6 rounded-[28px] border border-[var(--line)] p-5">
					<div className="space-y-4">
						<div className="flex items-start justify-between gap-3">
							<div className="space-y-4">
								<Badge variant="outline" className="rounded-full px-3 py-1">
									Bugfixes dashboard
								</Badge>

								<div className="flex flex-col gap-4">
									<div className="flex flex-col gap-2">
										<OrganizationSwitcher
											hidePersonal
											afterCreateOrganizationUrl="/"
											afterLeaveOrganizationUrl="/"
											afterSelectOrganizationUrl="/"
											appearance={{
												elements: {
													rootBox: "w-full",
													organizationSwitcherTrigger:
														"flex items-center gap-3 w-full p-2 rounded-xl border border-[var(--line)] bg-white dark:bg-zinc-900 shadow-sm transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800",
													organizationPreviewMainIdentifier:
														"font-semibold text-sm truncate",
													organizationPreviewSecondaryIdentifier:
														"text-xs text-zinc-500",
													organizationPreviewAvatarBox: "size-8 rounded-lg",
												},
											}}
										/>
										{!isOrgLoaded && (
											<div className="flex items-center gap-2 p-2">
												<div className="size-8 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
												<div className="h-4 w-24 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
											</div>
										)}
										{isOrgLoaded && !organization && (
											<div className="flex items-center gap-2 rounded-xl border border-dashed border-[var(--line)] p-2 text-xs text-[var(--sea-ink-soft)]">
												<Plus className="size-4" />
												<span>Select or create an organization</span>
											</div>
										)}
									</div>

									<Link
										to="/"
										className="block no-underline"
										activeOptions={{ exact: true }}
									>
										<p className="m-0 font-display text-2xl font-semibold tracking-tight text-[var(--sea-ink)]">
											Bugfixes
										</p>
										<p className="m-0 text-sm leading-6 text-[var(--sea-ink-soft)]">
											Customer dashboard for agents, bugs, tickets, notifications,
											members, and settings.
										</p>
									</Link>
								</div>
							</div>
							<div className="rounded-2xl border border-[var(--chip-line)] bg-[var(--chip-bg)] p-3 shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
								<PanelLeft className="size-5 text-primary" />
							</div>
						</div>
					</div>

					<nav className="space-y-2" aria-label="Primary">
						{visibleNavItems.map((item) => {
							const Icon = item.icon;

							return (
								<Link
									key={item.to}
									to={item.to}
									activeOptions={item.exact ? { exact: true } : undefined}
									className="dashboard-nav-link"
									activeProps={{ className: "dashboard-nav-link is-active" }}
								>
									<span className="dashboard-nav-icon">
										<Icon className="size-4" />
									</span>
									<span className="min-w-0">
										<span className="block text-sm font-semibold text-current">
											{item.label}
										</span>
										<span className="mt-1 block text-sm text-current/72">
											{item.description}
										</span>
									</span>
								</Link>
							);
						})}
					</nav>
				</div>
			</aside>

			<div className="min-h-screen">
				<header className="dashboard-topbar sticky top-0 z-40 border-b border-[var(--line)] px-4 py-4 backdrop-blur-xl lg:px-8">
					<div className="flex items-center justify-between gap-4">
						<div className="flex min-w-0 items-start gap-3">
							<Button
								type="button"
								variant="outline"
								size="icon-sm"
								className="mt-1 lg:hidden"
								onClick={() => setMobileNavOpen(true)}
								aria-expanded={mobileNavOpen}
								aria-controls="mobile-dashboard-nav"
								aria-label="Open navigation"
							>
								<Menu />
							</Button>
							<div className="min-w-0">
								<p className="eyebrow">Workspace</p>
								<h1 className="mt-2 mb-0 truncate font-display text-2xl font-semibold tracking-tight text-[var(--sea-ink)]">
									{activeItem.label}
								</h1>
								<p className="mt-1 mb-0 max-w-2xl text-sm leading-6 text-[var(--sea-ink-soft)]">
									{activeItem.description}
								</p>
							</div>
						</div>

						<div className="flex items-center gap-2">
							<ThemeToggle />
							<ClerkHeader />
						</div>
					</div>
				</header>

				<div className="relative">
					<AdminAccessGate>{children}</AdminAccessGate>
				</div>
			</div>

			{mobileNavOpen ? (
				<div className="lg:hidden">
					<button
						type="button"
						className="fixed inset-0 z-50 bg-slate-950/35 backdrop-blur-sm"
						onClick={() => setMobileNavOpen(false)}
						aria-label="Close navigation"
					/>
					<div
						id="mobile-dashboard-nav"
						className="dashboard-mobile-sheet fixed inset-y-0 left-0 z-50 flex w-[min(88vw,22rem)] flex-col gap-5 overflow-y-auto px-4 py-5"
					>
								<div className="flex flex-col gap-5">
									<div className="flex items-start justify-between gap-3">
										<div className="flex flex-col gap-2">
											<Badge
												variant="outline"
												className="w-fit rounded-full px-3 py-1"
											>
												Organization
											</Badge>
											<OrganizationSwitcher
												hidePersonal
												afterCreateOrganizationUrl="/"
												afterLeaveOrganizationUrl="/"
												afterSelectOrganizationUrl="/"
												appearance={{
													elements: {
														rootBox: "w-full",
														organizationSwitcherTrigger:
															"flex items-center gap-3 w-full p-2 rounded-xl border border-[var(--line)] bg-white dark:bg-zinc-900 shadow-sm transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800",
														organizationPreviewMainIdentifier:
															"font-semibold text-sm truncate",
														organizationPreviewSecondaryIdentifier:
															"text-xs text-zinc-500",
														organizationPreviewAvatarBox: "size-8 rounded-lg",
													},
												}}
											/>
											{!organization && (
												<div className="flex items-center gap-2 rounded-xl border border-dashed border-[var(--line)] p-2 text-xs text-[var(--sea-ink-soft)]">
													<Plus className="size-4" />
													<span>Select or create an organization</span>
												</div>
											)}
										</div>
										<Button
											type="button"
											variant="outline"
											size="icon-sm"
											onClick={() => setMobileNavOpen(false)}
											aria-label="Close navigation"
											className="mt-1"
										>
											<X />
										</Button>
									</div>

									<div className="space-y-2">
										<Badge variant="outline" className="rounded-full px-3 py-1">
											Primary navigation
										</Badge>
										<p className="m-0 font-display text-2xl font-semibold tracking-tight text-[var(--sea-ink)]">
											Bugfixes
										</p>
										<p className="m-0 text-sm leading-6 text-[var(--sea-ink-soft)]">
											Choose a section. Build the real workflow inside the stable
											shell.
										</p>
									</div>
								</div>

						<nav className="space-y-2" aria-label="Mobile primary">
							{visibleNavItems.map((item) => {
								const Icon = item.icon;

								return (
									<Link
										key={item.to}
										to={item.to}
										activeOptions={item.exact ? { exact: true } : undefined}
										className="dashboard-nav-link"
										activeProps={{ className: "dashboard-nav-link is-active" }}
									>
										<span className="dashboard-nav-icon">
											<Icon className="size-4" />
										</span>
										<span className="min-w-0">
											<span className="block text-sm font-semibold text-current">
												{item.shortLabel}
											</span>
											<span className="mt-1 block text-sm text-current/72">
												{item.description}
											</span>
										</span>
									</Link>
								);
							})}
						</nav>
					</div>
				</div>
			) : null}
		</div>
	);
}
