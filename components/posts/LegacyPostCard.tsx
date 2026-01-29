"use client"

import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Post, Media } from '@/lib/types/Post';
import { useProfileStore } from '@/lib/profile-store';
import { cn } from '@/lib/utils';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { profileData } = useProfileStore();
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const mediaScrollRef = useRef<HTMLDivElement>(null);
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title || 'Professional Insight',
        text: post.content,
        url: window.location.href + '#post-' + post.id,
      });
    } else {
      navigator.clipboard.writeText(window.location.href + '#post-' + post.id);
    }
  };

  const formatTimestamp = (date: Date) => {
    // Convert string to Date object if it's not already a Date
    const dateObj = date instanceof Date ? date : new Date(date);
    
    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return dateObj.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const scrollToMedia = (index: number) => {
    if (mediaScrollRef.current) {
      const scrollContainer = mediaScrollRef.current;
      const mediaItems = scrollContainer.querySelectorAll('.media-item');
      
      if (mediaItems[index]) {
        scrollContainer.scrollTo({
          left: mediaItems[index].getBoundingClientRect().left - scrollContainer.getBoundingClientRect().left + scrollContainer.scrollLeft,
          behavior: 'smooth'
        });
        
        setCurrentMediaIndex(index);
      }
    }
  };

  const handleScroll = () => {
    if (mediaScrollRef.current) {
      const scrollContainer = mediaScrollRef.current;
      const scrollLeft = scrollContainer.scrollLeft;
      const containerWidth = scrollContainer.clientWidth;
      
      // Calculate which media item is most visible
      const mediaItems = scrollContainer.querySelectorAll('.media-item');
      let closestIndex = 0;
      let closestDistance = Infinity;
      
      mediaItems.forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        const containerRect = scrollContainer.getBoundingClientRect();
        const distance = Math.abs((rect.left + rect.width / 2) - (containerRect.left + containerRect.width / 2));
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      
      setCurrentMediaIndex(closestIndex);
    }
  };

  const scrollNext = () => {
    if (post.media && currentMediaIndex < post.media.length - 1) {
      scrollToMedia(currentMediaIndex + 1);
    }
  };

  const scrollPrev = () => {
    if (currentMediaIndex > 0) {
      scrollToMedia(currentMediaIndex - 1);
    }
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full overflow-hidden">
              <img 
                src={profileData.profileImage || "/placeholder.svg"} 
                alt={profileData.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }}
              />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-lg">{profileData.name}</p>
              <div className="flex items-center text-gray-500 text-sm">
                <Clock className="w-4 h-4 mr-1" />
                {formatTimestamp(post.timestamp)}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full border border-gray-300 font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Title */}
        {post.title && (
          <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">{post.title}</h2>
        )}

        {/* Content */}
        <div className="mb-6">
          <p className="text-gray-700 text-lg leading-relaxed">{post.content}</p>
        </div>
          
        {/* Media Content */}
        {post.media && post.media.length > 0 && (
          <div className="mt-6 mb-6 relative">
            <div 
              ref={mediaScrollRef} 
              className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar"
              onScroll={handleScroll}
            >
              {post.media.map((media, index) => (
                <div 
                  key={media.id} 
                  className="media-item min-w-full w-full flex-shrink-0 snap-center"
                >
                  {media.type === 'image' ? (
                    <div className="rounded-lg overflow-hidden shadow-md border border-gray-200">
                      <img 
                        src={media.url} 
                        alt={media.caption || `Image ${index + 1}`}
                        className="w-full h-auto object-cover max-h-[500px]"
                      />
                      {media.caption && (
                        <div className="p-3 bg-gray-50 text-sm text-gray-600">
                          {media.caption}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-lg overflow-hidden shadow-md border border-gray-200">
                      <video 
                        src={media.url} 
                        controls
                        className="w-full h-auto max-h-[500px]"
                      />
                      {media.caption && (
                        <div className="p-3 bg-gray-50 text-sm text-gray-600">
                          {media.caption}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Navigation Arrows */}
            {post.media.length > 1 && (
              <>
                <button 
                  onClick={scrollPrev}
                  disabled={currentMediaIndex === 0}
                  className={cn(
                    "absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-opacity duration-200",
                    currentMediaIndex === 0 ? "opacity-0" : "opacity-70 hover:opacity-100"
                  )}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={scrollNext}
                  disabled={currentMediaIndex === post.media.length - 1}
                  className={cn(
                    "absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-opacity duration-200",
                    currentMediaIndex === post.media.length - 1 ? "opacity-0" : "opacity-70 hover:opacity-100"
                  )}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
            
            {/* Dots Indicator */}
            {post.media.length > 1 && (
              <div className="flex justify-center mt-4 gap-1.5">
                {post.media.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToMedia(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      currentMediaIndex === index 
                        ? "bg-gray-800 w-4" 
                        : "bg-gray-300 hover:bg-gray-400"
                    )}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end pt-4 border-t border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            onClick={handleShare}
          >
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>
    </Card>
  );
};