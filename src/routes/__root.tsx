import { TanStackDevtools } from "@tanstack/react-devtools";
import {
	createRootRoute,
	HeadContent,
	ScriptOnce,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import DashboardShell from "#/components/dashboard-shell";
import AppFlagsProvider from "#/integrations/flags/provider";
import ClerkProvider from "../integrations/clerk/provider";
import appCss from "../styles.css?url";

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`;

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Daphne Dashboard",
			},
			{
				name: "description",
				content:
					"Frontend scaffold for the Daphne dashboard built with Bun, TanStack Start, shadcn, Clerk, and flags.gg.",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<ScriptOnce>{THEME_INIT_SCRIPT}</ScriptOnce>
				<HeadContent />
			</head>
			<body className="font-sans antialiased [overflow-wrap:anywhere]">
				<ClerkProvider>
					<AppFlagsProvider>
						<DashboardShell>{children}</DashboardShell>
						{import.meta.env.DEV ? (
							<TanStackDevtools
								config={{
									position: "bottom-right",
								}}
								plugins={[
									{
										name: "TanStack Router",
										render: <TanStackRouterDevtoolsPanel />,
									},
								]}
							/>
						) : null}
					</AppFlagsProvider>
				</ClerkProvider>
				<Scripts />
			</body>
		</html>
	);
}
