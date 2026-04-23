import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

// Public API paths that bypass authentication
const PUBLIC_API_PATHS = [
  '/api/admin/login',
  '/api/admin/check-auth',
  '/api/family/login',
  '/api/family/check-auth',
  '/api/personal/login',
  '/api/personal/check-auth',
]

const SESSION_COOKIE_NAME = 'admin-session'

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET ?? ''
  return new TextEncoder().encode(secret)
}

async function isValidAdminJWT(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    return payload.role === 'admin'
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public API routes through
  if (PUBLIC_API_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Protect all /admin routes
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value

    if (!token || !(await isValidAdminJWT(token))) {
      // For API routes under /admin, return JSON 401
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json(
          { success: false, message: 'Unauthorized' },
          { status: 401 }
        )
      }

      // For page routes, let the AdminAuthWrapper handle showing the login modal
      // (avoids hard redirect loops)
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}