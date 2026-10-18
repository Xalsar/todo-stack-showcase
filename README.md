# My simple TypeScript stack to build FE apps with AI

## Getting started

### Prerequisites

- **Node 24** (pinned in `.nvmrc`, run `nvm use`)
- **pnpm**, version pinned via `packageManager` (`corepack enable` picks it up)
- **Podman** + **podman-compose**, used to run Postgres 17 locally
- A **Google OAuth client** (ID + secret) if you want to sign in. Auth is Google-only.
  Add `http://localhost:4000/api/auth/callback/google` as an authorized redirect URI.

### Setup

```bash
pnpm install

# Backend env. dev/start crash without this file
cp apps/BE/.env.example apps/BE/.env
# then edit apps/BE/.env:
#   BETTER_AUTH_SECRET   -> output of `openssl rand -base64 32`
#   GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET -> your OAuth client
# DATABASE_URL already points to the local compose database.

pnpm be:db:up     # start Postgres (container `todo-pg`, port 5432)
pnpm be:migrate   # apply migrations + generate the Prisma client
pnpm be:seed      # optional: seed sample data
```

The FE needs no env file locally; it defaults to the API at `http://localhost:4000`
(override with `NEXT_PUBLIC_API_BASE_URL`).

### Run the app

```bash
pnpm dev          # BE (http://localhost:4000) + FE (http://localhost:3000); Ctrl+C stops both
pnpm be:dev       # backend only
pnpm fe:dev       # frontend only
pnpm be:db:down   # stop Postgres when you're done
```

## Testing

### Unit & integration tests (Vitest)

No database is needed: BE tests mock Prisma and auth, and FE tests run in jsdom with Testing Library.

```bash
pnpm test             # run all tests once (BE + FE)
pnpm test:be          # backend only
pnpm test:fe          # frontend only
pnpm test:watch       # watch mode
pnpm test:coverage    # v8 coverage with enforced thresholds (95% statements/lines/functions, 90% branches)
```

### End-to-end tests (Playwright)

E2E tests need Postgres running (`pnpm be:db:up`) and `BETTER_AUTH_SECRET` set in `apps/BE/.env`.
Playwright starts its own servers (BE on `:4100`, FE on `:3100`) against a separate `todos_e2e`
database, so you can run them alongside `pnpm dev`. Sessions are minted by a seed script, so no
Google login is needed.

```bash
pnpm e2e:install   # one-time: install Playwright browsers
pnpm test:e2e      # create/migrate/seed the e2e DB, then run all specs
pnpm e2e:ui        # same, in Playwright's UI mode
```

### Other checks

```bash
pnpm typecheck     # type-check every package, tests included
pnpm build         # BE tsc build + FE next build
pnpm --filter FE lint
pnpm format        # prettier. Run before committing
```

## Sub sections

1- My stack
2- My AI workflow
3- Feature implementation

## Index

- Part I: Presentation of my stack
- Part II: Add a new feature using AI

## Why this stack?

- **It is simple** — small surface area, easy to reason about and to extend.
- **It is cheap** — low setup cost, low maintenance, minimal tooling.
- **It is scalable** — each piece can grow or be swapped independently.

## NOTE

- The project is far from perfect — it's just a simple todo app to show you the potential of the stack. In future videos I will polish it.

## My stack

### Monorepo

It's an easy way to structure the FE and BE in the same project.

### Backend

#### API: Express

Why not Hono, Fastify, NestJS, Next.js...?

Express is old and battle-tested, very easy to set up and scale. And I didn't want to use newer things like Next.js Server Actions.

#### Database: PostgreSQL

Why not NoSQL?

SQL databases are very straightforward to use and follow ACID principles.

#### ORM: Prisma 6

Why not Drizzle?

Prisma is super easy to read and I already know how to use it.

#### Container engine: Podman

Why not Docker?

It's easier to install and more secure since it does not require root access.

#### API validation: Zod

Why?

It's easy to use and generates an OpenAPI spec.

#### Client generation: Orval

Why?

It's a super easy way to generate the client.

### Frontend

#### Frontend: Next.js (React)

Why not Vue, Svelte...?

They are not as popular as React.

#### API state handling: SWR

Why not TanStack Query?

SWR is super easy to use.

#### Component library: shadcn/ui

Why not others?

shadcn/ui works with Tailwind CSS and is modular and mature.

### AI tools

#### Opencode Zen

It's super cheap and powerful.

### Skills: [Autoskills](https://www.autoskills.sh/) and custom ones

Autoskills takes all the skills from different places, reads your project to pick up the ones you need and downloads them.

I also use a few custom skills.

## Where to deploy this app?

### Vercel FE and Render BE

Why not others?

[Vercel](https://vercel.com) and [Render](https://render.com) are super easy to use and ideal for small teams.

### [Neon](https://neon.com)

Super easy to use.
