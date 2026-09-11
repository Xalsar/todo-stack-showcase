"use client"

import type { ReactNode } from "react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { SignInForm } from "@/containers/auth/components/sign-in-form"
import { SignUpForm } from "@/containers/auth/components/sign-up-form"
import { useSignIn } from "@/containers/auth/hooks/use-sign-in"
import { useSignUp } from "@/containers/auth/hooks/use-sign-up"
import { authClient } from "@/src/lib/auth-client"

type AuthGateProps = {
  children: ReactNode
}

function AuthGate({ children }: AuthGateProps) {
  const { data, isPending } = authClient.useSession()
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in")

  const signIn = useSignIn()
  const signUp = useSignUp()

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
      {mode === "sign-in" ? (
        <SignInForm
          onSubmit={signIn.onSubmit}
          isSubmitting={signIn.isSubmitting}
          error={signIn.error}
        />
      ) : (
        <SignUpForm
          onSubmit={signUp.onSubmit}
          isSubmitting={signUp.isSubmitting}
          error={signUp.error}
        />
      )}

      <p className="text-sm text-muted-foreground">
        {mode === "sign-in" ? "No account?" : "Already have an account?"}{" "}
        <Button
          variant="link"
          size="sm"
          className="px-0"
          onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
        >
          {mode === "sign-in" ? "Sign up" : "Sign in"}
        </Button>
      </p>
    </div>
  )
}

export { AuthGate }
