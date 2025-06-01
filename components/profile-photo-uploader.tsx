"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, X, ImageIcon, Link as LinkIcon, Loader2 } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/components/ui/use-toast"

interface ProfilePhotoUploaderProps {
  currentImageUrl: string
  onImageSelect: (imageUrl: string, file?: File) => void
  onImageRemove: () => void
  className?: string
}

export function ProfilePhotoUploader({
  currentImageUrl,
  onImageSelect,
  onImageRemove,
  className = "",
}: ProfilePhotoUploaderProps) {
  const { toast } = useToast()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [urlInput, setUrlInput] = useState("")
  const [activeTab, setActiveTab] = useState<"upload" | "url">("upload")
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
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error("Please select an image file (JPG, PNG, or GIF)")
      }
      
      // Optimize image before creating preview
      const optimizedImage = await optimizeImage(file)
      
      // Create a local preview URL with optimized image
      const objectUrl = URL.createObjectURL(optimizedImage)
      setPreviewUrl(objectUrl)
      
      // Pass both the URL and optimized file to the parent component
      onImageSelect(objectUrl, optimizedImage)
      
      toast({
        title: "Image uploaded",
        description: "Your profile image has been uploaded successfully.",
      })
    } catch (error) {
      console.error("Error processing image:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      })
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!urlInput) return

    setIsLoading(true)
    try {
      // Validate URL
      const url = new URL(urlInput)
      if (!url.protocol.startsWith('http')) {
        throw new Error("Please enter a valid HTTP(S) URL")
      }

      // Fetch image with proper error handling
      const response = await fetch(urlInput)
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`)
      }

      // Check content type
      const contentType = response.headers.get('content-type')
      if (!contentType?.startsWith('image/')) {
        throw new Error("URL must point to an image file (JPG, PNG, or GIF)")
      }

      // If we get here, the image is valid
      onImageSelect(urlInput)
      setUrlInput("")
      
      toast({
        title: "Image URL added",
        description: "Your profile image has been updated successfully.",
      })
    } catch (error) {
      console.error("Error processing URL:", error)
      toast({
        title: "Invalid URL",
        description: error instanceof Error ? error.message : "Please enter a valid image URL",
        variant: "destructive",
      })
      // Clear the URL input on error
      setUrlInput("")
    } finally {
      setIsLoading(false)
    }
  }

  // Optimize image for faster loading
  const optimizeImage = async (file: File): Promise<File> => {
    // Create a canvas for image resizing
    const img = document.createElement('img')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    // Create a promise to handle image loading
    const imageLoadPromise = new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
    
    try {
      await imageLoadPromise
      
      // Calculate new dimensions while maintaining aspect ratio
      let width = img.width
      let height = img.height
      const maxDimension = 1200 // Max dimension for either width or height
      
      if (width > height && width > maxDimension) {
        height = Math.round((height * maxDimension) / width)
        width = maxDimension
      } else if (height > maxDimension) {
        width = Math.round((width * maxDimension) / height)
        height = maxDimension
      }
      
      // Set canvas dimensions
      canvas.width = width
      canvas.height = height
      
      // Draw and resize image
      ctx?.drawImage(img, 0, 0, width, height)
      
      // Convert to blob with quality setting
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create blob'))
          }
        }, 'image/jpeg', 0.85) // Use JPEG with 85% quality
      })
      
      // Create a new file from the blob
      return new File([blob], file.name, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      })
    } catch (error) {
      console.error("Error optimizing image:", error)
      throw error
    } finally {
      // Clean up
      URL.revokeObjectURL(img.src)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleClearImage = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    setUrlInput("")
    if (fileInputRef.current) fileInputRef.current.value = ""
    onImageRemove()
    
    toast({
      title: "Image removed",
      description: "Your profile image has been removed.",
    })
  }

  const displayUrl = previewUrl || currentImageUrl

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className="relative rounded-lg overflow-hidden bg-gray-100 aspect-square max-w-[300px] mx-auto"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {isLoading ? (
          <div className="flex items-center justify-center w-full h-full">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : displayUrl ? (
          <div className="w-full h-full">
            <Image
              src={displayUrl}
              alt="Profile image"
              className="object-cover w-full h-full"
              width={300}
              height={300}
              priority={true}
              unoptimized={displayUrl.startsWith('blob:')}
              loading="eager"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 h-full">
            <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-gray-500 text-sm text-center">No profile image selected</p>
          </div>
        )}

        {/* Overlay with remove button */}
        {displayUrl && (
          <div
            className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${
              isHovering ? "opacity-100" : "opacity-0"
            }`}
          >
            <Button
              size="sm"
              variant="destructive"
              onClick={handleClearImage}
              disabled={isLoading}
              className="bg-white/10 hover:bg-white/20"
            >
              <X className="w-4 h-4 mr-2" />
              Remove Image
            </Button>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "upload" | "url")} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="url" className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            URL
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-4">
          <div className="space-y-2">
            <Label>Upload from your device</Label>
            <div className="flex gap-2">
              <Button
                onClick={handleButtonClick}
                disabled={isLoading}
                className="flex-1"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Supported formats: JPG, PNG, GIF. Max size: 10MB
            </p>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*"
            className="hidden" 
          />
        </TabsContent>
        
        <TabsContent value="url" className="space-y-4">
          <form onSubmit={handleUrlSubmit} className="space-y-2">
            <Label htmlFor="image-url">Image URL</Label>
            <div className="flex gap-2">
              <Input
                id="image-url"
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !urlInput}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Add"
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Enter a direct link to an image file
            </p>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
} 