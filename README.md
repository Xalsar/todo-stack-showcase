# My simple TypeScript stack to build FE apps with AI

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

#### API validation: Zod + @asteasolutions/zod-to-openapi

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
