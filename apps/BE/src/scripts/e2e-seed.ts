import { randomUUID } from "node:crypto"
import { mkdir, writeFile } from "node:fs/promises"

import { e2eAuth } from "../lib/auth.e2e.js"
import { prisma } from "../lib/prisma.js"

const AUTH_DIR = new URL("../../../e2e/.auth/", import.meta.url)

const USER_A = { email: "e2e-user-a@example.com", name: "E2E User A" }
const USER_B = { email: "e2e-user-b@example.com", name: "E2E User B" }

const TODOS_A = ["A: buy groceries", "A: walk the dog"]
const TODOS_B = ["B: pay rent"]

const LABELS = ["Work", "Personal"]

type Cookie = {
  name: string
  value: string
  domain: string
  path: string
  expires?: number
  httpOnly?: boolean
  secure?: boolean
  sameSite?: string
}

function toStorageState(cookies: Cookie[]) {
  return JSON.stringify({ cookies, origins: [] }, null, 2)
}

async function resetData(): Promise<void> {
  await prisma.todo.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()
  await prisma.label.deleteMany()
}

async function seedUser(
  input: { email: string; name: string },
  todoTitles: string[]
): Promise<string> {
  const user = await prisma.user.create({
    data: {
      id: randomUUID(),
      email: input.email,
      name: input.name,
      emailVerified: true,
    },
  })

  await prisma.todo.createMany({
    data: todoTitles.map((title) => ({ title, userId: user.id })),
  })

  await prisma.label.createMany({
    data: LABELS.map((name) => ({ name, userId: user.id })),
  })

  return user.id
}

async function writeStorageState(
  fileName: string,
  cookies: Cookie[]
): Promise<void> {
  await mkdir(AUTH_DIR, { recursive: true })
  await writeFile(new URL(fileName, AUTH_DIR), toStorageState(cookies))
}

async function main(): Promise<void> {
  if (!process.env.BETTER_AUTH_SECRET) {
    throw new Error("BETTER_AUTH_SECRET is required to sign e2e sessions")
  }

  await resetData()

  const userAId = await seedUser(USER_A, TODOS_A)
  const userBId = await seedUser(USER_B, TODOS_B)

  const ctx = await e2eAuth.$context

  const loginA = await ctx.test.login({ userId: userAId })
  const loginB = await ctx.test.login({ userId: userBId })

  await writeStorageState("userA.json", loginA.cookies)
  await writeStorageState("userB.json", loginB.cookies)

  console.log(
    `Seeded e2e users: A=${USER_A.email} (${TODOS_A.length} todos), ` +
      `B=${USER_B.email} (${TODOS_B.length} todos). ` +
      `Wrote storage states to ${AUTH_DIR.pathname}.`
  )
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
