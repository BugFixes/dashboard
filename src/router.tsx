import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setDefaultConfig } from "bugfixes";
import { env } from "#/lib/env";
import { routeTree } from "./routeTree.gen";

if (env.bugfixes.isConfigured) {
	setDefaultConfig({
		agentKey: env.bugfixes.agentKey,
		agentSecret: env.bugfixes.agentSecret,
	});
}

export function getRouter() {
	const router = createTanStackRouter({
		routeTree,

		scrollRestoration: true,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0,
	});

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
