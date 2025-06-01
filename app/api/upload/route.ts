import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    // Generate a unique key for the image
    const imageKey = `profile:image:${uuidv4()}`
    
    // Store in Redis
    await redis.set(imageKey, {
      dataUrl,
      type: file.type,
      name: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    })

    // Return the image key as the URL
    // In a production environment, you might want to use a CDN or object storage
    // and return a public URL instead
    return NextResponse.json({
      success: true,
      url: `/api/image/${imageKey}`,
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}

// Optional: Add a GET endpoint to serve the images
export async function GET(request: NextRequest) {
  try {
    const imageKey = request.nextUrl.searchParams.get('key')
    
    if (!imageKey) {
      return NextResponse.json(
        { success: false, error: 'No image key provided' },
        { status: 400 }
      )
    }

    const imageData = await redis.get(imageKey)
    
    if (!imageData) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      )
    }

    // Return the image data
    return NextResponse.json({
      success: true,
      data: imageData,
    })
  } catch (error) {
    console.error('Error retrieving image:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve image' },
      { status: 500 }
    )
  }
} 