"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Upload, Plus, ArrowLeft, Grid3X3, List, Moon, Sun, User, Star, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import FolderManager, { MediaFolder } from '@/components/personal/gallery/FolderManager';
import MediaGrid from '@/components/personal/gallery/MediaGrid';
import FileInfo from '@/components/personal/gallery/FileInfo';
import MediaViewer from '@/components/personal/gallery/MediaViewer';
import ImageKitUploader from '@/components/personal/gallery/ImageKitUploader';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import PersonalAuthWrapper from '@/components/personal/PersonalAuthWrapper';

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'pdf';
  size?: number;
  uploadDate: Date;
  isFavorite: boolean;
  fileId?: string; // ImageKit file ID
  folderId?: string;
  dimensions?: { width: number; height: number };
  location?: string;
  uploadedBy: string;
}

export default function GalleryPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch media items and folders from Redis
  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
      try {
        // Fetch folders
          const foldersResponse = await fetch('/api/personal/gallery/folders');
            const foldersData = await foldersResponse.json();
            
        // Ensure we always have an "All Photos" folder
        let allFolders = foldersData.folders || [];
        if (Array.isArray(allFolders)) {
          allFolders = allFolders.map(folder => ({
            ...folder,
            createdAt: new Date(folder.createdAt)
          }));
          
          // We don't need to add "All" folder here anymore
          // It's now handled by the API
          if (allFolders.length === 0) {
            allFolders.push({
                id: 'all-photos',
              name: 'All',
                itemCount: 0,
              createdAt: new Date(),
              isDefault: true
            });
          }
            setFolders(allFolders);
          }
          
          // Fetch media items
          const mediaResponse = await fetch('/api/personal/gallery/media');
            const mediaData = await mediaResponse.json();
            
        if (Array.isArray(mediaData.media)) {
          const parsedMedia = mediaData.media.map((item: any) => ({
            ...item,
            uploadDate: new Date(item.uploadDate)
            }));
          setMediaItems(parsedMedia);
          }
        } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load gallery data',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const [selectedFolder, setSelectedFolder] = useState<MediaFolder | null>(null);
  const [currentView, setCurrentView] = useState<'folders' | 'media'>('folders');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [showFileInfo, setShowFileInfo] = useState<MediaItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'uploader'>('date');
  const [groupBy, setGroupBy] = useState<'date' | 'uploader' | 'type'>('date');
  const [showFavorites, setShowFavorites] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [copiedItems, setCopiedItems] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-detect system theme on first load
  useEffect(() => {
    const detectSystemTheme = () => {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setIsDarkMode(true);
      }
    };
    detectSystemTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Global drag and drop handlers
  useEffect(() => {
    const handleGlobalDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(true);
    };

    const handleGlobalDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!e.relatedTarget) {
        setDragActive(false);
      }
    };

    const handleGlobalDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    };

    document.addEventListener('dragover', handleGlobalDragOver);
    document.addEventListener('dragleave', handleGlobalDragLeave);
    document.addEventListener('drop', handleGlobalDrop);

    return () => {
      document.removeEventListener('dragover', handleGlobalDragOver);
      document.removeEventListener('dragleave', handleGlobalDragLeave);
      document.removeEventListener('drop', handleGlobalDrop);
    };
  }, [selectedFolder]);

  // This function is now replaced by ImageKitUploader component
  const handleFiles = (files: FileList) => {
    // We'll use this only for drag and drop, which will then use ImageKit uploader
    if (files.length > 0) {
      toast({
        title: "Processing files",
        description: `Preparing ${files.length} files for upload.`,
      });
      
      // Convert FileList to File array and trigger upload through ImageKit
      const fileArray = Array.from(files);
      fileArray.forEach(file => {
        // Create a FormData object to upload to ImageKit
        const formData = new FormData();
        formData.append('file', file);
        
        // Upload through the API directly
        fetch('/api/personal/gallery/imagekit', {
          method: 'POST',
          body: formData
        })
        .then(response => response.json())
        .then(result => {
          handleImageKitUpload(result);
        })
        .catch(error => {
          console.error('Error uploading file:', error);
      toast({
            title: 'Upload failed',
            description: `Failed to upload ${file.name}`,
            variant: 'destructive'
      });
    });
      });
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleImageKitUpload = (response: {
    fileId?: string;
    fileType?: string;
    id?: string;
    url: string;
    name: string;
    size?: number;
    width?: number;
    height?: number;
    folder?: string;
  }) => {
    // Create a new media item from ImageKit response
    const fileType = response.fileType?.startsWith('image/') ? 'image' : 
                     response.fileType?.startsWith('video/') ? 'video' : 
                     response.fileType?.startsWith('audio/') ? 'audio' : 'document';
    
    const newItem: MediaItem = {
      id: response.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
      fileId: response.fileId,
      type: fileType,
      url: response.url,
      name: response.name,
      uploadDate: new Date(),
      folderId: selectedFolder?.id,
      size: response.size,
      dimensions: response.width && response.height ? { 
        width: response.width, 
        height: response.height 
      } : undefined,
      isFavorite: false,
      uploadedBy: 'Current User'
    };
    
    // Save to state
    setMediaItems(prev => [newItem, ...prev]);
    
    // Update folder counts
    updateFolderCounts();
    
    toast({
      title: "Media uploaded successfully!",
      description: `${response.name} has been added to your gallery.`,
    });
  };

  const createFolder = async (name: string) => {
    try {
      // Create folder in Redis
      const response = await fetch('/api/personal/gallery/folders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
        body: JSON.stringify({ name })
    });
      
      if (!response.ok) {
        throw new Error('Failed to create folder');
      }

      const data = await response.json();
    const newFolder: MediaFolder = {
        ...data.folder,
        createdAt: new Date(data.folder.createdAt)
    };
      
      // Update local state
    setFolders(prev => [...prev, newFolder]);
    
    toast({
      title: "Album created",
      description: `"${name}" has been created.`,
    });
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        title: 'Error',
        description: 'Failed to create album',
        variant: 'destructive'
      });
    }
  };

  const deleteFolder = async (id: string) => {
    try {
      // Delete folder from Redis
      const response = await fetch(`/api/personal/gallery/folders/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete folder');
      }
      
      // Update local state
    setFolders(prev => prev.filter(f => f.id !== id));
    setMediaItems(prev => prev.map(item => 
      item.folderId === id ? { ...item, folderId: 'all-photos' } : item
    ));
    
    toast({
      title: "Album deleted",
      description: "Album has been deleted.",
    });
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete album',
        variant: 'destructive'
      });
    }
  };

  const renameFolder = async (id: string, newName: string) => {
    try {
      // Update folder in Redis
      const response = await fetch(`/api/personal/gallery/folders/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: newName })
    });
      
      if (!response.ok) {
        throw new Error('Failed to rename folder');
      }
      
      // Update local state
      setFolders(prev => prev.map(f => 
        f.id === id ? { ...f, name: newName } : f
      ));
    
    toast({
      title: "Album renamed",
      description: "Album has been renamed successfully.",
    });
    } catch (error) {
      console.error('Error renaming folder:', error);
      toast({
        title: 'Error',
        description: 'Failed to rename album',
        variant: 'destructive'
      });
    }
  };

  const moveToFolder = async (itemId: string, folderId: string) => {
    try {
      // Update media item in Redis
      const response = await fetch(`/api/personal/gallery/media/${itemId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
        body: JSON.stringify({ 
          folderId: folderId === 'all-photos' ? null : folderId 
        })
    });
      
      if (!response.ok) {
        throw new Error('Failed to move item');
      }
      
      // Update local state
      setMediaItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, folderId: folderId === 'all-photos' ? undefined : folderId } : item
      ));
      updateFolderCounts();
    
    toast({
      title: "Item moved",
        description: "Item has been moved successfully.",
    });
    } catch (error) {
      console.error('Error moving item:', error);
      toast({
        title: 'Error',
        description: 'Failed to move item',
        variant: 'destructive'
      });
    }
  };

  const copyItems = (itemIds: string[]) => {
    setCopiedItems(itemIds);
    toast({
      title: "Items copied",
      description: `${itemIds.length} items copied to clipboard.`,
    });
  };

  const pasteItems = (targetFolderId?: string) => {
    if (copiedItems.length === 0) return;
    
    copiedItems.forEach(id => {
      moveToFolder(id, targetFolderId || 'all-photos');
    });
    
    toast({
      title: "Items pasted",
      description: `${copiedItems.length} items pasted successfully.`,
    });
    setCopiedItems([]);
  };

  const updateFolderCounts = () => {
    setFolders(prev => prev.map(folder => ({
        ...folder,
      itemCount: mediaItems.filter(item => 
        folder.id === 'all-photos' ? !item.folderId : item.folderId === folder.id
      ).length
    })));
  };

  const toggleFavorite = async (id: string) => {
    try {
      // Get the item to toggle
    const item = mediaItems.find(item => item.id === id);
      if (!item) return;
      
      // Update in Redis
      const response = await fetch(`/api/personal/gallery/media/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isFavorite: !item.isFavorite })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update favorite status');
      }
      
      // Update local state
      setMediaItems(prev => prev.map(item =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      ));
      
      toast({
        title: item.isFavorite ? "Removed from favorites" : "Added to favorites",
        description: `${item.name} has been ${item.isFavorite ? "removed from" : "added to"} favorites.`,
      });
    } catch (error) {
      console.error('Error updating favorite status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update favorite status',
        variant: 'destructive'
      });
    }
  };

  const deleteItem = async (id: string) => {
    try {
      // Get the item before deleting it
    const item = mediaItems.find(item => item.id === id);
      if (!item) return;
    
      // Delete from Redis
      const response = await fetch(`/api/personal/gallery/media/${id}`, {
      method: 'DELETE'
    });
    
      if (!response.ok) {
        throw new Error('Failed to delete item');
      }
      
      // If it's an ImageKit file, delete from ImageKit too
      if (item.fileId) {
        await fetch(`/api/personal/gallery/imagekit/${item.fileId}`, {
        method: 'DELETE'
      });
    }
      
      // Update local state
      setMediaItems(prev => prev.filter(item => item.id !== id));
      updateFolderCounts();
    
    toast({
      title: "Item deleted",
        description: "Media item has been deleted successfully.",
    });
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete item',
        variant: 'destructive'
      });
    }
  };

  const downloadItem = (item: MediaItem) => {
    const link = document.createElement('a');
    link.href = item.url;
    link.download = item.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "Download started",
      description: `${item.name} is being downloaded.`,
    });
  };

  const shareItem = async (item: MediaItem) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.name,
          url: item.url
        });
      } catch (error) {
        navigator.clipboard.writeText(item.url);
        toast({
          title: "Link copied!",
          description: "Media link has been copied to clipboard.",
        });
      }
    } else {
      navigator.clipboard.writeText(item.url);
      toast({
        title: "Link copied!",
        description: "Media link has been copied to clipboard.",
      });
    }
  };

  const sortItems = (items: MediaItem[]) => {
    return [...items].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'size':
          return (b.size || 0) - (a.size || 0);
        case 'uploader':
          return a.uploadedBy.localeCompare(b.uploadedBy);
        case 'date':
        default:
          return b.uploadDate.getTime() - a.uploadDate.getTime();
      }
    });
  };

  const groupItems = (items: MediaItem[]) => {
    const sortedItems = sortItems(items);
    
    if (groupBy === 'date') {
      const grouped = sortedItems.reduce((groups, item) => {
        const date = item.uploadDate.toDateString();
        if (!groups[date]) groups[date] = [];
        groups[date].push(item);
        return groups;
      }, {} as Record<string, MediaItem[]>);
    return grouped;
    } else if (groupBy === 'uploader') {
      const grouped = sortedItems.reduce((groups, item) => {
        if (!groups[item.uploadedBy]) groups[item.uploadedBy] = [];
        groups[item.uploadedBy].push(item);
        return groups;
      }, {} as Record<string, MediaItem[]>);
      return grouped;
    } else if (groupBy === 'type') {
      const grouped = sortedItems.reduce((groups, item) => {
        const type = item.type.charAt(0).toUpperCase() + item.type.slice(1) + 's';
        if (!groups[type]) groups[type] = [];
        groups[type].push(item);
        return groups;
      }, {} as Record<string, MediaItem[]>);
      return grouped;
    }
    return { 'All Items': sortedItems };
  };

  const filteredItems = mediaItems.filter(item => {
    const matchesFolder = selectedFolder ? 
      (selectedFolder.id === 'all-photos' ? true : item.folderId === selectedFolder.id) : 
      true;
    const matchesFavorites = showFavorites ? item.isFavorite : true;
    return matchesFolder && matchesFavorites;
  });

  const groupedItems = groupItems(filteredItems);

    return (
    <PersonalAuthWrapper>
      <div className={`min-h-screen transition-all duration-500 ${isDarkMode ? 'dark bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'}`}>
      {/* Global drag overlay with futuristic design */}
      {dragActive && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-500/30 to-purple-600/30 backdrop-blur-lg z-50 flex items-center justify-center animate-fade-in">
          <div className={`p-12 rounded-3xl border-2 border-dashed border-blue-400 backdrop-blur-md shadow-2xl transform hover:scale-105 transition-all duration-300 ${
            isDarkMode ? 'bg-gray-800/90 border-blue-300' : 'bg-white/90 border-blue-500'
          }`}>
            <Upload className="w-20 h-20 text-blue-500 mx-auto mb-6 animate-bounce" />
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
              Drop files anywhere to upload
            </p>
            <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Supports images, videos, audio, and documents
            </p>
      </div>
        </div>
      )}

      {/* Futuristic sticky header */}
      <div className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gray-900/95 border-gray-700/50 shadow-lg shadow-gray-900/20' 
          : 'bg-white/95 border-gray-200/50 shadow-lg shadow-black/5'
      }`}>
        <div className="px-3 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
            {currentView === 'media' && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentView('folders')}
                  className={`hover:scale-110 transition-all duration-200 ${
                    isDarkMode ? 'hover:bg-gray-800 text-gray-300 hover:text-white' : 'hover:bg-gray-100'
                  }`}
              >
                  <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
              <h1 className={`text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
                {currentView === 'folders' ? 'My Gallery' : (selectedFolder ? selectedFolder.name : 'All')}
            </h1>
          </div>
          
            <div className="flex items-center gap-2">
              {/* Dark Mode Toggle */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsDarkMode(!isDarkMode)}
                className={`hover:scale-110 transition-all duration-200 ${
                  isDarkMode ? 'hover:bg-gray-800 text-gray-300 hover:text-yellow-400' : 'hover:bg-gray-100 hover:text-blue-600'
                }`}
            >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            
              {/* Profile Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
                    className={`flex items-center gap-2 hover:scale-105 transition-all duration-200 ${
                      isDarkMode ? 'hover:bg-gray-800 text-gray-300 hover:text-white' : 'hover:bg-gray-100'
                    }`}
            >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      JD
                    </div>
                    <span className="hidden sm:inline font-medium">John Doe</span>
            </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className={`w-48 backdrop-blur-xl border shadow-xl ${
                  isDarkMode ? 'bg-gray-800/95 border-gray-700 text-gray-200' : 'bg-white/95 border-gray-200'
                }`}>
                  <DropdownMenuItem className={`cursor-pointer ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className={`cursor-pointer ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                    Storage Usage
                  </DropdownMenuItem>
                  <DropdownMenuItem className={`cursor-pointer ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Upload Button - Using ImageKit */}
              <ImageKitUploader
                onUploadSuccess={handleImageKitUpload}
                onUploadError={(error) => {
                  console.error('Upload error:', error);
                  toast({
                    title: 'Upload failed',
                    description: error.message,
                    variant: 'destructive'
                  });
                }}
                folder={selectedFolder?.id || 'gallery'}
                userId="current-user"
              />
            </div>
          </div>

          {/* Controls Bar for Media View */}
          {currentView === 'media' && (
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Favorites Filter */}
                <Button 
                  variant={showFavorites ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowFavorites(!showFavorites)}
                  className={`transition-all duration-200 hover:scale-105 ${
                    showFavorites 
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0'
                      : isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : 'hover:bg-gray-50'
                  }`}
                >
                  <Star className="w-4 h-4 mr-1" />
                  Favorites
                </Button>

                {/* Copy/Paste buttons */}
                {copiedItems.length > 0 && (
                        <Button 
                    variant="outline"
                          size="sm"
                    onClick={() => pasteItems(selectedFolder?.id)}
                    className={`hover:scale-105 transition-all duration-200 ${
                      isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : 'hover:bg-gray-50'
                    }`}
                        >
                    Paste ({copiedItems.length})
                        </Button>
                )}

                {/* Group By Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                        <Button 
                      variant="outline" 
                          size="sm"
                      className={`hover:scale-105 transition-all duration-200 ${
                        isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : 'hover:bg-gray-50'
                      }`}
                        >
                      <Filter className="w-4 h-4 mr-1" />
                      Group: {groupBy}
                        </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className={`backdrop-blur-xl ${
                    isDarkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'
                  }`}>
                    <DropdownMenuItem 
                      onClick={() => setGroupBy('date')}
                      className={`cursor-pointer ${isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                    >
                      Date
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setGroupBy('uploader')}
                      className={`cursor-pointer ${isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                    >
                      Uploader
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setGroupBy('type')}
                      className={`cursor-pointer ${isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                    >
                      Type
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Sort Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={`hover:scale-105 transition-all duration-200 ${
                        isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : 'hover:bg-gray-50'
                      }`}
                    >
                      Sort: {sortBy}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className={`backdrop-blur-xl ${
                    isDarkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'
                  }`}>
                    <DropdownMenuItem 
                      onClick={() => setSortBy('date')}
                      className={`cursor-pointer ${isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                    >
                      Date
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setSortBy('name')}
                      className={`cursor-pointer ${isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                    >
                      Name
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setSortBy('size')}
                      className={`cursor-pointer ${isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                    >
                      Size
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setSortBy('uploader')}
                      className={`cursor-pointer ${isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                    >
                      Uploader
                    </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
                {/* View Mode Toggle */}
                <div className={`flex border rounded-lg overflow-hidden ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-200'
                }`}>
            <Button 
                    variant={viewMode === 'grid' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`rounded-r-none transition-all duration-200 ${
                      viewMode === 'grid' 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0'
                        : isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'hover:bg-gray-50'
                    }`}
            >
                    <Grid3X3 className="w-4 h-4" />
            </Button>
                  <Button
                    variant={viewMode === 'list' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`rounded-l-none transition-all duration-200 ${
                      viewMode === 'list' 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0'
                        : isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'hover:bg-gray-50'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </Button>
          </div>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Content */}
      <div className="relative">
        {currentView === 'folders' ? (
          <FolderManager 
            folders={folders}
            onCreateFolder={createFolder}
            onDeleteFolder={deleteFolder}
            onRenameFolder={renameFolder}
            onSelectFolder={(folder) => {
              setSelectedFolder(folder);
              setCurrentView('media');
            }}
            selectedFolder={selectedFolder}
            isDarkMode={isDarkMode}
          />
        ) : (
          <MediaGrid 
            items={filteredItems}
            groupedItems={groupedItems}
            folders={folders}
            onDelete={deleteItem}
            onDownload={downloadItem}
            onShare={shareItem}
            onToggleFavorite={toggleFavorite}
            onMoveToFolder={moveToFolder}
            onCopyItems={copyItems}
            onShowInfo={setShowFileInfo}
            onItemClick={setSelectedItem}
            viewMode={viewMode}
            isDarkMode={isDarkMode}
            isLoading={isLoading}
            selectedFolder={selectedFolder}
            className="p-4 sm:p-6"
          />
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/webm,video/mkv,audio/mp3,audio/wav,audio/mpeg,.pdf,.doc,.docx,.txt"
        onChange={handleFileInput}
        className="hidden"
      />

      {/* File Info Modal */}
      {showFileInfo && (
        <FileInfo
          item={showFileInfo}
          onClose={() => setShowFileInfo(null)}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Media Viewer Modal */}
      {selectedItem && (
        <MediaViewer
          file={selectedItem}
          onClose={() => setSelectedItem(null)}
          onDownload={downloadItem}
          onShare={shareItem}
          onToggleFavorite={toggleFavorite}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
    </PersonalAuthWrapper>
  );
}
