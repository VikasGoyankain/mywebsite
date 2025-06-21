import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';

// Redis key for folders
const FOLDERS_KEY = 'gallery:folders';
const MEDIA_KEY = 'gallery:media';

// Get a specific folder
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Special case for "all-photos"
    if (id === 'all-photos') {
      const mediaItems = await redis.get<any[]>(MEDIA_KEY) || [];
      
      return NextResponse.json({
        folder: {
          id: 'all-photos',
          name: 'All',
          itemCount: mediaItems.length,
          createdAt: new Date().toISOString(),
          isDefault: true
        }
      }, { status: 200 });
    }
    
    // Get folders from Redis
    const folders = await redis.get<any[]>(FOLDERS_KEY) || [];
    
    // Find the specific folder
    const folder = folders.find((f: any) => f.id === id);
    
    if (!folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      );
    }
    
    // Get media items to calculate count
    const mediaItems = await redis.get<any[]>(MEDIA_KEY) || [];
    const itemCount = mediaItems.filter((item: any) => item.folderId === id).length;
    
    return NextResponse.json({
      folder: {
        ...folder,
        itemCount
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching folder:', error);
    return NextResponse.json(
      { error: 'Failed to fetch folder' },
      { status: 500 }
    );
  }
}

// Update a folder
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Don't allow updating the "all-photos" folder
    if (id === 'all-photos') {
      return NextResponse.json(
        { error: 'Cannot update the All Photos folder' },
        { status: 400 }
      );
    }
    
    const updates = await request.json();
    
    // Get folders from Redis
    const folders = await redis.get<any[]>(FOLDERS_KEY) || [];
    
    // Find the folder index
    const folderIndex = folders.findIndex((f: any) => f.id === id);
    
    if (folderIndex === -1) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      );
    }
    
    // Update the folder
    const updatedFolder = {
      ...folders[folderIndex],
      ...updates,
      lastUpdated: new Date().toISOString()
    };
    
    // Replace the folder in the array
    folders[folderIndex] = updatedFolder;
    
    // Save back to Redis
    await redis.set(FOLDERS_KEY, folders);
    
    return NextResponse.json({ folder: updatedFolder }, { status: 200 });
  } catch (error) {
    console.error('Error updating folder:', error);
    return NextResponse.json(
      { error: 'Failed to update folder' },
      { status: 500 }
    );
  }
}

// Delete a folder
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Don't allow deleting the "all-photos" folder
    if (id === 'all-photos') {
      return NextResponse.json(
        { error: 'Cannot delete the All Photos folder' },
        { status: 400 }
      );
    }
    
    // Get folders from Redis
    const folders = await redis.get<any[]>(FOLDERS_KEY) || [];
    
    // Check if folder exists
    if (!folders.some((f: any) => f.id === id)) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      );
    }
    
    // Filter out the folder
    const updatedFolders = folders.filter((f: any) => f.id !== id);
    
    // Save back to Redis
    await redis.set(FOLDERS_KEY, updatedFolders);
    
    // Update media items to remove folder reference
    const mediaItems = await redis.get<any[]>(MEDIA_KEY) || [];
    const updatedMedia = mediaItems.map((item: any) => {
      if (item.folderId === id) {
        return { ...item, folderId: undefined };
      }
      return item;
    });
    
    // Save updated media items
    await redis.set(MEDIA_KEY, updatedMedia);
    
    return NextResponse.json(
      { success: true, message: 'Folder deleted' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json(
      { error: 'Failed to delete folder' },
      { status: 500 }
    );
  }
} 