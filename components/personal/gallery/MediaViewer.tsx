"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Download, Share, Star, StarOff, 
  ChevronLeft, ChevronRight, Play, Pause, 
  Volume2, VolumeX, Maximize, Minimize, 
  FileText, Music, Loader2, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MediaItem } from '@/app/personal/gallery/page';
import { downloadMediaFile, shareMediaFile } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface MediaViewerProps {
  file: MediaItem;
  onClose: () => void;
  onDownload: (file: MediaItem) => void;
  onShare: (file: MediaItem) => Promise<void>;
  onToggleFavorite: (id: string) => Promise<void>;
  isDarkMode: boolean;
}

const MediaViewer: React.FC<MediaViewerProps> = ({ 
  file, 
  onClose, 
  onDownload,
  onShare,
  onToggleFavorite,
  isDarkMode
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (onPrevious) onPrevious();
          break;
        case 'ArrowRight':
          if (onNext) onNext();
          break;
        case 'Space':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'KeyF':
          toggleFullscreen();
          break;
        case 'KeyM':
          toggleMute();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'auto';
    };
  }, [onPrevious, onNext]);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadMediaFile(file.url, file.name);
      toast({
        title: "Download started",
        description: `${file.name} is being downloaded.`,
      });
      onDownload(file);
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    try {
      const shareResult = await shareMediaFile(file.url, file.name, file.type);
      toast({
        title: "Share successful",
        description: `${file.name} has been shared.`,
      });
      onShare(file);
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
  };

  const getMimeType = (extension: string): string => {
    const mimeTypes: Record<string, string> = {
      // Images
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      // Videos
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'mkv': 'video/x-matroska',
      // Audio
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      // Documents
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain',
    };

    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  };

  const handleFavoriteToggle = () => {
    onToggleFavorite(file.id);
    toast({
      title: file.isFavorite ? "Removed from favorites" : "Added to favorites",
      description: `${file.name} has been ${file.isFavorite ? 'removed from' : 'added to'} favorites.`,
    });
  };

  const togglePlayPause = () => {
    const media = videoRef.current || audioRef.current;
    if (media) {
      if (isPlaying) {
        media.pause();
      } else {
        media.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    const media = videoRef.current || audioRef.current;
    if (media) {
      media.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    const media = videoRef.current || audioRef.current;
    if (media) {
      media.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleTimeUpdate = () => {
    const media = videoRef.current || audioRef.current;
    if (media) {
      setCurrentTime(media.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    const media = videoRef.current || audioRef.current;
    if (media) {
      setDuration(media.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const media = videoRef.current || audioRef.current;
    const newTime = parseFloat(e.target.value);
    if (media) {
      media.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (time: number | undefined) => {
    if (typeof time !== 'number') return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (!isPlaying) return;
      setShowControls(false);
    }, 3000);
  };

  const handleLoadComplete = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setError('Failed to load media');
    setIsLoading(false);
  };

  const renderMediaContent = () => {
    switch (file.type) {
      case 'image':
        return (
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <div className="relative max-w-[90%] max-h-[80vh] overflow-hidden rounded-lg">
              <img 
                src={file.url} 
                alt={file.name}
                className="object-contain w-full h-full rounded-lg shadow-2xl"
                onLoad={handleLoadComplete}
                onError={handleError}
                loading="lazy"
              />
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <div className="relative max-w-[90%] max-h-[80vh] overflow-hidden rounded-lg"
              onMouseMove={handleMouseMove}
            >
              <video 
                ref={videoRef}
                src={file.url}
                className="object-contain w-full h-full rounded-lg shadow-2xl"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onLoadedData={handleLoadComplete}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                playsInline
                controls={false}
              />

              {showControls && (
                <div className={`absolute bottom-4 left-4 right-4 backdrop-blur-md rounded-lg p-4 ${
                  isDarkMode ? 'bg-gray-900/80' : 'bg-white/80'
                }`}>
                  <div className="flex items-center gap-4 mb-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={togglePlayPause}
                      className={`hover:scale-110 transition-transform ${
                        isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </Button>

                    <div className="flex-1">
                      <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                      className={`hover:scale-110 transition-transform ${
                        isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </Button>

                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleFullscreen}
                      className={`hover:scale-110 transition-transform ${
                        isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'audio':
        return (
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <div className="relative max-w-[90%] max-h-[80vh] flex flex-col items-center">
              <div className={`w-64 h-64 rounded-full flex items-center justify-center ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
                <Music className={`w-24 h-24 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>

              <audio 
                ref={audioRef}
                src={file.url}
                className="hidden"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onLoadedData={handleLoadComplete}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />

              <div className={`mt-8 w-full max-w-md backdrop-blur-md rounded-lg p-4 ${
                isDarkMode ? 'bg-gray-900/80' : 'bg-white/80'
              }`}>
                <div className="flex items-center gap-4 mb-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePlayPause}
                    className={`hover:scale-110 transition-transform ${
                      isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>

                  <div className="flex-1">
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className={`hover:scale-110 transition-transform ${
                      isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </Button>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'pdf':
        return (
          <div className="relative w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-full max-w-4xl h-[80vh] overflow-hidden rounded-lg bg-white dark:bg-gray-800">
              {/* PDF Loading State */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <Loader2 className={`w-12 h-12 animate-spin ${isDarkMode ? 'text-white' : 'text-gray-900'}`} />
                </div>
              )}

              {/* PDF Controls */}
              <div className={`absolute top-4 left-4 right-4 flex justify-between items-center gap-2 backdrop-blur-md rounded-lg p-2 z-10 ${
                isDarkMode ? 'bg-gray-900/80' : 'bg-white/80'
              }`}>
                <h3 className="text-sm font-medium truncate flex-1">
                  {file.name}
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload();
                    }}
                    disabled={isDownloading}
                    className={`hover:scale-110 active:scale-95 transition-transform touch-manipulation ${
                      isDarkMode ? 'text-white hover:bg-gray-800' : 'text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {isDownloading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare();
                    }}
                    disabled={isSharing}
                    className={`hover:scale-110 active:scale-95 transition-transform touch-manipulation ${
                      isDarkMode ? 'text-white hover:bg-gray-800' : 'text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {isSharing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Share className="w-4 h-4" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFavoriteToggle();
                    }}
                    className={`hover:scale-110 active:scale-95 transition-transform touch-manipulation ${
                      isDarkMode ? 'text-white hover:bg-gray-800' : 'text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {file.isFavorite ? (
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ) : (
                      <StarOff className="w-4 h-4" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose();
                    }}
                    className={`hover:scale-110 active:scale-95 transition-transform touch-manipulation ${
                      isDarkMode ? 'text-white hover:bg-gray-800' : 'text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* PDF Viewer */}
              <div className="w-full h-full pt-16">
                <iframe
                  src={`${file.url}#view=FitH`}
                  className="w-full h-full rounded-lg"
                  onLoad={handleLoadComplete}
                  onError={handleError}
                  title={file.name}
                >
                  <div className="flex flex-col items-center justify-center p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <FileText className={`w-24 h-24 mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <p className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      PDF preview not available
                    </p>
                    <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Your browser doesn't support PDF preview. Please download to view.
                    </p>
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload();
                      }}
                      className="touch-manipulation"
                    >
                      Download PDF
                    </Button>
                  </div>
                </iframe>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <div className="flex flex-col items-center justify-center p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <FileText className={`w-24 h-24 mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <p className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Preview not available
              </p>
              <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                This file type cannot be previewed. Please download to view.
              </p>
              <Button onClick={handleDownload}>
                Download File
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="relative w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <h3 className="text-white font-medium">{file.name}</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5 text-white" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          {file.type === 'image' ? (
            <img
              src={file.url}
              alt={file.name}
              className="max-h-full max-w-full object-contain"
            />
          ) : file.type === 'video' ? (
            <video
              src={file.url}
              controls
              className="max-h-full max-w-full"
            />
          ) : (
            <div className="text-white">Unsupported media type</div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleFavorite(file.id)}
          >
            <Star
              className={`w-5 h-5 ${
                file.isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-white'
              }`}
            />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDownload(file)}
          >
            <Download className="w-5 h-5 text-white" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onShare(file)}
          >
            <Share className="w-5 h-5 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MediaViewer;
