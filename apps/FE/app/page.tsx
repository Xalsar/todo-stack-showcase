import { ThemeToggle } from "@/containers/theme-toggle"
import { AuthGate } from "@/containers/auth/auth-gate"
import { UserMenu } from "@/containers/auth/user-menu"
import { LabelManagerTrigger } from "@/containers/labels/context/label-manager-trigger"
import { TodosList } from "@/containers/todos-list/todos-list"

export default function Page() {
  return (
    <div className="relative flex min-h-svh p-6">
      <div className="absolute top-6 right-6 flex items-center gap-1">
        <LabelManagerTrigger />
        <ThemeToggle />
        <UserMenu />
      </div>

      <main className="flex w-full max-w-md min-w-0 flex-col gap-4">
        <h1 className="font-medium">Todos</h1>
        <AuthGate>
          <TodosList />
        </AuthGate>
      </main>
    </div>
  )
}
