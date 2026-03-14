# Daphne Dashboard

Frontend scaffold for the Daphne dashboard using Bun, TanStack Start, shadcn, Clerk, and flags.gg.

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

## Scaffold contents

- `src/start.ts` adds Clerk request middleware when `CLERK_SECRET_KEY` is present.
- `src/routes/__root.tsx` wires the root document, Clerk provider, flags.gg provider, and the shared shell.
- `src/routes/index.tsx` is the dashboard landing scaffold.
- `src/routes/setup.tsx` documents the environment contract and local bootstrap flow.
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
