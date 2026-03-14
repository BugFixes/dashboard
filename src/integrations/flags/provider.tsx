import { FlagsProvider } from "@flags-gg/react-library";
import { env } from "#/lib/env";

export default function AppFlagsProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	if (!env.flags.isConfigured) {
		return <>{children}</>;
	}

	return (
		<FlagsProvider
			options={{
				projectId: env.flags.projectId,
				environmentId: env.flags.environmentId,
				agentId: env.flags.agentId,
			}}
		>
			{children}
		</FlagsProvider>
	);
}
