import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { v4 as uuidv4 } from 'uuid';

// Redis key for folders
const FOLDERS_KEY = 'gallery:folders';
const MEDIA_KEY = 'gallery:media';

// Get all folders
export async function GET(request: NextRequest) {
  try {
    // Get folders from Redis
    const folders = await redis.get<any[]>(FOLDERS_KEY) || [];
    
    // Get media items to calculate counts
    const mediaItems = await redis.get<any[]>(MEDIA_KEY) || [];
    
    // Calculate item counts for each folder
    let foldersWithCounts = folders.map((folder: any) => {
      const itemCount = mediaItems.filter((item: any) => item.folderId === folder.id).length;
      return {
        ...folder,
        itemCount
      };
    });
    
    // Filter out any existing "all-photos" folders to avoid duplicates
    foldersWithCounts = foldersWithCounts.filter((folder: any) => folder.id !== 'all-photos');
    
    // Add the "All" folder at the beginning of the array
    foldersWithCounts.unshift({
      id: 'all-photos',
      name: 'All',
      itemCount: mediaItems.length,
      createdAt: new Date().toISOString(),
      isDefault: true
    });
    
    return NextResponse.json({ folders: foldersWithCounts }, { status: 200 });
  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch folders' },
      { status: 500 }
    );
  }
}

// Create a new folder
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'Folder name is required' },
        { status: 400 }
      );
    }
    
    // Generate a new folder
    const newFolder = {
      id: uuidv4(),
      name: body.name,
      createdAt: new Date().toISOString(),
      itemCount: 0
    };
    
    // Get existing folders
    const existingFolders = await redis.get<any[]>(FOLDERS_KEY) || [];
    
    // Add new folder
    const updatedFolders = [...existingFolders, newFolder];
    
    // Save to Redis
    await redis.set(FOLDERS_KEY, updatedFolders);
    
    return NextResponse.json(
      { success: true, folder: newFolder },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json(
      { error: 'Failed to create folder' },
      { status: 500 }
    );
  }
} 