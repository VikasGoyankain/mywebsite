import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  try {
    // Get code from params without destructuring or accessing properties directly
    const code = String(params?.code || '');
    
    console.log(`Processing redirect for code: ${code}`);
    
    if (!code) {
      console.log('No code provided');
      return NextResponse.redirect(new URL('/404', request.url));
    }
    
    // Get the URL from Redis
    const url = await redis.get<string>(`url:${code}`);
    console.log(`URL for ${code}: ${url || 'not found'}`);
    
    // Check if URL exists
    if (!url) {
      console.log(`URL not found for code: ${code}`);
      return NextResponse.redirect(new URL('/404', request.url));
    }
    
    // Check if URL is revoked
    const revoked = await redis.get(`revoked:${code}`);
    console.log(`Revoked status for ${code}: ${revoked}`);
    
    if (revoked === 'true') {
      console.log(`URL ${code} is revoked, redirecting to 404`);
      return NextResponse.redirect(new URL('/404?reason=revoked', request.url));
    }
    
    // Check if URL has expired (this is a backup check, Redis TTL should handle this)
    const expiresAt = await redis.get(`expires:${code}`);
    if (expiresAt) {
      const expDate = new Date(expiresAt as string);
      if (expDate < new Date()) {
        console.log(`URL ${code} has expired, redirecting to 404`);
        return NextResponse.redirect(new URL('/404?reason=expired', request.url));
      }
    }

    // Increment click count
    await redis.incr(`clicks:${code}`);
    console.log(`Incremented click count for ${code}`);

    // Return a redirect response to the target URL
    console.log(`Redirecting to ${url}`);
    return NextResponse.redirect(url as string);
  } catch (error) {
    console.error('Error redirecting:', error);
    return NextResponse.redirect(new URL('/404', request.url));
  }
}
