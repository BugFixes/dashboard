import { ClerkProvider } from "@clerk/tanstack-react-start";
import { env } from "#/lib/env";

export default function DashboardClerkProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	if (!env.clerkPublishableKey) {
		return <>{children}</>;
	}

	return (
		<ClerkProvider publishableKey={env.clerkPublishableKey} afterSignOutUrl="/">
			{children}
		</ClerkProvider>
	);
}
