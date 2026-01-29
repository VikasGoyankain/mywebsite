"use client"

import { useEffect, useRef } from "react"
import { useProfileStore } from "@/lib/profile-store"

export function useDatabaseInit() {
  const { loadFromDatabase, syncStatus, error } = useProfileStore()
  const hasAttemptedLoad = useRef(false)

  useEffect(() => {
    // Only attempt to load if:
    // 1. We haven't tried loading yet
    // 2. We're in idle state
    // 3. We haven't encountered an error
    if (!hasAttemptedLoad.current && syncStatus === "idle" && !error) {
      hasAttemptedLoad.current = true
      loadFromDatabase()
    }
  }, [loadFromDatabase, syncStatus, error])

  // Reset the initialization flag if we get an error
  useEffect(() => {
    if (error) {
      hasAttemptedLoad.current = false
    }
  }, [error])
}
