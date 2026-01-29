import { NextRequest, NextResponse } from 'next/server';
import { imagekit } from '@/lib/imagekit';

// Get file details from ImageKit
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get file details from ImageKit
    const file = await imagekit.getFileDetails(id);
    
    return NextResponse.json({ file });
  } catch (error) {
    console.error('Error getting file details from ImageKit:', error);
    return NextResponse.json(
      { error: 'Failed to get file details from ImageKit' },
      { status: 500 }
    );
  }
}

// Delete a file from ImageKit
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }
    
    // Delete the file from ImageKit
    await imagekit.deleteFile(id);
    
    return NextResponse.json(
      { success: true, message: 'File deleted from ImageKit' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting file from ImageKit:', error);
    
    // Check if the error is because the file doesn't exist
    if ((error as any)?.message?.includes('does not exist')) {
      return NextResponse.json(
        { error: 'File not found in ImageKit' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete file from ImageKit' },
      { status: 500 }
    );
  }
} 