"use client"

import { useEffect } from "react"
import { useProfileStore } from "@/lib/profile-store"

export function useDatabaseInit() {
  const { loadFromDatabase, syncStatus } = useProfileStore()

  useEffect(() => {
    // Load data from database on app initialization
    if (syncStatus === "idle") {
      loadFromDatabase()
    }
  }, [loadFromDatabase, syncStatus])
}
