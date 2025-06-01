import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Comment out the entire middleware function for now as we're handling auth in the layout component
// This prevents redirects that might be causing issues
export function middleware(request: NextRequest) {
  // Just let the request through - authentication is handled by the AdminAuthWrapper
  return NextResponse.next()
}

// Specify the paths that should be checked by the middleware
export const config = {
  matcher: ['/admin/:path*'],
} 