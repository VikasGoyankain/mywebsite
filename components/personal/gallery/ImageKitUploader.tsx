"use client";

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ImageKitUploaderProps {
  onUploadSuccess: (response: {
    fileId?: string;
    fileType?: string;
    id?: string;
    url: string;
    name: string;
    size?: number;
    width?: number;
    height?: number;
    folder?: string;
  }) => void;
  onUploadError: (error: Error) => void;
  folder?: string;
  userId?: string;
}

export default function ImageKitUploader({
  onUploadSuccess,
  onUploadError,
  folder = 'gallery',
  userId = 'current-user'
}: ImageKitUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (file: File) => {
    try {
      // Get upload URL and token
      const authResponse = await fetch('/api/personal/gallery/imagekit/auth', {
        method: 'GET',
      });
      
      if (!authResponse.ok) {
        throw new Error('Failed to get upload credentials');
      }

      const { uploadUrl, token } = await authResponse.json();

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);
      formData.append('token', token);

      // Upload file
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const result = await uploadResponse.json();
      onUploadSuccess(result);

      toast({
        title: "Upload successful",
        description: `${file.name} has been uploaded.`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      if (error instanceof Error) {
        onUploadError(error);
        toast({
          title: "Upload failed",
          description: `Failed to upload ${file.name}. ${error.message}`,
          variant: "destructive",
        });
      }
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      await Promise.all(files.map(uploadFile));
      setFiles([]);
    } finally {
      setIsUploading(false);
    }
  };

  const dropHandler = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...droppedFiles]);
    }
  }, []);

  const dragOverHandler = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div className="space-y-4">
      <div
        className="border-2 border-dashed rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
        onDrop={dropHandler}
        onDragOver={dragOverHandler}
      >
        <Input
          type="file"
          accept="image/*,video/*"
          multiple={true}
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <Label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <Upload className="w-12 h-12 mb-4 text-gray-400" />
          <p className="text-lg font-medium">Drop files here or click to upload</p>
          <p className="text-sm text-gray-500 mt-1">
            Support for images and videos
          </p>
        </Label>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Selected Files</h3>
            <Button
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload All'}
            </Button>
          </div>
          
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="flex-shrink-0">
                    {file.type.startsWith('image/') ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <video
                        src={URL.createObjectURL(file)}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={isUploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 