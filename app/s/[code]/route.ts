import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Redis key patterns
const REDIS_KEYS = {
  URL_DATA: 'url:{shortcode}',
  ALL_CODES: 'urls:all_codes',
  REVOKED: 'urls:revoked'
} as const;

function getUrlKey(shortCode: string): string {
  return REDIS_KEYS.URL_DATA.replace('{shortcode}', shortCode);
}

export async function GET(
  request: Request,
  context: { params: Promise<{ code: string }> }
) {
  try {
    // Fix for Next.js 15 - await params
    const { code } = await context.params;
    
    console.log(`Processing redirect for code: ${code}`);
    
    // Get the URL data from Redis hash
    const urlData = await redis.hgetall(getUrlKey(code));
    console.log(`URL data for ${code}:`, urlData);
    
    // Check if URL exists
    if (!urlData || !urlData.originalUrl) {
      console.log(`URL not found for code: ${code}`);
      return NextResponse.redirect(new URL('/404', request.url));
    }
    
    // Check if URL is revoked
    if (urlData.isRevoked === 'true') {
      console.log(`URL ${code} is revoked, redirecting to 404`);
      return NextResponse.redirect(new URL('/404?reason=revoked', request.url));
    }
    
    // Check if URL has expired
    if (urlData.expiresAt) {
      const expDate = new Date(urlData.expiresAt);
      if (expDate < new Date()) {
        console.log(`URL ${code} has expired, redirecting to 404`);
        return NextResponse.redirect(new URL('/404?reason=expired', request.url));
      }
    }

    // Increment click count and update last accessed
    const newClicks = parseInt(urlData.clicks || '0', 10) + 1;
    await redis.hset(getUrlKey(code), {
      clicks: newClicks.toString(),
      lastAccessed: new Date().toISOString()
    });
    
    console.log(`Incremented click count for ${code} to ${newClicks}`);

    // Return a redirect response to the target URL
    console.log(`Redirecting to ${urlData.originalUrl}`);
    return NextResponse.redirect(urlData.originalUrl);
  } catch (error) {
    console.error('Error redirecting:', error);
    return NextResponse.redirect(new URL('/404', request.url));
  }
}
