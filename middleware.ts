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
  const response = NextResponse.next()
  
  // Add cache-busting headers to all responses
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  response.headers.set('X-Content-Version', Date.now().toString())
  
  // Just let the request through - authentication is handled by the AdminAuthWrapper
  return response
}

// Specify the paths that should be checked by the middleware
export const config = {
  matcher: ['/admin/:path*']
} 