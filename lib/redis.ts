import { kv } from "@vercel/kv"

export interface DatabaseProfile {
  profileData: any
  experience: any[]
  education: any[]
  skills: any[]
  posts: any[]
  navigationPages: any[]
  lastUpdated: string
}

const PROFILE_KEY = "profile:main"

export async function saveProfileToDatabase(data: DatabaseProfile) {
  try {
    const profileWithTimestamp = {
      ...data,
      lastUpdated: new Date().toISOString(),
    }

    await kv.set(PROFILE_KEY, profileWithTimestamp)
    return { success: true }
  } catch (error) {
    console.error("Failed to save profile to database:", error)
    return { success: false, error: "Failed to save to database" }
  }
}

export async function loadProfileFromDatabase(): Promise<DatabaseProfile | null> {
  try {
    const data = await kv.get<DatabaseProfile>(PROFILE_KEY)
    return data
  } catch (error) {
    console.error("Failed to load profile from database:", error)
    return null
  }
}

export async function deleteProfileFromDatabase() {
  try {
    await kv.del(PROFILE_KEY)
    return { success: true }
  } catch (error) {
    console.error("Failed to delete profile from database:", error)
    return { success: false, error: "Failed to delete from database" }
  }
}

// Backup functions for data safety
export async function createBackup(backupName: string, data: DatabaseProfile) {
  try {
    const backupKey = `backup:${backupName}:${Date.now()}`
    await kv.set(backupKey, {
      ...data,
      backupCreated: new Date().toISOString(),
    })
    return { success: true, backupKey }
  } catch (error) {
    console.error("Failed to create backup:", error)
    return { success: false, error: "Failed to create backup" }
  }
}

export async function listBackups() {
  try {
    // Note: This is a simplified approach. In production, you might want to maintain a separate index
    const keys = await kv.keys("backup:*")
    return { success: true, backups: keys }
  } catch (error) {
    console.error("Failed to list backups:", error)
    return { success: false, error: "Failed to list backups" }
  }
}
