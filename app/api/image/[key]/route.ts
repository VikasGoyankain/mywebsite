import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const imageKey = params.key
    
    if (!imageKey) {
      return new NextResponse('Image key is required', { status: 400 })
    }

    const imageData = await redis.get(imageKey)
    
    if (!imageData) {
      return new NextResponse('Image not found', { status: 404 })
    }

    // Extract the data URL
    const { dataUrl, type } = imageData as { dataUrl: string; type: string }
    
    // Convert base64 to buffer
    const base64Data = dataUrl.split(',')[1]
    const buffer = Buffer.from(base64Data, 'base64')

    // Return the image with appropriate headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': type,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    })
  } catch (error) {
    console.error('Error serving image:', error)
    return new NextResponse('Failed to serve image', { status: 500 })
  }
}

// Optional: Add a DELETE endpoint to remove images
export async function DELETE(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const imageKey = params.key
    
    if (!imageKey) {
      return NextResponse.json(
        { success: false, error: 'Image key is required' },
        { status: 400 }
      )
    }

    // Delete from Redis
    await redis.del(imageKey)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete image' },
      { status: 500 }
    )
  }
} 