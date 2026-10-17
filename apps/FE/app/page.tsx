import { ThemeToggle } from "@/containers/theme-toggle"
import { AuthGate } from "@/containers/auth/auth-gate"
import { UserMenu } from "@/containers/auth/user-menu"
import { LabelManager } from "@/containers/labels/label-manager"
import { LabelManagerTrigger } from "@/containers/labels/store/label-manager-trigger"
import { TodosList } from "@/containers/todos-list/todos-list"

export default function Page() {
  return (
    <div className="min-h-svh p-6">
      <div className="mx-auto w-full max-w-xl space-y-6">
        <div className="flex items-center justify-end gap-1">
          <LabelManagerTrigger />
          <ThemeToggle />
          <UserMenu />
        </div>

        <main className="flex min-w-0 flex-col gap-4">
          <h1 className="font-medium">Todos</h1>
          <AuthGate>
            <TodosList />
          </AuthGate>
        </main>
      </div>

      <LabelManager />
    </div>
  )
}
