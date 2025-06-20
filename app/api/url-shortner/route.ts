import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const { url, expiresAt } = await request.json();
    const shortCode = Math.random().toString(36).substring(2, 8);
    
    // Get the base URL from the environment variable or fallback to request URL
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    
    // If no environment variable is set, extract from request
    if (!baseUrl) {
      const requestUrl = new URL(request.url);
      baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
    }
    
    const shortUrl = `${baseUrl}/s/${shortCode}`;

    // Store in Redis with TTL if needed
    await redis.set(`url:${shortCode}`, url);
    await redis.set(`clicks:${shortCode}`, 0);
    await redis.set(`created:${shortCode}`, new Date().toISOString());
    
    // If expiration is set, store it and set TTL
    if (expiresAt) {
      await redis.set(`expires:${shortCode}`, expiresAt);
      
      // Calculate TTL in seconds
      const now = new Date();
      const expDate = new Date(expiresAt);
      const ttlSeconds = Math.floor((expDate.getTime() - now.getTime()) / 1000);
      
      if (ttlSeconds > 0) {
        // Set expiration for all related keys
        await redis.expire(`url:${shortCode}`, ttlSeconds);
        await redis.expire(`clicks:${shortCode}`, ttlSeconds);
        await redis.expire(`created:${shortCode}`, ttlSeconds);
        await redis.expire(`expires:${shortCode}`, ttlSeconds);
      }
    }

    return NextResponse.json({ shortCode, shortUrl });
  } catch (error) {
    console.error('Error creating short URL:', error);
    return NextResponse.json(
      { error: 'Failed to create short URL' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const action = searchParams.get('action');

    // If requesting all URLs
    if (action === 'getAll') {
      // Get all URL keys from Redis
      const keys = await redis.keys('url:*');
      const result = [];
      
      // Get base URL for short URLs
      let baseUrl = process.env.NEXT_PUBLIC_APP_URL;
      if (!baseUrl) {
        const requestUrl = new URL(request.url);
        baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
      }

      // Process each URL
      for (const key of keys) {
        const shortCode = key.replace('url:', '');
        const originalUrl = await redis.get(`url:${shortCode}`);
        const clicks = await redis.get(`clicks:${shortCode}`) || 0;
        const created = await redis.get(`created:${shortCode}`) || new Date().toISOString();
        const expiresAt = await redis.get(`expires:${shortCode}`);
        
        // Check if URL is revoked
        const revoked = await redis.get(`revoked:${shortCode}`);
        console.log(`URL ${shortCode} revoked status: ${revoked}`);
        
        result.push({
          id: shortCode,
          shortCode,
          originalUrl,
          shortUrl: `${baseUrl}/s/${shortCode}`,
          clickCount: parseInt(clicks as string, 10) || 0,
          createdAt: created,
          expiresAt: expiresAt || null,
          isRevoked: revoked === 'true',
        });
      }
      
      return NextResponse.json(result);
    }

    // If requesting a specific URL
    if (!code) {
      return NextResponse.json(
        { error: 'Short code is required' },
        { status: 400 }
      );
    }

    const url = await redis.get(`url:${code}`);
    const clicks = await redis.get(`clicks:${code}`);
    const created = await redis.get(`created:${code}`);
    const expiresAt = await redis.get(`expires:${code}`);
    const revoked = await redis.get(`revoked:${code}`);

    if (!url) {
      return NextResponse.json(
        { error: 'URL not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      url, 
      clicks, 
      created,
      expiresAt,
      revoked: revoked === 'true',
      code
    });
  } catch (error) {
    console.error('Error retrieving URL:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve URL' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const action = searchParams.get('action');
    
    if (!code) {
      return NextResponse.json(
        { error: 'Short code is required' },
        { status: 400 }
      );
    }
    
    // Check if URL exists
    const url = await redis.get(`url:${code}`);
    if (!url) {
      return NextResponse.json(
        { error: 'URL not found' },
        { status: 404 }
      );
    }
    
    console.log(`Processing action ${action} for code ${code}`);
    
    // Handle revoke action
    if (action === 'revoke') {
      // Check current revoke status
      const currentStatus = await redis.get(`revoked:${code}`);
      console.log(`Current revoke status for ${code}: ${currentStatus}`);
      
      if (currentStatus === 'true') {
        // Unrevoke - remove the key
        await redis.del(`revoked:${code}`);
        console.log(`Unrevoked URL ${code}`);
        
        // Double check the deletion worked
        const checkStatus = await redis.get(`revoked:${code}`);
        console.log(`After unrevoke, status is: ${checkStatus}`);
        
        return NextResponse.json({ 
          success: true, 
          message: 'URL reactivated successfully',
          isRevoked: false
        });
      } else {
        // Revoke - set the key
        await redis.set(`revoked:${code}`, 'true');
        console.log(`Revoked URL ${code}`);
        
        // Double check the setting worked
        const checkStatus = await redis.get(`revoked:${code}`);
        console.log(`After revoke, status is: ${checkStatus}`);
        
        return NextResponse.json({ 
          success: true, 
          message: 'URL revoked successfully',
          isRevoked: true
        });
      }
    }
    
    // Handle delete action (default)
    await redis.del(`url:${code}`);
    await redis.del(`clicks:${code}`);
    await redis.del(`created:${code}`);
    await redis.del(`expires:${code}`);
    await redis.del(`revoked:${code}`);
    
    return NextResponse.json({ success: true, message: 'URL deleted successfully' });
  } catch (error) {
    console.error('Error deleting URL:', error);
    return NextResponse.json(
      { error: 'Failed to delete URL' },
      { status: 500 }
    );
  }
}
