"use client"

import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { authClient } from "@/src/lib/auth-client"

type AuthGateProps = {
  children: ReactNode
}

function AuthGate({ children }: AuthGateProps) {
  const { data, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    )
  }

  if (data?.session) {
    return children
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-4 rounded-lg border p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Sign in with your Google account to continue.
        </p>
      </div>

      <Button
        type="button"
        onClick={() =>
          authClient.signIn.social({
            provider: "google",
            callbackURL: window.location.href,
          })
        }
      >
        Continue with Google
      </Button>
    </div>
  )
}

export { AuthGate }
