"use client"

import { useState } from "react"

import { authClient } from "@/src/lib/auth-client"

type SignInValues = {
  email: string
  password: string
}

function useSignIn() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (values: SignInValues): Promise<boolean> => {
    setError(null)
    setIsSubmitting(true)
    try {
      const { error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      })

      if (error) {
        setError(error.message ?? "Unable to sign in")
        return false
      }

      return true
    } catch {
      setError("Unable to sign in")
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return { onSubmit, isSubmitting, error }
}

export { useSignIn }
