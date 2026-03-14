import type { LucideIcon } from "lucide-react";
import {
	BellRing,
	Bot,
	Bug,
	Building2,
	House,
	Settings2,
	Ticket,
} from "lucide-react";

export type DashboardRoutePath =
	| "/"
	| "/accounts"
	| "/agents"
	| "/bugs"
	| "/tickets"
	| "/notifications"
	| "/settings";

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
		description: "Recent bug intake, system activity, and admin posture.",
		icon: House,
		exact: true,
	},
	{
		to: "/accounts",
		label: "Accounts",
		shortLabel: "Accounts",
		description:
			"Customer accounts, onboarding state, and environment ownership.",
		icon: Building2,
	},
	{
		to: "/agents",
		label: "Agents",
		shortLabel: "Agents",
		description: "Agent creation, key rotation, status, and delivery posture.",
		icon: Bot,
	},
	{
		to: "/bugs",
		label: "Bugs",
		shortLabel: "Bugs",
		description: "Stacktraces, deduplication, and investigation entrypoint.",
		icon: Bug,
	},
	{
		to: "/tickets",
		label: "Tickets",
		shortLabel: "Tickets",
		description: "Linked issue flow, sync status, and escalation history.",
		icon: Ticket,
	},
	{
		to: "/notifications",
		label: "Notifications",
		shortLabel: "Notifications",
		description: "Outbound alerts, delivery health, and retry pressure.",
		icon: BellRing,
	},
	{
		to: "/settings",
		label: "Settings",
		shortLabel: "Settings",
		description:
			"Admin auth, local wiring, and dashboard environment contract.",
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
