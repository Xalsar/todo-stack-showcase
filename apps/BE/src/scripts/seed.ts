import { auth } from "../lib/auth.js"
import { prisma } from "../lib/prisma.js"

const DEMO_EMAIL = "demo@example.com"
const DEMO_PASSWORD = "test123456"

const sampleTodos = [
  { title: "Buy groceries", done: false },
  { title: "Set up CI pipeline", done: true },
  { title: "Write API docs", done: false },
  { title: "Fix flaky login test", done: false },
  { title: "Review open pull requests", done: true },
]

const sampleLabels = [{ name: "Work" }, { name: "Personal" }]

async function main(): Promise<void> {
  await prisma.user.deleteMany({ where: { email: DEMO_EMAIL } })

  const { user } = await auth.api.signUpEmail({
    body: {
      name: "Demo User",
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    },
  })
  console.log(`Seeded demo user ${user.id} (${DEMO_EMAIL}).`)

  const todoCount = await prisma.todo.count()

  if (todoCount === 0) {
    const result = await prisma.todo.createMany({
      data: sampleTodos.map((todo) => ({ ...todo, userId: user.id })),
    })
    console.log(`Seeded ${result.count} todo(s).`)
  } else {
    console.log(`Found ${todoCount} existing todo(s), skipping seed.`)
  }

  const labelCount = await prisma.label.count()

  if (labelCount === 0) {
    const result = await prisma.label.createMany({
      data: sampleLabels.map((label) => ({ ...label, userId: user.id })),
    })
    console.log(`Seeded ${result.count} label(s).`)
  } else {
    console.log(`Found ${labelCount} existing label(s), skipping seed.`)
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
