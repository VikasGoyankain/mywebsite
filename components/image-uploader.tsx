"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, ImageIcon } from "lucide-react"
import Image from "next/image"

interface ImageUploaderProps {
  currentImageUrl: string
  onImageSelect: (imageUrl: string, file?: File) => void
  className?: string
  buttonText?: string
}

export function ImageUploader({
  currentImageUrl,
  onImageSelect,
  className = "",
  buttonText = "Upload Image",
}: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setIsLoading(true)
    
    try {
      // Optimize image before creating preview
      const optimizedImage = await optimizeImage(file)
      
      // Create a local preview URL with optimized image
      const objectUrl = URL.createObjectURL(optimizedImage)
      setPreviewUrl(objectUrl)
      
      // Pass both the URL and optimized file to the parent component
      onImageSelect(objectUrl, optimizedImage)
    } catch (error) {
      console.error("Error processing image:", error)
      // Fall back to original file if optimization fails
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)
      onImageSelect(objectUrl, file)
    } finally {
      setIsLoading(false)
    }
  }

  // Optimize image for faster loading
  const optimizeImage = async (file: File): Promise<File> => {
    // Increase max file size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      throw new Error("Image too large (max 10MB)");
    }
    
    // Create a canvas for image resizing
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Create a promise to handle image loading
    const imageLoadPromise = new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
    
    try {
      await imageLoadPromise;
      
      // Calculate new dimensions while maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      const maxDimension = 1200; // Max dimension for either width or height
      
      if (width > height && width > maxDimension) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else if (height > maxDimension) {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
      
      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;
      
      // Draw and resize image
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Convert to blob with quality setting
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/jpeg', 0.85); // Use JPEG with 85% quality
      });
      
      // Create a new file from the blob
      return new File([blob], file.name, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });
    } catch (error) {
      console.error("Error optimizing image:", error);
      // If optimization fails, return the original file
      return file;
    } finally {
      // Clean up
      URL.revokeObjectURL(img.src);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleClearImage = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    onImageSelect(currentImageUrl)
  }

  const displayUrl = previewUrl || currentImageUrl

  return (
    <div className={`relative ${className}`}>
      <div
        className="relative rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {isLoading ? (
          <div className="flex items-center justify-center w-full h-full p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : displayUrl ? (
          <div className="w-full h-full">
            <Image
              src={displayUrl}
              alt="Selected image"
              className="object-cover w-full h-full"
              width={300}
              height={300}
              priority={true}
              unoptimized={displayUrl.startsWith('blob:')}
              loading="eager"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8">
            <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-gray-500 text-sm">No image selected</p>
          </div>
        )}

        {/* Overlay with buttons */}
        <div
          className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${
            isHovering || !displayUrl ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex gap-2">
            <Button size="sm" onClick={handleButtonClick} className="bg-white text-gray-800 hover:bg-gray-100" disabled={isLoading}>
              <Upload className="w-4 h-4 mr-2" />
              {buttonText}
            </Button>
            {displayUrl && (
              <Button size="sm" variant="destructive" onClick={handleClearImage} disabled={isLoading}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*"
        className="hidden" 
      />
    </div>
  )
}
