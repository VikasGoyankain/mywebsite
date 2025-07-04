import { Redis } from '@upstash/redis'

// Create a Redis client
const redis = Redis.fromEnv()

export default redis

// Function to check if Redis is connected
export async function isRedisConnected() {
  try {
    // Simple ping to check if kv is working
    await redis.ping()
    return true
  } catch (error) {
    console.error("Redis connection check failed:", error)
    return false
  }
}

export interface DatabaseProfile {
  profileData: any
  experience: any[]
  education: any[]
  skills: any[]
  certificates: any[]
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

    await redis.set(PROFILE_KEY, profileWithTimestamp)
    return { success: true }
  } catch (error) {
    console.error("Failed to save profile to database:", error)
    return { success: false, error: "Failed to save to database" }
  }
}

export async function loadProfileFromDatabase(): Promise<DatabaseProfile | null> {
  try {
    const data = await redis.get<DatabaseProfile>(PROFILE_KEY)
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
    await redis.del(PROFILE_KEY)
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
    await redis.set(backupKey, {
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
    const keys = await redis.keys("backup:*")
    return { success: true, backups: keys }
  } catch (error) {
    console.error("Failed to list backups:", error)
    return { success: false, error: "Failed to list backups" }
  }
}

export async function setValue(key: string, value: any) {
  try {
    await redis.set(key, value)
    return true
  } catch (error) {
    console.error('Error setting value in Redis:', error)
    return false
  }
}

export async function getValue(key: string) {
  try {
    const value = await redis.get(key)
    return value
  } catch (error) {
    console.error('Error getting value from Redis:', error)
    return null
  }
}

export async function deleteValue(key: string) {
  try {
    await redis.del(key)
    return true
  } catch (error) {
    console.error('Error deleting value from Redis:', error)
    return false
  }
}

export async function listKeys(pattern: string = '*') {
  try {
    const keys = await redis.keys(pattern)
    return keys
  } catch (error) {
    console.error('Error listing keys from Redis:', error)
    return []
  }
}

// Family authentication types and helpers
export interface FamilyMember {
  username: string;
  hashedPassword: string;
  role?: string;
  createdAt: string;
  lastLogin?: string;
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const hashedInput = await hashPassword(password);
  return hashedInput === hashedPassword;
}

export async function getFamilyMember(username: string): Promise<FamilyMember | null> {
  const member = await redis.hget('family_members', username);
  if (!member) return null;
  
  try {
    return typeof member === 'string' ? JSON.parse(member) : member;
  } catch (error) {
    console.error('Error parsing family member data:', error);
    return null;
  }
}

export async function saveFamilyMember(member: FamilyMember): Promise<void> {
  const memberString = typeof member === 'string' ? member : JSON.stringify(member);
  await redis.hset('family_members', {
    [member.username]: memberString
  });
}

export async function updateFamilyMemberPassword(username: string, newHashedPassword: string): Promise<void> {
  const member = await getFamilyMember(username);
  if (!member) throw new Error('Family member not found');
  
  member.hashedPassword = newHashedPassword;
  await saveFamilyMember(member);
}

export async function getAllFamilyMembers(): Promise<FamilyMember[]> {
  const members = await redis.hgetall('family_members') as Record<string, string>;
  return Object.values(members).map(member => JSON.parse(member));
}

// Helper for Upstash Redis sorted set: get all members
export async function zrangeAll(key: string): Promise<string[]> {
  // Upstash Redis supports zrange with start=0, stop=-1
  return await redis.zrange(key, 0, -1);
}
// Helper for Upstash Redis sorted set: get all members in reverse order
export async function zrevrangeAll(key: string): Promise<string[]> {
  // Upstash Redis supports zrange with rev=true
  return await redis.zrange(key, 0, -1, { rev: true });
}
