import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { v4 as uuidv4 } from 'uuid';

// Redis key for media items
const MEDIA_KEY = 'gallery:media';

// Get all media items
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId');
    
    // Get all media items from Redis
    const allMedia = await redis.get<any[]>(MEDIA_KEY) || [];
    
    // Filter by folder if specified
    const media = folderId 
      ? allMedia.filter((item: any) => 
          folderId === 'all-photos' 
            ? true 
            : item.folderId === folderId)
      : allMedia;
    
    return NextResponse.json({ media }, { status: 200 });
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media items' },
      { status: 500 }
    );
  }
}

// Create a new media item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.url || !body.name || !body.type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Generate ID if not provided
    const mediaItem = {
      ...body,
      id: body.id || uuidv4(),
      uploadDate: body.uploadDate || new Date().toISOString()
    };
    
    // Get existing media items
    const existingMedia = await redis.get<any[]>(MEDIA_KEY) || [];
    
    // Add new item
    const updatedMedia = [mediaItem, ...existingMedia];
    
    // Save to Redis
    await redis.set(MEDIA_KEY, updatedMedia);
    
    return NextResponse.json(
      { success: true, media: mediaItem },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating media item:', error);
    return NextResponse.json(
      { error: 'Failed to create media item' },
      { status: 500 }
    );
  }
} 