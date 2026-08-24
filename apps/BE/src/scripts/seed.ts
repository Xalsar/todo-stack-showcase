import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const sampleTodos = [
  { title: "Buy groceries", done: false },
  { title: "Set up CI pipeline", done: true },
  { title: "Write API docs", done: false },
  { title: "Fix flaky login test", done: false },
  { title: "Review open pull requests", done: true },
]

async function main(): Promise<void> {
  const count = await prisma.todo.count()

  if (count > 0) {
    console.log(`Found ${count} existing todo(s), skipping seed.`)
    return
  }

  const result = await prisma.todo.createMany({ data: sampleTodos })
  console.log(`Seeded ${result.count} todo(s).`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
