import type { DashboardNavItem } from "#/lib/dashboard-navigation";
import { env } from "#/lib/env";

type OrgIdentity = {
	id?: string | null;
	slug?: string | null;
	name?: string | null;
};

export function isInternalBugfixesOrg(
	org: OrgIdentity | null | undefined,
): boolean {
	if (!env.providers.clerkConfigured) {
		return true;
	}

	if (!org) {
		return false;
	}

	const candidates = [org.id, org.slug, org.name]
		.map((value) => value?.trim().toLowerCase())
		.filter(Boolean);

	return env.access.internalOrgMatchers.some((matcher) =>
		candidates.includes(matcher.toLowerCase()),
	);
}

export function filterDashboardNavForOrg(
	items: DashboardNavItem[],
	org: OrgIdentity | null | undefined,
): DashboardNavItem[] {
	if (isInternalBugfixesOrg(org)) {
		return items;
	}

	return items.filter((item) => item.to !== "/accounts");
}
