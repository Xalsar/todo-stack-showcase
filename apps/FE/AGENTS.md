<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# FE Agent Guide

## Commands

Run from the repo root with `--filter`, or directly inside `apps/FE`:

- `pnpm --filter FE dev` / `build` / `start` — Next.js dev server, build, start.
- `pnpm --filter FE lint` — eslint.
- `pnpm --filter FE typecheck` — `tsc --noEmit`.
- `pnpm --filter FE format` — prettier on `**/*.{ts,tsx}`.

## Generated API client (gotcha)

- `src/lib/api/generated/` is orval output generated from `apps/BE/openapi.json`.
- It is committed and lint/prettier-ignored — never hand-edit these files.
- Regenerate with `pnpm be:api-client` from the repo root (run `pnpm be:openapi` first if the contract changed).
- The custom fetcher lives in `src/lib/api/fetcher.ts`: `todoFetch` throws `ApiError` on non-OK responses and resolves to `undefined` on 204.

## Layout & aliases

- The `@/*` path alias maps to the FE root, **not** `src/`: `components/`, `containers/`, `hooks/`, `providers/`, `app/`, `lib/`.
- `containers/<feature>/` holds a stateful container plus its `components/` and `hooks/` subdirectories (e.g. `containers/todos-list/`).
- Generated API types are imported from `@/src/lib/api/generated/model`.

## Frontend structure skill

- The `fe-structure-preferences` skill (repo root `.agents/skills/`) governs component/hook structure: presentational components, one hook per mutation, shared cross-hook state in its own hook. See `containers/todos-list/` for the pattern.

## OpenAPI dependency

- FE types derive from `apps/BE/openapi.json`; the contract lives in BE zod schemas (`apps/BE/src/schemas/`) plus `registry.registerPath` calls in route files.
- After any contract change run `pnpm be:openapi`, then `pnpm be:api-client`, and treat the regenerated `model/` types as the source of truth for API shapes.
