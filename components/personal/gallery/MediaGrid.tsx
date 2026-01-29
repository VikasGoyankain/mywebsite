"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Info, Download, Share, Trash2, Heart, Folder, FileText, Image, Video, Music, MoreVertical, Copy, Play, Check, Star, FileX, StarOff } from 'lucide-react';
import { MediaItem } from '@/app/personal/gallery/page';
import { MediaFolder } from './FolderManager';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { downloadMediaFile, shareMediaFile } from '@/lib/utils';

interface MediaGridProps {
  items: MediaItem[];
  groupedItems: Record<string, MediaItem[]>;
  folders: MediaFolder[];
  onDelete: (id: string) => void;
  onBulkDelete?: (ids: string[]) => void;
  onDownload: (item: MediaItem) => void;
  onShare: (item: MediaItem) => void;
  onToggleFavorite: (id: string) => void;
  onMoveToFolder: (itemId: string, folderId: string) => void;
  onCopyItems: (itemIds: string[]) => void;
  onShowInfo: (item: MediaItem) => void;
  onItemClick: (item: MediaItem) => void;
  viewMode: 'grid' | 'list';
  isDarkMode: boolean;
  isLoading?: boolean;
  selectedFolder?: MediaFolder | null;
  className?: string;
}

const MediaGrid: React.FC<MediaGridProps> = ({
  items,
  groupedItems,
  folders,
  onDelete,
  onBulkDelete,
  onDownload,
  onShare,
  onToggleFavorite,
  onMoveToFolder,
  onCopyItems,
  onShowInfo,
  onItemClick,
  viewMode,
  isDarkMode,
  isLoading,
  selectedFolder,
  className
}) => {
  // Selection mode state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  
  // Touch/Mouse handling state
  const [touchStartPosition, setTouchStartPosition] = useState<{ x: number; y: number; time: number } | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchMoveThreshold = 10; // pixels
  const scrollTimeThreshold = 150; // milliseconds

  // Clear selection mode when no items are selected
  useEffect(() => {
    if (selectedItems.size === 0) {
      setIsSelectionMode(false);
    }
  }, [selectedItems]);

  const handleTouchStart = (e: React.TouchEvent, item: MediaItem) => {
    const touch = e.touches[0];
    setTouchStartPosition({ 
      x: touch.clientX, 
      y: touch.clientY,
      time: Date.now()
    });
    setIsScrolling(false);

    // Start long press timer
    longPressTimeoutRef.current = setTimeout(() => {
      if (!isScrolling) {
        setIsSelectionMode(true);
        setSelectedItems(new Set([item.id]));
        // Provide haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }
    }, 500);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPosition) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartPosition.x);
    const deltaY = Math.abs(touch.clientY - touchStartPosition.y);
    const timeDelta = Date.now() - touchStartPosition.time;

    // If moved beyond threshold or quick movement, mark as scrolling
    if (deltaX > touchMoveThreshold || deltaY > touchMoveThreshold || timeDelta < scrollTimeThreshold) {
      setIsScrolling(true);
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
        longPressTimeoutRef.current = null;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent, item: MediaItem) => {
    e.preventDefault();
    
    // Clear long press timer
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }

    // Only handle tap if not scrolling
    if (!isScrolling && touchStartPosition) {
      const touchDuration = Date.now() - touchStartPosition.time;
      
      // Handle tap
      if (touchDuration < 500) {
        if (isSelectionMode) {
        toggleSelection(item.id);
      } else {
        onItemClick(item);
      }
      }
    }

    setTouchStartPosition(null);
    setIsScrolling(false);
  };

  const handleClick = (e: React.MouseEvent, item: MediaItem) => {
    e.preventDefault();
    
    // Handle selection mode with Ctrl/Cmd key
    if (e.ctrlKey || e.metaKey) {
      if (!isSelectionMode) {
        setIsSelectionMode(true);
      }
      toggleSelection(item.id);
      return;
    }

    // Handle regular click
    if (isSelectionMode) {
      toggleSelection(item.id);
    } else {
      onItemClick(item);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedItems(prev => {
      const newSelection = new Set(prev);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
      return newSelection;
    });
  };

  const handleMenuAction = async (e: React.MouseEvent, action: string, item: MediaItem) => {
    // Stop event propagation to prevent media opening
    e.preventDefault();
    e.stopPropagation();

    switch (action) {
      case 'download':
        try {
          await downloadMediaFile(item.url, item.name);
          toast({
            title: "Download started",
            description: `${item.name} is being downloaded.`,
          });
        } catch (error) {
          toast({
            title: "Download failed",
            description: "Failed to download the file. Please try again.",
            variant: "destructive",
          });
        }
        break;

      case 'share':
        try {
          await shareMediaFile(item.url, item.name, item.type);
        } catch (error) {
          if (error instanceof Error && error.message === 'Web Share API not supported') {
            toast({
              title: "Sharing not supported",
              description: "Sharing is not supported on this device/browser.",
              variant: "destructive",
            });
          } else {
    toast({
              title: "Share failed",
              description: "Failed to share the file. Please try again.",
              variant: "destructive",
            });
          }
        }
        break;

      case 'favorite':
        onToggleFavorite(item.id);
        break;

      case 'delete':
        onDelete(item.id);
        break;

      case 'info':
        onShowInfo(item);
        break;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-5 h-5 text-blue-500" />;
      case 'video':
        return <Video className="w-5 h-5 text-purple-500" />;
      case 'audio':
        return <Music className="w-5 h-5 text-green-500" />;
      case 'document':
        return <FileText className="w-5 h-5 text-orange-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const renderGridItem = (item: MediaItem) => (
    <div
      key={item.id}
      className={`group relative rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
        selectedItems.has(item.id) ? 'ring-2 ring-blue-500 scale-95' : 'hover:scale-[1.02]'
      }`}
      onTouchStart={(e) => handleTouchStart(e, item)}
      onTouchMove={handleTouchMove}
      onTouchEnd={(e) => handleTouchEnd(e, item)}
      onClick={(e) => handleClick(e, item)}
    >
      {/* Favorite Heart Icon */}
      {item.isFavorite && (
        <div className="absolute top-2 left-2 z-10">
          <div className="p-1 rounded-full bg-black/50">
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
          </div>
        </div>
      )}

      {/* Menu Button - Always visible on mobile, visible on hover for desktop */}
      <div 
        className={`absolute top-2 right-2 z-10 ${
          isSelectionMode ? 'hidden' : 'md:opacity-0 md:group-hover:opacity-100'
        }`}
        onClick={(e) => e.stopPropagation()} // Prevent click from reaching parent
      >
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
              className={`p-1 h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 active:scale-95 touch-manipulation ${
                isDarkMode ? 'text-white' : 'text-white'
              }`}
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
            className={`w-48 p-2 backdrop-blur-xl border shadow-xl ${
          isDarkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'
        }`}
            onClick={(e) => e.stopPropagation()} // Prevent click from reaching parent
      >
        <DropdownMenuItem 
              onClick={(e) => handleMenuAction(e, 'download', item)}
              className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </DropdownMenuItem>
        <DropdownMenuItem 
              onClick={(e) => handleMenuAction(e, 'share', item)}
              className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
        >
          <Share className="w-4 h-4 mr-2" />
          Share
        </DropdownMenuItem>
        <DropdownMenuItem 
              onClick={(e) => handleMenuAction(e, 'favorite', item)}
              className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              {item.isFavorite ? (
                <>
                  <StarOff className="w-4 h-4 mr-2" />
                  Remove from Favorites
                </>
              ) : (
                <>
                  <Star className="w-4 h-4 mr-2" />
                  Add to Favorites
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => handleMenuAction(e, 'info', item)}
              className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              <Info className="w-4 h-4 mr-2" />
              View Details
        </DropdownMenuItem>
        <DropdownMenuItem 
              onClick={(e) => handleMenuAction(e, 'delete', item)}
              className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-red-600 dark:text-red-400"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
      </div>

      {/* Media Thumbnail */}
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
                          {item.type === 'image' ? (
                            <img 
                              src={item.url} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : item.type === 'video' ? (
          <div className="relative w-full h-full">
                              <video 
                                src={item.url}
                                className="w-full h-full object-cover"
                                preload="metadata"
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
              <Play className="w-12 h-12 text-white opacity-75" />
                              </div>
                            </div>
                          ) : (
          <div className="w-full h-full flex items-center justify-center">
                              {getFileIcon(item.type)}
                            </div>
                          )}

        {/* Selection Overlay */}
        {selectedItems.has(item.id) && (
          <div className="absolute inset-0 bg-blue-500/30 flex items-center justify-center">
            <div className="bg-blue-500 rounded-full p-1">
              <Check className="w-5 h-5 text-white" />
            </div>
          </div>
        )}
                        </div>

      {/* Item Info */}
      <div className={`p-2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <p className="text-sm font-medium truncate">{item.name}</p>
        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {item.size && formatFileSize(item.size)}
                          </p>
                        </div>
                      </div>
  );

  // Selection mode actions
  const renderSelectionActions = () => {
    if (!isSelectionMode || selectedItems.size === 0) return null;

    return (
      <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl shadow-lg z-50 ${
        isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-200'
      }`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedItems(new Set())}
          className="text-red-500"
        >
          Cancel ({selectedItems.size})
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (onBulkDelete) {
              onBulkDelete(Array.from(selectedItems));
            } else {
              selectedItems.forEach(id => onDelete(id));
            }
            setSelectedItems(new Set());
            toast({
              title: "Items deleted",
              description: `${selectedItems.size} items have been deleted.`,
            });
          }}
          className="text-red-500"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-500"
            >
              <Folder className="w-4 h-4 mr-2" />
              Move to
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end"
            className={`w-48 p-2 backdrop-blur-xl border shadow-xl ${
              isDarkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'
            }`}
          >
            {folders.map((folder) => (
              <DropdownMenuItem
                key={folder.id}
                onClick={() => {
                  selectedItems.forEach(id => onMoveToFolder(id, folder.id));
                  setSelectedItems(new Set());
                  toast({
                    title: "Items moved",
                    description: `${selectedItems.size} items moved to ${folder.name}`,
                  });
                }}
                className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                <Folder className="w-4 h-4 mr-2" />
                {folder.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 sm:gap-4">
          {[...Array(12)].map((_, index) => (
            <div key={index} className="aspect-square rounded-xl overflow-hidden shadow-md">
              <div className="w-full h-full bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
                                </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 ${
          isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
          <FileX className={`w-16 h-16 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                            </div>
        <h3 className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          No items found
        </h3>
        <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {selectedFolder ? "This folder is empty" : "Upload some files to get started"}
        </p>
                            </div>
    );
  }

  return (
    <div className={className}>
      <div className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 ${className}`}>
        {Object.entries(groupedItems).map(([group, items]) => (
          <React.Fragment key={group}>
            {items.map(item => renderGridItem(item))}
          </React.Fragment>
          ))}
        </div>
      {renderSelectionActions()}
    </div>
  );
};

export default MediaGrid;



