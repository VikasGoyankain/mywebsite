import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { v4 as uuidv4 } from 'uuid'
import { imagekit } from '@/lib/imagekit'

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { file, fileName, folder = 'uploads' } = data
    
    if (!file) {
      return NextResponse.json(
        { error: 'File data is required' }, 
        { status: 400 }
      )
    }
    
    // Handle base64 data
    let fileData = file
    if (file.includes('base64,')) {
      fileData = file.split('base64,')[1]
    }
    
    // Upload to ImageKit
    const uploadResponse = await imagekit.upload({
      file: fileData,
      fileName: fileName || `upload_${Date.now()}`,
      folder: folder,
      useUniqueFileName: true,
    })
    
    return NextResponse.json({
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
      success: true
    })
  } catch (error: any) {
    console.error('ImageKit upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Upload failed' }, 
      { status: 500 }
    )
  }
}

// Endpoint to handle GET requests - either for auth parameters or image retrieval
export async function GET(request: NextRequest) {
  // Check if we're requesting auth parameters or an image
  const imageKey = request.nextUrl.searchParams.get('key')
  
  // If no key is provided, return auth parameters for client-side uploads
  if (!imageKey) {
    try {
      const authenticationParameters = imagekit.getAuthenticationParameters()
      return NextResponse.json(authenticationParameters)
    } catch (error: any) {
      console.error('ImageKit auth error:', error)
      return NextResponse.json(
        { error: error.message || 'Authentication failed' }, 
        { status: 500 }
      )
    }
  }
  
  // If key is provided, retrieve the image from Redis
  try {
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