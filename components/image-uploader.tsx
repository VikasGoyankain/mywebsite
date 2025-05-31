"use client"

import type React from "react"

import { useState, useRef } from "react"
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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Create a local preview URL
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    // Pass both the URL and file to the parent component
    onImageSelect(objectUrl, file)
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleClearImage = () => {
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
        {displayUrl ? (
          <div className="w-full h-full">
            <Image
              src={displayUrl || "/placeholder.svg"}
              alt="Selected image"
              className="object-cover w-full h-full"
              width={300}
              height={300}
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
            <Button size="sm" onClick={handleButtonClick} className="bg-white text-gray-800 hover:bg-gray-100">
              <Upload className="w-4 h-4 mr-2" />
              {buttonText}
            </Button>
            {displayUrl && (
              <Button size="sm" variant="destructive" onClick={handleClearImage}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
    </div>
  )
}
