import { NextRequest, NextResponse } from 'next/server';
import { imagekit } from '@/lib/imagekit';
import { v4 as uuidv4 } from 'uuid';

// Get ImageKit authentication parameters
export async function GET() {
  try {
    // Generate authentication parameters for client-side upload
    const authParams = imagekit.getAuthenticationParameters();
    
    return NextResponse.json({
      ...authParams,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "public_DXRDeyqTBsGaXhq2h1pkDQahL4M=",
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/pgkm20dh4"
    }, { status: 200 });
  } catch (error) {
    console.error('Error generating ImageKit auth parameters:', error);
    return NextResponse.json(
      { error: 'Failed to generate authentication parameters' },
      { status: 500 }
    );
  }
}

// Upload file to ImageKit
export async function POST(request: NextRequest) {
  try {
    // Check if the request is multipart/form-data
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle multipart form data
      const formData = await request.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        return NextResponse.json(
          { error: 'No file provided' },
          { status: 400 }
        );
      }
      
      // Convert file to buffer
      const buffer = Buffer.from(await file.arrayBuffer());
      
      // Get folder from form data or use default
      const folder = (formData.get('folder') as string) || 'gallery';
      
      // Generate a unique filename
      const fileName = `${uuidv4()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      // Upload to ImageKit
      const result = await imagekit.upload({
        file: buffer,
        fileName: fileName,
        folder: folder,
        useUniqueFileName: true
      });
      
      return NextResponse.json({
        fileId: result.fileId,
        name: file.name,
        url: result.url,
        thumbnailUrl: result.thumbnailUrl,
        fileType: file.type,
        size: file.size,
        width: result.width,
        height: result.height,
        folder: result.filePath ? result.filePath.split('/')[0] : folder
      }, { status: 201 });
    } else {
      // Handle JSON request (for base64 uploads)
      const body = await request.json();
      
      if (!body.file) {
        return NextResponse.json(
          { error: 'No file provided' },
          { status: 400 }
        );
      }
      
      // Extract base64 data if it includes the data URL prefix
      const base64File = body.file.includes('base64,') 
        ? body.file.split('base64,')[1] 
        : body.file;
      
      // Get folder or use default
      const folder = body.folder || 'gallery';
      
      // Generate a unique filename
      const fileName = `${uuidv4()}_${(body.fileName || 'upload').replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      // Upload to ImageKit
      const result = await imagekit.upload({
        file: base64File,
        fileName: fileName,
        folder: folder,
        useUniqueFileName: true
      });
      
      return NextResponse.json({
        fileId: result.fileId,
        name: body.fileName || 'upload',
        url: result.url,
        thumbnailUrl: result.thumbnailUrl,
        fileType: body.fileType || 'image/jpeg',
        size: body.size,
        width: result.width,
        height: result.height,
        folder: result.filePath ? result.filePath.split('/')[0] : folder
      }, { status: 201 });
    }
  } catch (error) {
    console.error('Error uploading to ImageKit:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 