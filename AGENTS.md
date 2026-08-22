# Agent Guide

pnpm monorepo (`apps/*`, `packages/*`). `apps/BE/` is Express 5 + Prisma 6 todo CRUD; `apps/FE/` is
Next.js 16 + shadcn/ui (Tailwind v4, Base UI primitives, preset `b0`) and uses SWR for client-side data
fetching. `packages/api-client/` is planned but not created yet: it will be an orval-generated API client
from the committed `apps/BE/openapi.json`.

## Setup & commands

- `.nvmrc` pins Node 24 (`nvm use`); pnpm version is enforced via `packageManager`.
- Copy `.env.example` to `apps/BE/.env` first — `dev`/`start` use tsx `--env-file=.env` and crash without it.
  Local compose URL: `postgresql://todos:devpass@localhost:5432/todos`
- `pnpm db:up` / `db:down` — Postgres 17 in podman (container `todo-pg`, port 5432). Required before migrate/dev.
- `pnpm migrate` — `prisma migrate dev` (runs generate internally). `pnpm generate` — Prisma client codegen only.
- `pnpm openapi` — regenerate the committed `apps/BE/openapi.json` from zod schemas.
- `pnpm fe:dev` — Next.js dev server for FE (no env file needed).
- No tests exist. Verify changes with `pnpm build` (BE: tsc strict; FE: `next build`, includes typecheck).
  FE also has `lint` (eslint) / `typecheck` scripts; run via `pnpm --filter FE <script>`.

## Gotchas

- Run the Prisma CLI through workspace scripts only (`pnpm migrate`, `pnpm generate`, or
  `pnpm --filter BE exec prisma ...`). Never `npx`/`pnpm dlx prisma`: it fetches v7, whose schema
  validator rejects this repo's v6-style datasource url. `.vscode/settings.json` pins the IDE extension
  to 6 for the same reason.
- API contract shapes live in zod schemas (`apps/BE/src/schemas/`) plus `registry.registerPath` calls in
  route files (e.g. `apps/BE/src/routes/todos.ts`). After any contract change run `pnpm openapi`; FE client
  codegen from the spec isn't wired up yet — orval (`packages/api-client/`, not created) is the intended
  generator once it exists.
- `src/scripts/generate-openapi.ts` imports route modules for their registration side effects — new route
  files must be imported there or they won't appear in the spec.

## Conventions

- ESM + NodeNext module resolution: relative imports of local TS files need explicit `.js` extensions.
- tsconfig enables `noUncheckedIndexedAccess`: indexed access returns `T | undefined`.
