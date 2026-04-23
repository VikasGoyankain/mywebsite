import { NextRequest, NextResponse } from 'next/server'
import {
  verifyPasswordPbkdf2,
  checkRateLimit,
  clearRateLimit,
  createSessionJWT,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
} from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  // ── 1. Resolve client IP ──────────────────────────────────────────────────
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    '127.0.0.1'

  // ── 2. Rate-limit check ───────────────────────────────────────────────────
  const rateCheck = await checkRateLimit(ip)
  if (!rateCheck.allowed) {
    const minutes = Math.ceil((rateCheck.retryAfter ?? 900) / 60)
    return NextResponse.json(
      {
        success: false,
        message: `Too many failed attempts. Try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`,
      },
      {
        status: 429,
        headers: { 'Retry-After': String(rateCheck.retryAfter ?? 900) },
      }
    )
  }

  // ── 3. Parse body ─────────────────────────────────────────────────────────
  let password: string
  try {
    const body = await request.json()
    password = body?.password ?? ''
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid request body' },
      { status: 400 }
    )
  }

  if (!password) {
    return NextResponse.json(
      { success: false, message: 'Password is required' },
      { status: 400 }
    )
  }

  // ── 4. Verify password ────────────────────────────────────────────────────
  const storedHash = process.env.ADMIN_PASSWORD_HASH
  if (!storedHash) {
    console.error('[Admin Login] ADMIN_PASSWORD_HASH env variable is not set')
    return NextResponse.json(
      { success: false, message: 'Server misconfiguration. Contact admin.' },
      { status: 500 }
    )
  }

  const isValid = await verifyPasswordPbkdf2(password, storedHash)

  if (!isValid) {
    // Return a deliberately vague message to prevent user enumeration
    return NextResponse.json(
      { success: false, message: 'Invalid password' },
      { status: 401 }
    )
  }

  // ── 5. Login successful – clear rate limit and issue JWT session ──────────
  await clearRateLimit(ip)
  const jwt = await createSessionJWT()

  const response = NextResponse.json(
    { success: true, message: 'Login successful' },
    { status: 200 }
  )

  response.cookies.set(SESSION_COOKIE_NAME, jwt, sessionCookieOptions)

  return response
}

// ── Logout ────────────────────────────────────────────────────────────────────
export async function DELETE() {
  const response = NextResponse.json(
    { success: true, message: 'Logged out successfully' },
    { status: 200 }
  )

  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
  })

  return response
}