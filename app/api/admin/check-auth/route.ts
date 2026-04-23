import { NextRequest, NextResponse } from 'next/server'
import { verifySessionJWT, SESSION_COOKIE_NAME, sessionCookieOptions, createSessionJWT } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const isValid = await verifySessionJWT(token)

    if (!isValid) {
      // Token is expired or tampered – clear the stale cookie
      const response = NextResponse.json(
        { success: false, message: 'Session expired or invalid' },
        { status: 401 }
      )
      response.cookies.set(SESSION_COOKIE_NAME, '', { httpOnly: true, maxAge: 0, path: '/' })
      return response
    }

    // ── Session sliding: refresh the JWT on every valid check ─────────────
    const newToken = await createSessionJWT()
    const response = NextResponse.json(
      { success: true, message: 'Authenticated' },
      { status: 200 }
    )
    response.cookies.set(SESSION_COOKIE_NAME, newToken, sessionCookieOptions)

    return response
  } catch (error) {
    console.error('[Admin check-auth] Unexpected error:', error)
    return NextResponse.json(
      { success: false, message: 'Authentication check failed' },
      { status: 500 }
    )
  }
}