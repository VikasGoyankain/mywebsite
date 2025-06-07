import ImageKit from 'imagekit';

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