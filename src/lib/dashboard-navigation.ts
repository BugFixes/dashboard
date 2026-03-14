import type { LucideIcon } from "lucide-react";
import { House, Inbox, Rocket, SearchCheck, Settings2 } from "lucide-react";

export type DashboardRoutePath =
	| "/"
	| "/intake"
	| "/investigations"
	| "/ship-room"
	| "/setup";

export type DashboardNavItem = {
	to: DashboardRoutePath;
	label: string;
	shortLabel: string;
	description: string;
	icon: LucideIcon;
	exact?: boolean;
};

export const dashboardNavItems: DashboardNavItem[] = [
	{
		to: "/",
		label: "Overview",
		shortLabel: "Overview",
		description: "Shift summary, live queue posture, and operator watchlist.",
		icon: House,
		exact: true,
	},
	{
		to: "/intake",
		label: "Intake",
		shortLabel: "Intake",
		description:
			"New reports, duplication checks, and first-response workflow.",
		icon: Inbox,
	},
	{
		to: "/investigations",
		label: "Investigations",
		shortLabel: "Investigations",
		description: "Active debugging work, blockers, and reproduction capture.",
		icon: SearchCheck,
	},
	{
		to: "/ship-room",
		label: "Ship room",
		shortLabel: "Ship room",
		description: "Verification, release readiness, and handoff coordination.",
		icon: Rocket,
	},
	{
		to: "/setup",
		label: "Setup",
		shortLabel: "Setup",
		description: "Environment contract, local dev wiring, and bootstrap notes.",
		icon: Settings2,
	},
];

export function getActiveDashboardItem(pathname: string): DashboardNavItem {
	return (
		dashboardNavItems.find((item) =>
			item.exact
				? pathname === item.to
				: pathname === item.to || pathname.startsWith(`${item.to}/`),
		) ?? dashboardNavItems[0]
	);
}
