# Agent Guide

This repository is a pnpm monorepo:

- `apps/BE/` — Express + Prisma + zod-to-openapi backend (todo CRUD).
- `apps/FE/` — (planned, not yet created) frontend that consumes `packages/api-client`.
- `packages/api-client/` — (planned) generated fetch client. Treat as build output. Do not hand-edit.

## Working scope

- For BE work, stay inside `apps/BE/`. Touch `prisma/schema.prisma` for data changes; `src/` for app code.
- Contract changes (request/response shapes): update zod schemas in `apps/BE/src/schemas/`, then run `pnpm generate` to refresh the OpenAPI spec and (eventually) the FE client.

## Toolchain

- Node v24 LTS via nvm
- pnpm 11 (workspace root)
- Postgres in podman via podman-compose (`pnpm db:up` / `pnpm db:down`)
- Express 5, zod 4, `@asteasolutions/zod-to-openapi`, Prisma 6

## Conventions

- Imports use NodeNext module resolution: relative imports of local TS files need explicit `.js` extensions.
- `prisma generate` must run after schema changes; it's a no-op if you run `pnpm migrate` (which calls generate internally).
- TypeScript strict mode is on; no implicit any, exhaustive reasoning required.
