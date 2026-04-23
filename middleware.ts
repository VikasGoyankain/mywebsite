import { NextRequest, NextResponse } from 'next/server'

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

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}