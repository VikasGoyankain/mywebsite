import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// Simplified Redis key patterns - only use hash structure
const REDIS_KEYS = {
  URL_DATA: 'url:{shortcode}',
  ALL_CODES: 'urls:all_codes',
  REVOKED: 'urls:revoked'
} as const;

// Helper function to normalize URLs
function normalizeUrl(url: string): string {
  let normalized = url.toLowerCase().trim();
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = 'https://' + normalized;
  }
  return normalized;
}

// Helper function to generate short code
function generateShortCode(): string {
  return Math.random().toString(36).substring(2, 8);
}

function getUrlKey(shortCode: string): string {
  return REDIS_KEYS.URL_DATA.replace('{shortcode}', shortCode);
}

// Helper function to find URL by original URL (scan through all URLs)
async function findUrlByOriginal(originalUrl: string): Promise<string | null> {
  try {
    const allCodes = await redis.smembers(REDIS_KEYS.ALL_CODES);
    
    for (const shortCode of allCodes) {
      const urlData = await redis.hgetall(getUrlKey(shortCode));
      if (urlData && urlData.originalUrl === originalUrl) {
        return shortCode;
      }
    }
    return null;
  } catch (error) {
    console.error('Error finding URL by original:', error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { url, expiresAt } = await request.json();
    const normalizedUrl = normalizeUrl(url);
    
    console.log('POST request:', { originalUrl: url, normalizedUrl, expiresAt });
    
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl) {
      const requestUrl = new URL(request.url);
      baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
    }
    
    // Check if URL already exists by scanning through all URLs
    const existingShortCode = await findUrlByOriginal(normalizedUrl);
    
    if (existingShortCode) {
      console.log(`Found existing short code ${existingShortCode} for URL ${normalizedUrl}`);
      
      // Get existing URL data from hash
      const urlData = await redis.hgetall(getUrlKey(existingShortCode));
      
      if (urlData && urlData.originalUrl) {
        return NextResponse.json({ 
          shortCode: existingShortCode, 
          shortUrl: `${baseUrl}/s/${existingShortCode}`,
          exists: true,
          clickCount: parseInt(urlData.clicks || '0', 10),
          createdAt: urlData.createdAt,
          expiresAt: urlData.expiresAt || null,
          isRevoked: urlData.isRevoked === 'true'
        });
      }
    }
    
    console.log(`Creating new short code for URL ${normalizedUrl}`);
    
    // Create new URL
    const shortCode = generateShortCode();
    const shortUrl = `${baseUrl}/s/${shortCode}`;
    const now = new Date().toISOString();

    // Store URL data in hash (single key per URL)
    await redis.hset(getUrlKey(shortCode), {
      originalUrl: normalizedUrl,
      clicks: '0',
      createdAt: now,
      lastAccessed: now,
      isRevoked: 'false'
    });

    // Add to collections (only the set, no ZADD)
    await redis.sadd(REDIS_KEYS.ALL_CODES, shortCode);

    // Set expiration if provided
    if (expiresAt) {
      await redis.hset(getUrlKey(shortCode), { expiresAt });
      
      const expDate = new Date(expiresAt);
      const ttlSeconds = Math.floor((expDate.getTime() - new Date().getTime()) / 1000);
      
      if (ttlSeconds > 0) {
        await redis.expire(getUrlKey(shortCode), ttlSeconds);
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

    // Get all URLs
    if (action === 'getAll') {
      let baseUrl = process.env.NEXT_PUBLIC_APP_URL;
      if (!baseUrl) {
        const requestUrl = new URL(request.url);
        baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
      }

      // Get all shortcodes from set
      const allCodes = await redis.smembers(REDIS_KEYS.ALL_CODES);
      const result = [];

      // Get data for each shortcode
      for (const shortCode of allCodes) {
        const urlData = await redis.hgetall(getUrlKey(shortCode));
        
        if (urlData && urlData.originalUrl) {
          result.push({
            id: shortCode,
            shortCode,
            originalUrl: urlData.originalUrl,
            shortUrl: `${baseUrl}/s/${shortCode}`,
            clickCount: parseInt(urlData.clicks || '0', 10),
            createdAt: urlData.createdAt,
            expiresAt: urlData.expiresAt || null,
            isRevoked: urlData.isRevoked === 'true',
          });
        }
      }
      
      return NextResponse.json(result);
    }

    // Get specific URL
    if (!code) {
      return NextResponse.json(
        { error: 'Short code is required' },
        { status: 400 }
      );
    }

    const urlData = await redis.hgetall(getUrlKey(code));

    if (!urlData || !urlData.originalUrl) {
      return NextResponse.json(
        { error: 'URL not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      url: urlData.originalUrl, 
      clicks: urlData.clicks || '0', 
      created: urlData.createdAt,
      expiresAt: urlData.expiresAt,
      revoked: urlData.isRevoked === 'true',
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
    const urlData = await redis.hgetall(getUrlKey(code));
    if (!urlData || !urlData.originalUrl) {
      return NextResponse.json(
        { error: 'URL not found' },
        { status: 404 }
      );
    }
    
    console.log(`Processing action ${action} for code ${code}`);
    
    // Handle revoke action
    if (action === 'revoke') {
      const currentStatus = urlData.isRevoked === 'true';
      
      if (currentStatus) {
        // Unrevoke
        await redis.hset(getUrlKey(code), { isRevoked: 'false' });
        await redis.srem(REDIS_KEYS.REVOKED, code);
        
        return NextResponse.json({ 
          success: true, 
          message: 'URL reactivated successfully',
          isRevoked: false
        });
      } else {
        // Revoke
        await redis.hset(getUrlKey(code), { isRevoked: 'true' });
        await redis.sadd(REDIS_KEYS.REVOKED, code);
        
        return NextResponse.json({ 
          success: true, 
          message: 'URL revoked successfully',
          isRevoked: true
        });
      }
    }
    
    // Handle delete action
    // Delete main data
    await redis.del(getUrlKey(code));
    
    // Remove from collections
    await redis.srem(REDIS_KEYS.ALL_CODES, code);
    await redis.srem(REDIS_KEYS.REVOKED, code);
    
    return NextResponse.json({ success: true, message: 'URL deleted successfully' });
  } catch (error) {
    console.error('Error deleting URL:', error);
    return NextResponse.json(
      { error: 'Failed to delete URL' },
      { status: 500 }
    );
  }
}

// Migration from old system to new hash-based system
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action !== 'migrate-to-hash') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    console.log('Starting migration to hash-based system...');
    
    // Get all old URL keys
    const keys = await redis.keys('url:*');
    let migratedCount = 0;
    const errors = [];
    
    for (const key of keys) {
      try {
        const shortCode = key.replace('url:', '');
        const originalUrl = await redis.get<string>(key);
        
        if (originalUrl) {
          // Get all related data from old system
          const clicks = await redis.get<string>(`clicks:${shortCode}`) || '0';
          const created = await redis.get<string>(`created:${shortCode}`) || new Date().toISOString();
          const expires = await redis.get<string>(`expires:${shortCode}`);
          const revoked = await redis.get<string>(`revoked:${shortCode}`) || 'false';
          
          const timestamp = Math.floor(new Date(created).getTime() / 1000);
          
          // Create new hash structure
          await redis.hset(getUrlKey(shortCode), {
            originalUrl,
            clicks,
            createdAt: created,
            lastAccessed: created,
            isRevoked: revoked
          });
          
          if (expires) {
            await redis.hset(getUrlKey(shortCode), { expiresAt: expires });
          }
          
          // Create indexes
          await redis.set(getOriginalKey(originalUrl), shortCode);
          await redis.sadd(REDIS_KEYS.ALL_CODES, shortCode);
          await redis.zadd(REDIS_KEYS.BY_CLICKS, [parseInt(clicks, 10), shortCode]);
          await redis.zadd(REDIS_KEYS.BY_DATE, [timestamp, shortCode]);
          
          if (revoked === 'true') {
            await redis.sadd(REDIS_KEYS.REVOKED, shortCode);
          }
          
          migratedCount++;
        }
      } catch (error) {
        console.error(`Error migrating ${key}:`, error);
        errors.push(key);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Migration completed. Migrated ${migratedCount} URLs to hash-based system.`,
      errors: errors.length > 0 ? errors : null
    });
  } catch (error) {
    console.error('Error in migration:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}
