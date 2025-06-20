import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// Function to normalize URLs for consistent matching
const normalizeUrl = (url: string): string => {
  // Add https:// prefix if missing
  let normalized = url.trim();
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = 'https://' + normalized;
  }
  
  try {
    // Create URL object to parse and normalize components
    const urlObj = new URL(normalized);
    
    // Remove trailing slashes
    let pathname = urlObj.pathname;
    while (pathname.endsWith('/') && pathname.length > 1) {
      pathname = pathname.slice(0, -1);
    }
    
    // Remove default ports
    const port = (urlObj.protocol === 'https:' && urlObj.port === '443') || 
                (urlObj.protocol === 'http:' && urlObj.port === '80') 
                ? '' : urlObj.port;
    
    // Remove www. if present (to avoid duplicate URLs with and without www)
    const hostname = urlObj.hostname.startsWith('www.') 
      ? urlObj.hostname.substring(4) 
      : urlObj.hostname;
    
    // Reconstruct the URL with normalized components
    const normalizedUrl = `${urlObj.protocol}//${hostname}${port ? ':' + port : ''}${pathname}${urlObj.search}${urlObj.hash}`;
    return normalizedUrl.toLowerCase();
  } catch (error) {
    // If URL parsing fails, return the original with https prefix
    console.error('URL normalization error:', error);
    return normalized.toLowerCase();
  }
};

export async function POST(request: Request) {
  try {
    const { url, expiresAt } = await request.json();
    
    // Normalize the URL for consistent matching
    const normalizedUrl = normalizeUrl(url);
    
    console.log('POST request:', { 
      originalUrl: url, 
      normalizedUrl, 
      expiresAt 
    });
    
    // Get the base URL from the environment variable or fallback to request URL
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    
    // If no environment variable is set, extract from request
    if (!baseUrl) {
      const requestUrl = new URL(request.url);
      baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
    }
    
    // First, check if we have this URL in our index
    const existingShortCode = await redis.get<string>(`original:${normalizedUrl}`);
    
    if (existingShortCode) {
      console.log(`Found existing short code ${existingShortCode} for URL ${normalizedUrl}`);
      
      // URL exists, retrieve its data
      const clicks = await redis.get<string>(`clicks:${existingShortCode}`) || '0';
      const created = await redis.get<string>(`created:${existingShortCode}`) || new Date().toISOString();
      const existingExpires = await redis.get<string>(`expires:${existingShortCode}`);
      const revoked = await redis.get<string>(`revoked:${existingShortCode}`);
      
      return NextResponse.json({ 
        shortCode: existingShortCode, 
        shortUrl: `${baseUrl}/s/${existingShortCode}`,
        exists: true,
        clickCount: parseInt(clicks, 10),
        createdAt: created,
        expiresAt: existingExpires || null,
        isRevoked: revoked === 'true'
      });
    }
    
    console.log(`Creating new short code for URL ${normalizedUrl}`);
    
    // URL doesn't exist, create a new short URL
    const shortCode = Math.random().toString(36).substring(2, 8);
    const shortUrl = `${baseUrl}/s/${shortCode}`;

    // Store in Redis with TTL if needed
    await redis.set(`url:${shortCode}`, normalizedUrl); // Store normalized URL
    await redis.set(`clicks:${shortCode}`, 0);
    await redis.set(`created:${shortCode}`, new Date().toISOString());
    
    // Store the reverse mapping for future lookups
    await redis.set(`original:${normalizedUrl}`, shortCode);
    
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
        await redis.expire(`original:${normalizedUrl}`, ttlSeconds);
      }
    }

    return NextResponse.json({ 
      shortCode, 
      shortUrl,
      exists: false
    });
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
        const originalUrl = await redis.get<string>(`url:${shortCode}`);
        
        // Skip if URL is missing (could be a corrupted entry)
        if (!originalUrl) continue;
        
        const clicks = await redis.get<string>(`clicks:${shortCode}`) || '0';
        const created = await redis.get<string>(`created:${shortCode}`) || new Date().toISOString();
        const expiresAt = await redis.get<string>(`expires:${shortCode}`);
        
        // Check if URL is revoked
        const revoked = await redis.get<string>(`revoked:${shortCode}`);
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

    const url = await redis.get<string>(`url:${code}`);
    const clicks = await redis.get<string>(`clicks:${code}`);
    const created = await redis.get<string>(`created:${code}`);
    const expiresAt = await redis.get<string>(`expires:${code}`);
    const revoked = await redis.get<string>(`revoked:${code}`);

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
    const url = await redis.get<string>(`url:${code}`);
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
      const currentStatus = await redis.get<string>(`revoked:${code}`);
      console.log(`Current revoke status for ${code}: ${currentStatus}`);
      
      if (currentStatus === 'true') {
        // Unrevoke - remove the key
        await redis.del(`revoked:${code}`);
        console.log(`Unrevoked URL ${code}`);
        
        // Double check the deletion worked
        const checkStatus = await redis.get<string>(`revoked:${code}`);
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
        const checkStatus = await redis.get<string>(`revoked:${code}`);
        console.log(`After revoke, status is: ${checkStatus}`);
        
        return NextResponse.json({ 
          success: true, 
          message: 'URL revoked successfully',
          isRevoked: true
        });
      }
    }
    
    // Handle delete action (default)
    
    // URL is already normalized at this point
    // Delete the original URL index
    await redis.del(`original:${url}`);
    
    // Delete all other keys
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

