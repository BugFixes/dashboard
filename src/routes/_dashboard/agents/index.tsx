import { createFileRoute } from "@tanstack/react-router";
import { AgentCredentialsPage } from "#/routes/_dashboard/api-keys/index";

export const Route = createFileRoute("/_dashboard/agents/")({
	component: AgentCredentialsPage,
});
