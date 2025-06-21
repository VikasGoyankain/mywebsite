"use client";

import React from 'react';
import { X, Calendar, HardDrive, Image, Video, MapPin, FileText, Star, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MediaItem } from '@/app/personal/gallery/page';
import { formatFileSize } from '@/lib/utils';

interface FileInfoProps {
  file: MediaItem;
  onClose: () => void;
  isDarkMode: boolean;
}

const FileInfo: React.FC<FileInfoProps> = ({ file, onClose, isDarkMode }) => {
  const getFileIcon = () => {
    switch (file.type) {
      case 'image':
        return <Image className="w-6 h-6" />;
      case 'video':
        return <Video className="w-6 h-6" />;
      case 'document':
        return <FileText className="w-6 h-6 text-green-500" />;
      default:
        return <FileText className="w-6 h-6 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-[60] p-4">
      <div className={`rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl ${
        isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
      }`}>
        <div className={`sticky top-0 border-b p-4 flex items-center justify-between rounded-t-2xl ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            {getFileIcon()}
            <h3 className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              File Details
            </h3>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className={`${isDarkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100'}`}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Preview */}
          <div className={`aspect-square rounded-xl overflow-hidden shadow-inner ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            {file.type === 'image' ? (
              <img 
                src={file.url} 
                alt={file.name} 
                className="w-full h-full object-cover" 
              />
            ) : file.type === 'video' ? (
              <div className="relative w-full h-full bg-gray-900">
                <video 
                  src={file.url} 
                  className="w-full h-full object-cover" 
                  controls
                />
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <FileText className="w-16 h-16 text-gray-400 mb-4" />
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {file.name.split('.').pop()?.toUpperCase()} Document
                </span>
              </div>
            )}
          </div>

          {/* File Details */}
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                {getFileIcon()}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold text-base break-words ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {file.name}
                </h4>
                <p className={`text-sm capitalize ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {file.type} file
                </p>
                {file.isFavorite && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs text-yellow-600 dark:text-yellow-400">Favourite</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Uploader Information */}
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <User className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                </div>
                <div>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {file.uploadedBy}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Uploaded by
                  </p>
                </div>
              </div>

              {file.size && (
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <HardDrive className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatFileSize(file.size)}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      File size
                    </p>
                  </div>
                </div>
              )}

              {file.createdAt && (
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatDate(file.createdAt)}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Created
                    </p>
                  </div>
                </div>
              )}

              {file.modifiedAt && (
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatDate(file.modifiedAt)}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Modified
                    </p>
                  </div>
                </div>
              )}

              {file.location && (
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <MapPin className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {file.location}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Location
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileInfo;
