import ImageKit from 'imagekit';
import axios from 'axios';

// ImageKit configuration
export const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "public_DXRDeyqTBsGaXhq2h1pkDQahL4M=",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "private_vbJKz3FPpP1uHBkZB5+xqshb7uo=",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/pgkm20dh4"
});

// Function to upload a file from base64 to ImageKit
export async function uploadToImageKit(
  base64Data: string, 
  fileName: string = `upload_${Date.now()}`,
  folder: string = "uploads"
): Promise<string> {
  try {
    // Remove data:image/jpeg;base64, part if present
    const base64File = base64Data.includes('base64,') 
      ? base64Data.split('base64,')[1] 
      : base64Data;
    
    const response = await imagekit.upload({
      file: base64File,
      fileName: fileName,
      folder: folder,
      useUniqueFileName: true,
    });
    
    return response.url;
  } catch (error) {
    console.error("ImageKit upload error:", error);
    throw new Error("Failed to upload image to ImageKit");
  }
}

// Function to upload a file from URL to ImageKit
export async function uploadUrlToImageKit(
  url: string,
  fileName: string = `url_upload_${Date.now()}`,
  folder: string = "uploads"
): Promise<string> {
  try {
    const response = await imagekit.upload({
      file: url,
      fileName: fileName,
      folder: folder,
      useUniqueFileName: true,
    });
    
    return response.url;
  } catch (error) {
    console.error("ImageKit URL upload error:", error);
    throw new Error("Failed to upload URL to ImageKit");
  }
}

// Function to delete a file from ImageKit by fileId or file URL
export async function deleteFromImageKit(fileIdOrUrl: string): Promise<void> {
  try {
    let fileId = fileIdOrUrl;
    // If a URL is provided, extract the file name and search by name
    if (fileIdOrUrl.startsWith('http')) {
      const urlObj = new URL(fileIdOrUrl);
      const pathParts = urlObj.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      // List files by name (ImageKit supports this)
      const files = await imagekit.listFiles({ limit: 10, searchQuery: `name = \"${fileName}\"` });
      if (files && files.length > 0) {
        // Try to match by file name and url ending
        const fileObj = files.find(f => 'fileId' in f && 'url' in f && f.url.endsWith(fileName));
        if (fileObj && 'fileId' in fileObj) {
          fileId = fileObj.fileId;
        } else {
          // Not found, nothing to delete
          return;
        }
      } else {
        // Not found, nothing to delete
        return;
      }
    }
    // Use direct REST API call for deletion
    const apiKey = process.env.IMAGEKIT_PRIVATE_KEY || '';
    const auth = Buffer.from(apiKey + ':').toString('base64');
    await axios.delete(`https://api.imagekit.io/v1/files/${fileId}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${auth}`
      }
    });
  } catch (error) {
    if (error && typeof error === 'object') {
      console.error('ImageKit delete error:', JSON.stringify(error, null, 2));
    } else {
      console.error('ImageKit delete error:', error);
    }
  }
}