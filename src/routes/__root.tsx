import { TanStackDevtools } from "@tanstack/react-devtools";
import {
	createRootRoute,
	HeadContent,
	Outlet,
	ScriptOnce,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { error } from "bugfixes";
import AppFlagsProvider from "#/integrations/flags/provider";
import { env } from "#/lib/env";
import ClerkProvider from "../integrations/clerk/provider";
import appCss from "../styles.css?url";

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`;

export const Route = createRootRoute({
	errorComponent: ({ error: err }) => {
		error("unhandled route error", err);
		return <div>Something went wrong</div>;
	},
	component: () => <Outlet />,
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
				title: env.appName,
			},
			{
				name: "description",
				content:
					"Customer dashboard for Bugfixes agents, bug intake, tickets, notifications, members, and settings.",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "icon",
				type: "image/png",
				href: "/favicon.png",
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
						{children}
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
