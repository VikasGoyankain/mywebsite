import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import ImageKit from 'imagekit';

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
});

// Redis key for media items
const MEDIA_KEY = 'gallery:media';

// Get a specific media item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Get all media items
    const allMedia = await redis.get<any[]>(MEDIA_KEY) || [];
    
    // Find the specific item
    const mediaItem = allMedia.find((item: any) => item.id === id);
    
    if (!mediaItem) {
      return NextResponse.json(
        { error: 'Media item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ media: mediaItem }, { status: 200 });
  } catch (error) {
    console.error('Error fetching media item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media item' },
      { status: 500 }
    );
  }
}

// Update a media item
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const updates = await request.json();
    
    // Get all media items
    const allMedia = await redis.get<any[]>(MEDIA_KEY) || [];
    
    // Find the item index
    const itemIndex = allMedia.findIndex((item: any) => item.id === id);
    
    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Media item not found' },
        { status: 404 }
      );
    }
    
    // Update the item
    const updatedItem = {
      ...allMedia[itemIndex],
      ...updates,
      lastUpdated: new Date().toISOString()
    };
    
    // Replace the item in the array
    allMedia[itemIndex] = updatedItem;
    
    // Save back to Redis
    await redis.set(MEDIA_KEY, allMedia);
    
    return NextResponse.json({ media: updatedItem }, { status: 200 });
  } catch (error) {
    console.error('Error updating media item:', error);
    return NextResponse.json(
      { error: 'Failed to update media item' },
      { status: 500 }
    );
  }
}

// Delete a media item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Get all media items
    const allMedia = await redis.get<any[]>(MEDIA_KEY) || [];
    
    // Find the item
    const mediaItem = allMedia.find((item: any) => item.id === id);
    
    if (!mediaItem) {
      return NextResponse.json(
        { error: 'Media item not found' },
        { status: 404 }
      );
    }
    
    // Filter out the item
    const updatedMedia = allMedia.filter((item: any) => item.id !== id);
    
    // Save back to Redis
    await redis.set(MEDIA_KEY, updatedMedia);
    
    // If the media has a fileId, delete from ImageKit
    if (mediaItem.fileId) {
      try {
        await imagekit.deleteFile(mediaItem.fileId);
      } catch (imagekitError) {
        console.error('Error deleting file from ImageKit:', imagekitError);
        // Continue with the deletion even if ImageKit deletion fails
      }
    }
    
    return NextResponse.json(
      { success: true, message: 'Media item deleted' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting media item:', error);
    return NextResponse.json(
      { error: 'Failed to delete media item' },
      { status: 500 }
    );
  }
} 