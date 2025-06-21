"use client";

import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface ImageKitUploaderProps {
  onUploadSuccess: (response: any) => void;
  onUploadError: (error: any) => void;
  folder?: string;
  userId?: string;
}

const ImageKitUploader: React.FC<ImageKitUploaderProps> = ({
  onUploadSuccess,
  onUploadError,
  folder = 'gallery',
  userId = 'current-user'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files);
    setUploadProgress(0);
    
    for (let i = 0; i < files.length; i++) {
      await uploadFile(files[i]);
      setUploadProgress(((i + 1) / files.length) * 100);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileType = (mimeType: string): 'image' | 'video' | 'document' | 'audio' => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  };

  const uploadFile = async (file: File) => {
    try {
      setIsUploading(true);
      
      // Get authentication parameters from server
      const authResponse = await fetch('/api/personal/gallery/imagekit');
      const authData = await authResponse.json();
      
      // Create form data for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);
      formData.append('folder', folder);
      formData.append('publicKey', authData.publicKey);
      formData.append('signature', authData.signature);
      formData.append('token', authData.token);
      formData.append('expire', authData.expire);
      
      // Upload to ImageKit
      const uploadResponse = await fetch('/api/personal/gallery/imagekit', {
        method: 'POST',
        body: formData
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }
      
      const uploadResult = await uploadResponse.json();
      
      // Create media item in Redis
      const mediaItem = {
        id: uuidv4(),
        fileId: uploadResult.fileId,
        type: getFileType(file.type),
        url: uploadResult.url,
        name: file.name,
        uploadDate: new Date().toISOString(),
        folderId: folder !== 'gallery' ? folder : undefined,
        size: file.size,
        dimensions: uploadResult.width && uploadResult.height ? {
          width: uploadResult.width,
          height: uploadResult.height
        } : undefined,
        isFavorite: false,
        uploadedBy: userId
      };
      
      // Save to Redis
      const saveResponse = await fetch('/api/personal/gallery/media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mediaItem)
      });
      
      if (!saveResponse.ok) {
        throw new Error('Failed to save media metadata');
      }
      
      const savedData = await saveResponse.json();
      
      // Call success callback with the complete data
      onUploadSuccess({
        ...uploadResult,
        ...mediaItem
      });
      
      toast({
        title: 'Upload successful',
        description: `${file.name} has been uploaded successfully.`
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      onUploadError(error);
      
      toast({
        title: 'Upload failed',
        description: 'Failed to upload file. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        {isUploading ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
            Uploading... {uploadProgress > 0 ? `${Math.round(uploadProgress)}%` : ''}
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </>
        )}
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        multiple
      />
    </div>
  );
};

export default ImageKitUploader; 