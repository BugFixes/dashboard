import type { LucideIcon } from "lucide-react";
import {
	BellRing,
	Bot,
	Bug,
	Building2,
	House,
	Settings2,
	Ticket,
	Users,
} from "lucide-react";

export type DashboardRoutePath =
	| "/"
	| "/accounts"
	| "/agents"
	| "/bugs"
	| "/members"
	| "/tickets"
	| "/notifications"
	| "/settings";

export type DashboardNavItem = {
	to: DashboardRoutePath;
	routeFile: string;
	label: string;
	shortLabel: string;
	description: string;
	icon: LucideIcon;
	exact?: boolean;
	futureChildren: string[];
};

export const dashboardNavItems: DashboardNavItem[] = [
	{
		to: "/",
		routeFile: "src/routes/_dashboard/index.tsx",
		label: "Overview",
		shortLabel: "Overview",
		description: "Recent bug intake, system activity, and admin posture.",
		icon: House,
		exact: true,
		futureChildren: [],
	},
	{
		to: "/accounts",
		routeFile: "src/routes/_dashboard/accounts/index.tsx",
		label: "Accounts",
		shortLabel: "Accounts",
		description:
			"Customer accounts, onboarding state, and environment ownership.",
		icon: Building2,
		futureChildren: ["/accounts/$accountId"],
	},
	{
		to: "/members",
		routeFile: "src/routes/_dashboard/members/index.tsx",
		label: "Members",
		shortLabel: "Members",
		description: "Organization member roles, access levels, and role assignment.",
		icon: Users,
		futureChildren: [],
	},
	{
		to: "/agents",
		routeFile: "src/routes/_dashboard/agents/index.tsx",
		label: "Agents",
		shortLabel: "Agents",
		description: "Agent creation, key rotation, status, and delivery posture.",
		icon: Bot,
		futureChildren: ["/agents/$agentId"],
	},
	{
		to: "/bugs",
		routeFile: "src/routes/_dashboard/bugs/index.tsx",
		label: "Bugs",
		shortLabel: "Bugs",
		description: "Stacktraces, deduplication, and investigation entrypoint.",
		icon: Bug,
		futureChildren: ["/bugs/$bugId"],
	},
	{
		to: "/tickets",
		routeFile: "src/routes/_dashboard/tickets/index.tsx",
		label: "Tickets",
		shortLabel: "Tickets",
		description: "Linked issue flow, sync status, and escalation history.",
		icon: Ticket,
		futureChildren: ["/tickets/$ticketId"],
	},
	{
		to: "/notifications",
		routeFile: "src/routes/_dashboard/notifications/index.tsx",
		label: "Notifications",
		shortLabel: "Notifications",
		description: "Outbound alerts, delivery health, and retry pressure.",
		icon: BellRing,
		futureChildren: ["/notifications/$notificationId"],
	},
	{
		to: "/settings",
		routeFile: "src/routes/_dashboard/settings/index.tsx",
		label: "Settings",
		shortLabel: "Settings",
		description:
			"Admin auth, local wiring, and dashboard environment contract.",
		icon: Settings2,
		futureChildren: ["/settings/auth", "/settings/integrations"],
	},
];

export const dashboardLayoutResponsibilities = [
	{
		owner: "__root",
		responsibilities: [
			"Own the document shell, metadata, global CSS, and providers.",
			"Do not contain dashboard navigation or section-specific chrome.",
		],
	},
	{
		owner: "_dashboard/route",
		responsibilities: [
			"Own the persistent operator shell, primary navigation, and admin gate.",
			"Wrap every dashboard screen so section routes stay focused on page content.",
		],
	},
	{
		owner: "_dashboard/<section>/index",
		responsibilities: [
			"Own section content only and reserve the directory for nested detail routes.",
			"Keep future child routes colocated with their parent admin area.",
		],
	},
] as const;

export function getActiveDashboardItem(pathname: string): DashboardNavItem {
	return (
		dashboardNavItems.find((item) =>
			item.exact
				? pathname === item.to
				: pathname === item.to || pathname.startsWith(`${item.to}/`),
		) ?? dashboardNavItems[0]
	);
}
