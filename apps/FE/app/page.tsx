import { ThemeToggle } from "@/containers/theme-toggle"
import { AuthGate } from "@/containers/auth/auth-gate"
import { TodosList } from "@/containers/todos-list/todos-list"

export default function Page() {
  return (
    <div className="relative flex min-h-svh p-6">
      <ThemeToggle className="absolute top-6 right-6" />

      <main className="flex w-full max-w-md min-w-0 flex-col gap-4">
        <h1 className="font-medium">Todos</h1>
        <AuthGate>
          <TodosList />
        </AuthGate>
      </main>
    </div>
  )
}
