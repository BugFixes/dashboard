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
		description:
			"Organization onboarding, recent bug intake, and workspace activity.",
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
			"Internal support tooling that stays outside the customer onboarding flow.",
		icon: Building2,
		futureChildren: ["/accounts/$accountId"],
	},
	{
		to: "/members",
		routeFile: "src/routes/_dashboard/members/index.tsx",
		label: "Members",
		shortLabel: "Members",
		description: "Manage your team’s roles, access levels, and membership.",
		icon: Users,
		futureChildren: [],
	},
	{
		to: "/agents",
		routeFile: "src/routes/_dashboard/agents/index.tsx",
		label: "Agents",
		shortLabel: "Agents",
		description:
			"Model projects and environments, then create and audit agent keys.",
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
		description:
			"Connected ticketing workflows, sync status, and escalation history.",
		icon: Ticket,
		futureChildren: ["/tickets/$ticketId"],
	},
	{
		to: "/notifications",
		routeFile: "src/routes/_dashboard/notifications/index.tsx",
		label: "Notifications",
		shortLabel: "Notifications",
		description: "Notification delivery, channel health, and retry pressure.",
		icon: BellRing,
		futureChildren: ["/notifications/$notificationId"],
	},
	{
		to: "/settings",
		routeFile: "src/routes/_dashboard/settings/index.tsx",
		label: "Settings",
		shortLabel: "Settings",
		description:
			"Organization setup progress plus AI, notification, and ticketing settings.",
		icon: Settings2,
		futureChildren: [
			"/settings/ai",
			"/settings/notifications",
			"/settings/ticketing",
		],
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
			"Own the persistent app shell, primary navigation, and auth gate.",
			"Wrap every dashboard screen so section routes stay focused on page content.",
		],
	},
	{
		owner: "_dashboard/<section>/index",
		responsibilities: [
			"Own section content only and reserve the directory for nested detail routes.",
			"Keep future child routes colocated with their parent section.",
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
