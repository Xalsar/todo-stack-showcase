"use client"

import { useSyncExternalStore } from "react"

const QUERY = "(min-width: 640px)"

function subscribe(callback: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) {
    return () => {}
  }

  const mediaQueryList = window.matchMedia(QUERY)
  mediaQueryList.addEventListener("change", callback)
  return () => mediaQueryList.removeEventListener("change", callback)
}

function getSnapshot() {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false
  }
  return window.matchMedia(QUERY).matches
}

function getServerSnapshot() {
  return false
}

function useIsDesktop() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export { useIsDesktop }