// Add a migration endpoint to create original URL indexes for existing URLs
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    // Only process the migration action
    if (action !== 'migrate-indexes') {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
    
    console.log('Starting URL index migration process...');
    
    // Get all URL keys
    const keys = await redis.keys('url:*');
    let migratedCount = 0;
    const errors = [];
    
    // For each URL, create a reverse index
    console.log(`Found ${keys.length} URLs to process`);
    
    for (const key of keys) {
      try {
        const shortCode = key.replace('url:', '');
        const originalUrl = await redis.get<string>(key);
        
        if (originalUrl) {
          // Normalize the URL
          const normalizedUrl = normalizeUrl(originalUrl);
          
          console.log(`Processing URL: ${shortCode}`, { 
            originalUrl, 
            normalizedUrl, 
            same: originalUrl === normalizedUrl 
          });
          
          // Check if the original URL index already exists
          const existingCode = await redis.get<string>(`original:${normalizedUrl}`);
          
          if (!existingCode) {
            // Create the index with normalized URL
            await redis.set(`original:${normalizedUrl}`, shortCode);
            
            // Update the url:shortCode to use the normalized URL
            await redis.set(`url:${shortCode}`, normalizedUrl);
            
            // Apply the same TTL as the original URL if it has one
            const ttl = await redis.ttl(key);
            if (ttl > 0) {
              await redis.expire(`original:${normalizedUrl}`, ttl);
            }
            
            migratedCount++;
          } else if (existingCode !== shortCode) {
            // We have a conflict: two different short codes for the same normalized URL
            console.log(`Conflict: URL ${normalizedUrl} has multiple short codes: ${existingCode} and ${shortCode}`);
            
            // We'll keep the older one and update our records
            const createdExisting = await redis.get<string>(`created:${existingCode}`);
            const createdCurrent = await redis.get<string>(`created:${shortCode}`);
            
            const dateExisting = createdExisting ? new Date(createdExisting) : new Date();
            const dateCurrent = createdCurrent ? new Date(createdCurrent) : new Date();
            
            // Keep the older shortcode
            if (dateCurrent < dateExisting) {
              // Current is older, make it the canonical one
              await redis.set(`original:${normalizedUrl}`, shortCode);
              
              // Merge click counts
              const clicksExisting = parseInt(await redis.get<string>(`clicks:${existingCode}`) || '0', 10);
              const clicksCurrent = parseInt(await redis.get<string>(`clicks:${shortCode}`) || '0', 10);
              await redis.set(`clicks:${shortCode}`, clicksCurrent + clicksExisting);
              
              // Clean up the duplicate
              await redis.del(`url:${existingCode}`);
              await redis.del(`clicks:${existingCode}`);
              await redis.del(`created:${existingCode}`);
              await redis.del(`expires:${existingCode}`);
              await redis.del(`revoked:${existingCode}`);
            } else {
              // Existing is older, keep it but merge click counts
              const clicksExisting = parseInt(await redis.get<string>(`clicks:${existingCode}`) || '0', 10);
              const clicksCurrent = parseInt(await redis.get<string>(`clicks:${shortCode}`) || '0', 10);
              await redis.set(`clicks:${existingCode}`, clicksCurrent + clicksExisting);
              
              // Clean up the duplicate
              await redis.del(`url:${shortCode}`);
              await redis.del(`clicks:${shortCode}`);
              await redis.del(`created:${shortCode}`);
              await redis.del(`expires:${shortCode}`);
              await redis.del(`revoked:${shortCode}`);
            }
            
            migratedCount++;
          }
        }
      } catch (error) {
        console.error(`Error migrating ${key}:`, error);
        errors.push(key);
      }
    }
    
    console.log('Migration complete', { migratedCount, errors });
    
    return NextResponse.json({
      success: true,
      message: `Migration completed. Created/updated ${migratedCount} indexes.`,
      errors: errors.length > 0 ? errors : null
    });
  } catch (error) {
    console.error('Error in migration:', error);
    return NextResponse.json(
      { error: 'Migration failed' },
      { status: 500 }
    );
  }
}
