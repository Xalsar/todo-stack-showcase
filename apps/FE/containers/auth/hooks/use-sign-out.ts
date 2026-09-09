"use client"

import { useState } from "react"

import { authClient } from "@/src/lib/auth-client"

function useSignOut() {
  const [isSigningOut, setIsSigningOut] = useState(false)

  const onSignOut = async () => {
    setIsSigningOut(true)
    try {
      await authClient.signOut()
    } finally {
      setIsSigningOut(false)
    }
  }

  return { onSignOut, isSigningOut }
}

export { useSignOut }
