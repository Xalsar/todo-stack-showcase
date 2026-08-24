# Agent Guide

pnpm monorepo (`apps/*`, `packages/*`). `apps/BE/` is Express 5 + Prisma 6 todo CRUD; `apps/FE/` is
Next.js 16 + shadcn/ui (Tailwind v4, Base UI primitives, preset `b0`) and uses SWR for client-side data
fetching. An orval-generated SWR client from the committed `apps/BE/openapi.json` lives in
`apps/FE/src/lib/api/generated/`.

## Setup & commands

- `.nvmrc` pins Node 24 (`nvm use`); pnpm version is enforced via `packageManager`.
- Copy `.env.example` to `apps/BE/.env` first — `dev`/`start` use tsx `--env-file=.env` and crash without it.
  Local compose URL: `postgresql://todos:devpass@localhost:5432/todos`
- `pnpm be:db:up` / `be:db:down` — Postgres 17 in podman (container `todo-pg`, port 5432). Required before migrate/dev.
- `pnpm be:migrate` — `prisma migrate dev` (runs generate internally). `pnpm be:generate` — Prisma client codegen only.
- `pnpm be:openapi` — regenerate the committed `apps/BE/openapi.json` from zod schemas.
- `pnpm be:api-client` — regenerate the FE SWR client (`apps/FE/src/lib/api/generated/`) from that spec via
  orval (config: `apps/BE/orval.config.ts`; hand-written fetcher: `apps/FE/src/lib/api/fetcher.ts`).
- `pnpm dev` — BE + FE dev servers in parallel (still needs Postgres up and `apps/BE/.env` first; Ctrl+C stops both).
- `pnpm be:dev` / `fe:dev` — run one side only (`fe:dev`: Next.js dev server, no env file needed).
- No tests exist. Verify changes with `pnpm build` (BE: tsc strict; FE: `next build`, includes typecheck).
  FE also has `lint` (eslint) / `typecheck` scripts; run via `pnpm --filter FE <script>`.

## Gotchas

- Run the Prisma CLI through workspace scripts only (`pnpm be:migrate`, `pnpm be:generate`, or
  `pnpm --filter BE exec prisma ...`). Never `npx`/`pnpm dlx prisma`: it fetches v7, whose schema
  validator rejects this repo's v6-style datasource url. `.vscode/settings.json` pins the IDE extension
  to 6 for the same reason.
- API contract shapes live in zod schemas (`apps/BE/src/schemas/`) plus `registry.registerPath` calls in
  route files (e.g. `apps/BE/src/routes/todos.ts`). After any contract change run `pnpm be:openapi`, then
  `pnpm be:api-client` to regenerate the FE SWR client. Generated files are committed and lint/prettier
  ignored — don't edit them by hand.
- `src/scripts/generate-openapi.ts` imports route modules for their registration side effects — new route
  files must be imported there or they won't appear in the spec.

## Conventions

- ESM + NodeNext module resolution: relative imports of local TS files need explicit `.js` extensions.
- tsconfig enables `noUncheckedIndexedAccess`: indexed access returns `T | undefined`.

## Before committing or pushing

- **Always run `pnpm format` first** (`prettier --write .`). Format before
  `git add`. Never commit or push unformatted changes.
- Run the app(s)' checks after formatting: BE `pnpm be:build`; FE
  `pnpm --filter FE typecheck` and `pnpm --filter FE lint`. Do not commit
  failures. See the `format-before-commit` skill for the full workflow.
