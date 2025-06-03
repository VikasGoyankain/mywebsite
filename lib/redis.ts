import { kv } from "@vercel/kv"

export interface DatabaseProfile {
  profileData: any
  experience: any[]
  education: any[]
  skills: any[]
  posts: any[]
  navigationPages: any[]
  navigationButtons?: any[]
  adminPassword?: string | null
  lastUpdated: string
}

const PROFILE_KEY = "profile:main"

// Keys for different data collections
export const REDIS_KEYS = {
  SUBSCRIBERS: 'subscribers',
  RESEARCH: 'research',
  PROFILE: 'profile',
  CASES_INDEX: 'cases:index'
}

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
    if (!data) {
      console.log('No profile data found in database')
      return null
    }
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

export async function setValue(key: string, value: any) {
  try {
    await kv.set(key, value)
    return true
  } catch (error) {
    console.error('Error setting value in Redis:', error)
    return false
  }
}

export async function getValue(key: string) {
  try {
    const value = await kv.get(key)
    return value
  } catch (error) {
    console.error('Error getting value from Redis:', error)
    return null
  }
}

export async function deleteValue(key: string) {
  try {
    await kv.del(key)
    return true
  } catch (error) {
    console.error('Error deleting value from Redis:', error)
    return false
  }
}

export async function listKeys(pattern: string = '*') {
  try {
    const keys = await kv.keys(pattern)
    return keys
  } catch (error) {
    console.error('Error listing keys from Redis:', error)
    return []
  }
}
