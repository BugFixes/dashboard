# Bugfixes Dashboard

Frontend scaffold for the Bugfixes operator dashboard using Bun, TanStack Start, shadcn, Clerk, and flags.gg.

## Local development

1. Copy the environment template and fill in the keys you have.
2. Install dependencies with Bun.
3. Start the dashboard on port `3001`.

```bash
cp .env.example .env.local
bun install
bun run dev
```

The app is configured to run alongside Daphne, which is expected at `http://localhost:3000` by default.
This foundation currently provides:

- a persistent admin shell with desktop and mobile navigation
- overview, members, agents, bugs, tickets, notifications, settings, and internal accounts sections
- organization-first onboarding with setup progress, membership entry points, and provider configuration callouts
- agent structure management for projects, sub-projects, environments, and API keys
- a recent activity overview with live, snapshot, and empty-state modes
- a Clerk-backed admin sign-in gate when auth keys are configured

## App structure

The dashboard now uses a two-layer route model:

- `src/routes/__root.tsx` owns the document shell, metadata, and global providers.
- `src/routes/_dashboard/route.tsx` owns the persistent operator shell, navigation, and admin gate.
- `src/routes/_dashboard/index.tsx` is the overview route.
- `src/routes/_dashboard/<section>/index.tsx` owns each top-level admin area and leaves room for future nested routes in that section directory.

Current top-level route map:

- `/` overview
- `/members` members
- `/accounts` accounts
- `/agents` agents
- `/bugs` bugs
- `/tickets` tickets
- `/notifications` notifications
- `/settings` settings

## Environment

`VITE_APP_URL`
Public dashboard URL. Defaults to `http://localhost:3001`.

`VITE_DAPHNE_URL`
Local Daphne origin used for cross-app links. Defaults to `http://localhost:3000`.

`VITE_CLERK_PUBLISHABLE_KEY`
Required for Clerk UI and client session bootstrapping.

`CLERK_SECRET_KEY`
Optional in the current scaffold, but required if you want Clerk request middleware and SSR-aware auth flows enabled.

`VITE_FLAGS_PROJECT_ID`
Optional flags.gg project id.

`VITE_FLAGS_ENVIRONMENT_ID`
Optional flags.gg environment id.

`VITE_FLAGS_AGENT_ID`
Optional flags.gg agent id.

## Scripts

```bash
bun run dev
bun run build
bun run preview
bun run test
bun run lint
bun run format
bun run check
```

## GitHub enforcement

The repository includes a GitHub Actions workflow at `.github/workflows/ci.yml` that runs these checks for pull requests into `main`:

- `CI / Check`
- `CI / Test`
- `CI / Build`

To make failed checks block merges, add a branch protection rule or ruleset for `main` in GitHub and mark those three status checks as required.

## Scaffold contents

- `src/start.ts` adds Clerk request middleware when `CLERK_SECRET_KEY` is present.
- `src/routes/__root.tsx` wires the root document, Clerk provider, flags.gg provider, and global page chrome.
- `src/routes/_dashboard/route.tsx` mounts the shared operator shell for all dashboard routes.
- `src/routes/_dashboard/index.tsx` is the dashboard overview with recent bug intake and system activity.
- `src/routes/_dashboard/agents/index.tsx` now surfaces project, sub-project, environment, and API key management together.
- `src/routes/_dashboard/settings/index.tsx` documents the environment contract, local bootstrap flow, and auth behavior.
- `src/components/ui/*` contains the first shadcn primitives added for route implementation.

## Adding more shadcn components

Use the repository-standard shadcn invocation for new components:

```bash
pnpm dlx shadcn@latest add dialog table input form
```

## References

- [TanStack Start docs](https://tanstack.com/start/latest/docs/framework/react/overview)
- [shadcn docs](https://ui.shadcn.com/docs)
- [Clerk TanStack Start docs](https://clerk.com/docs/references/tanstack-start/overview)
- [flags.gg docs](https://docs.flags.gg)
