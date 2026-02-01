import { NextRequest, NextResponse } from 'next/server';
import { uploadUrlToImageKit } from '@/lib/imagekit';

// POST /api/readings/upload-image - Upload image from URL to ImageKit
export async function POST(request: NextRequest) {
  try {
    const { imageUrl, title } = await request.json();

    if (!imageUrl?.trim()) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(imageUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Generate filename from title or timestamp
    const sanitizedTitle = title
      ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 30)
      : 'reading';
    const fileName = `${sanitizedTitle}_${Date.now()}`;

    // Upload to ImageKit
    const cdnUrl = await uploadUrlToImageKit(imageUrl, fileName, 'readings');

    return NextResponse.json({ 
      success: true, 
      imageUrl: cdnUrl,
      message: 'Image uploaded to CDN successfully' 
    });
  } catch (error) {
    console.error('Error in POST /api/readings/upload-image:', error);
    const message = error instanceof Error ? error.message : 'Failed to upload image';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
