"use client"

import { useState } from "react"

import { authClient } from "@/src/lib/auth-client"

type SignUpValues = {
  name: string
  email: string
  password: string
}

function useSignUp() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (values: SignUpValues): Promise<boolean> => {
    setError(null)
    setIsSubmitting(true)
    try {
      const { error } = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
      })

      if (error) {
        setError(error.message ?? "Unable to create account")
        return false
      }

      return true
    } catch {
      setError("Unable to create account")
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return { onSubmit, isSubmitting, error }
}

export { useSignUp }
