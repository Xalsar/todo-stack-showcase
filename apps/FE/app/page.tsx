import { ThemeToggle } from "@/components/theme-toggle"
import { TodosList } from "@/components/todos-list"

export default function Page() {
  return (
    <div className="relative flex min-h-svh p-6">
      <ThemeToggle className="absolute top-6 right-6" />

      <main className="w-full max-w-md min-w-0">
        <h1 className="mb-4 font-medium">Todos</h1>
        <TodosList />
      </main>
    </div>
  )
}
