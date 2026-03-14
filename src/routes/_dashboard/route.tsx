import { createFileRoute, Outlet } from "@tanstack/react-router";
import DashboardShell from "#/components/dashboard-shell";

export const Route = createFileRoute("/_dashboard")({
	component: DashboardLayoutRoute,
});

function DashboardLayoutRoute() {
	return (
		<DashboardShell>
			<Outlet />
		</DashboardShell>
	);
}
