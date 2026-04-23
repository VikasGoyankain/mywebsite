import { SignJWT, jwtVerify } from 'jose'
import redis from '@/lib/redis'

// ─── Constants ────────────────────────────────────────────────────────────────
const RATE_LIMIT_KEY_PREFIX = 'admin:login:attempts:'
const MAX_ATTEMPTS = 5
const WINDOW_SECONDS = 15 * 60  // 15-minute window
const SESSION_DURATION_SECONDS = 24 * 60 * 60 // 24 hours

// ─── JWT Helpers ──────────────────────────────────────────────────────────────

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET environment variable is not set')
  return new TextEncoder().encode(secret)
}

/** Creates a signed JWT valid for 24 hours */
export async function createSessionJWT(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getJwtSecret())
}

/** Verifies a JWT and returns its payload, or null if invalid/expired */
export async function verifySessionJWT(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    return payload.role === 'admin'
  } catch {
    return false
  }
}

// ─── Password Hashing (PBKDF2-SHA256 with salt) ───────────────────────────────

/**
 * Hashes a password using PBKDF2-SHA256 with a random salt.
 * Returns a "salt:hash" string.
 */
export async function hashPasswordPbkdf2(password: string): Promise<string> {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16))
  const salt = Array.from(saltBytes).map(b => b.toString(16).padStart(2, '0')).join('')
  const hash = await derivePbkdf2(password, salt)
  return `${salt}:${hash}`
}

/**
 * Verifies a password against a "salt:hash" string.
 */
export async function verifyPasswordPbkdf2(
  password: string,
  storedHash: string
): Promise<boolean> {
  const [salt, expectedHash] = storedHash.split(':')
  if (!salt || !expectedHash) return false
  const actualHash = await derivePbkdf2(password, salt)
  // Constant-time comparison to prevent timing attacks
  return timingSafeEqual(actualHash, expectedHash)
}

async function derivePbkdf2(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: 310_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  )
  return Array.from(new Uint8Array(derived))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/** Constant-time string comparison to prevent timing attacks */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

// ─── Rate Limiting (Upstash Redis) ────────────────────────────────────────────

/**
 * Returns { allowed: true } if the IP is under the limit,
 * or { allowed: false, retryAfter: seconds } if blocked.
 */
export async function checkRateLimit(
  ip: string
): Promise<{ allowed: boolean; retryAfter?: number; remaining?: number }> {
  const key = `${RATE_LIMIT_KEY_PREFIX}${ip}`

  try {
    const attempts = await redis.incr(key)

    // Set TTL only on the first attempt
    if (attempts === 1) {
      await redis.expire(key, WINDOW_SECONDS)
    }

    if (attempts > MAX_ATTEMPTS) {
      const ttl = await redis.ttl(key)
      return { allowed: false, retryAfter: ttl > 0 ? ttl : WINDOW_SECONDS }
    }

    return { allowed: true, remaining: MAX_ATTEMPTS - attempts }
  } catch {
    // If Redis is unavailable, fail open (allow request) to avoid locking out admin
    return { allowed: true }
  }
}

/** Clears the rate limit counter for an IP after a successful login */
export async function clearRateLimit(ip: string): Promise<void> {
  const key = `${RATE_LIMIT_KEY_PREFIX}${ip}`
  try {
    await redis.del(key)
  } catch {
    // Non-critical; ignore
  }
}

// ─── Cookie Config ────────────────────────────────────────────────────────────

export const SESSION_COOKIE_NAME = 'admin-session'

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: SESSION_DURATION_SECONDS,
  path: '/',
}
