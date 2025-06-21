import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Paths that require authentication
const PROTECTED_PATHS = {
  ADMIN: ['/admin'],
  FAMILY: ['/family']
};

// Paths that are login pages
const LOGIN_PATHS = {
  ADMIN: '/admin/login',
  FAMILY: '/family/login'
};

// Public API paths that should not be protected
const PUBLIC_API_PATHS = [
  '/api/personal/login',
  '/api/personal/check-auth',
  '/api/admin/login',
  '/api/admin/check-auth',
  '/api/family/login',
  '/api/family/check-auth'
];

// Comment out the entire middleware function for now as we're handling auth in the layout component
// This prevents redirects that might be causing issues
export function middleware(request: NextRequest) {
  // Just let the request through - authentication is handled by the AdminAuthWrapper
  return NextResponse.next()
}

// Specify the paths that should be checked by the middleware
export const config = {
  matcher: ['/admin/:path*']
} 