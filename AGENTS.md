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
- Tests run with Vitest (`pnpm test`) — see [Testing](#testing) below. Also verify changes with `pnpm build`
  (BE: tsc strict; FE: `next build`, includes typecheck). FE has `lint` (eslint) / `typecheck` scripts;
  run via `pnpm --filter FE <script>`.
- `pnpm typecheck` — type-check every package, tests included (BE, FE, e2e). Per side: `be:typecheck` /
  `fe:typecheck`. Builds don't type-check test files, so run this too.

## Testing

- `pnpm test` — run all tests once (BE + FE). `pnpm test:watch` — watch mode.
  `pnpm test:coverage` — v8 coverage, enforced against thresholds (statements/lines/functions 95,
  branches 90). `pnpm test:be` / `pnpm test:fe` — run one side only.
- Config lives in `vitest.config.mts` (root workspace, `projects: [apps/BE, apps/FE]`) plus per-app
  `vitest.config.ts`. Tests are co-located as `*.test.ts(x)` and import `describe`/`it`/`expect`/`vi`
  from `vitest` explicitly — globals are **off**.
- BE: unit tests mock `lib/prisma.js`; integration tests use `supertest` against the exported `app`
  (`apps/BE/src/app.ts`) with `lib/auth.js` and `lib/prisma.js` mocked — **no database is required**.
  `apps/BE/src/server.ts` only calls `listen`.
- BE test files are excluded from the build (`tsconfig.json`) but type-checked by `pnpm be:typecheck`
  (`tsconfig.test.json`).
- FE is the inverse: `tsconfig.json` includes tests (editor + `pnpm --filter FE typecheck`), while
  `next build` uses `tsconfig.build.json` (via `typescript.tsconfigPath`), which excludes them.
- FE: `jsdom` + Testing Library. `apps/FE/vitest.setup.ts` imports jest-dom and registers
  `afterEach(cleanup)` (required because globals are off). The generated client and shadcn primitives
  are mocked / excluded from coverage.
- Coverage counts first-party code only (`coverage.include`/`exclude` in `vitest.config.mts`): vendored
  `components/ui`, the generated client, `app/` routes, BE wiring (`server.ts`, `lib/`), and scripts are
  excluded. `apps/BE/.env` is loaded by Vitest, so tests asserting env fallbacks must `vi.stubEnv`.

## End-to-end tests (Playwright)

- `apps/e2e/` is a Playwright package (`E2E`). Run `pnpm test:e2e` (alias `pnpm e2e`) or `pnpm e2e:ui`.
  One-time browser install: `pnpm e2e:install`.
- Playwright owns its servers: the `webServer` runs `apps/e2e/scripts/dev-servers.mjs`, which starts BE on
  `:4100` and FE on `:3100` against the dedicated `todos_e2e` database (`DATABASE_URL` injected), with the
  FE build dir set to `.next-e2e` (`NEXT_DIST_DIR`) so it never shares `.next`/the dev lock with `pnpm dev`.
  This means dev (`todos`, :3000/:4000) and e2e (`todos_e2e`, :3100/:4100) can run **concurrently**;
  override ports via `E2E_BE_PORT`/`E2E_FE_PORT` (or the `E2E_*_URL`/`E2E_DATABASE_URL` vars).
- Auth is Google-only, so tests don't drive the OAuth UI. The `setup` project runs `pnpm e2e:setup`
  (create DB → `prisma migrate deploy` → `e2e:seed`). The seed uses a test-only better-auth instance with
  the `testUtils()` plugin (`apps/BE/src/lib/auth.e2e.ts`, never imported by `app.ts`) to mint real signed
  session cookies for seeded users and write them to `apps/e2e/.auth/{userA,userB}.json` (gitignored).
  Projects: `setup`, `userA`, `userB` (storage states), `anon`.
- DB scripts: `pnpm e2e:setup` = `e2e:db:create` (idempotent, via `podman exec todo-pg psql`) +
  `e2e:db:migrate` + `e2e:seed`. The seed truncates and reseeds each run, so runs are deterministic.
- Specs live under `apps/e2e/tests/{setup,anon,userA,userB}/`.

## Gotchas

- Run the Prisma CLI through workspace scripts only (`pnpm be:migrate`, `pnpm be:generate`, or
  `pnpm --filter BE exec prisma ...`). Never `npx`/`pnpm dlx prisma`: it fetches v7, whose schema
  validator rejects this repo's v6-style datasource url. `.vscode/settings.json` pins the IDE extension
  to 6 for the same reason.
- For a named migration use `pnpm be:migrate:name <name>` (wraps `prisma migrate dev --name`). Don't
  use `pnpm be:migrate -- --name <name>` — pnpm's `--` pass-through doesn't forward flags to Prisma
  correctly and it prompts interactively. An aborted interactive run can leave a transient `P1002`
  advisory-lock timeout on the next attempt; distinguish that from a half-applied migration by checking
  `pg_stat_activity` for lingering connections and `_prisma_migrations` for the applied state.
- API contract shapes live in zod schemas (`apps/BE/src/schemas/`) plus `registry.registerPath` calls in
  route files (e.g. `apps/BE/src/routes/todos.ts`). After any contract change run `pnpm be:openapi`, then
  `pnpm be:api-client` to regenerate the FE SWR client. Generated files are committed and lint/prettier
  ignored — don't edit them by hand.
- `src/scripts/generate-openapi.ts` imports route modules for their registration side effects — new route
  files must be imported there or they won't appear in the spec.
- **Deployment to Vercel**: Before deploying, read `.agents/skills/vercel-deployment-gotchas.md`. Key issues:
  Express apps need `export default app`, monorepo tsconfig must exclude test files, use a single env var
  for backend URL across API and auth clients, and configure cross-subdomain cookies in better-auth.

## Conventions

- ESM + NodeNext module resolution: relative imports of local TS files need explicit `.js` extensions.
- tsconfig enables `noUncheckedIndexedAccess`: indexed access returns `T | undefined`.
- Follow `fe-structure-preferences` when creating, refactoring, or reviewing React components and hooks.

## Before committing or pushing

- **Always run `pnpm format` first** (`prettier --write .`). Format before
  `git add`. Never commit or push unformatted changes.
- Run the app(s)' checks after formatting: BE `pnpm be:build` + `pnpm be:typecheck`; FE
  `pnpm --filter FE typecheck` and `pnpm --filter FE lint`; plus `pnpm test`. Do not commit
  failures. See the `format-before-commit` skill for the full workflow.
- E2E changes: run `pnpm test:e2e` (needs Postgres up and `pnpm e2e:install` once; runs alongside `pnpm dev`).
