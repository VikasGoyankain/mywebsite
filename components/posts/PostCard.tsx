"use client"

import React from 'react';
import Link from 'next/link';
import { Post } from '@/lib/types/Post';
import { Card } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PostCardProps {
  post: Post;
}

// Function to format timestamp
const formatTimestamp = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days < 1) return 'Today';
  if (days < 2) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Media Grid Component
const MediaGrid: React.FC<{ media: Post['media'] }> = ({ media }) => {
    if (!media || media.length === 0) return null;

    const mediaCount = media.length;

    const renderMediaItem = (item: any, index: number, isOverlay: boolean = false) => (
        <div key={item.id || index} className="relative w-full h-full overflow-hidden">
            <img
                src={item.url}
                alt={item.caption || `Post media ${index + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
            />
            {isOverlay && mediaCount > 4 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">+{mediaCount - 3}</span>
                </div>
            )}
        </div>
    );

    if (mediaCount === 1) {
        return renderMediaItem(media[0], 0);
    }

    if (mediaCount === 2) {
        return (
            <div className="grid grid-cols-2 grid-rows-1 gap-1 h-full">
                {media.map((item, index) => renderMediaItem(item, index))}
            </div>
        );
    }

    if (mediaCount === 3) {
        return (
            <div className="grid grid-cols-2 grid-rows-2 gap-1 h-full">
                <div className="col-span-1 row-span-2">{renderMediaItem(media[0], 0)}</div>
                <div className="col-span-1 row-span-1">{renderMediaItem(media[1], 1)}</div>
                <div className="col-span-1 row-span-1">{renderMediaItem(media[2], 2)}</div>
            </div>
        );
    }

    // For 4 or more items
    return (
        <div className="grid grid-cols-2 grid-rows-2 gap-1 h-full">
            {media.slice(0, 4).map((item, index) => 
                renderMediaItem(item, index, index === 3 && mediaCount > 4)
            )}
        </div>
    );
};

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const hasMedia = post.media && post.media.length > 0;

  // Generate a URL-friendly slug from the title
  const slug = encodeURIComponent(post.title?.toLowerCase().replace(/\s+/g, '-') || post.id);

  return (
    <Link href={`/posts/${slug}`} passHref>
      <Card className="h-[90vh] flex flex-col bg-white border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer">
        {/* Title Section */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{post.title}</h2>
        </div>

        {/* Media Section */}
        {hasMedia && (
          <div className="h-1/2 bg-gray-100">
            <MediaGrid media={post.media} />
          </div>
        )}

        {/* Content Section */}
        <div className={cn('p-4 flex-grow overflow-hidden', { 'h-full': !hasMedia })}>
          <p className="text-gray-700 whitespace-pre-wrap break-words h-full overflow-hidden text-ellipsis">
            {post.content}
          </p>
        </div>

        {/* Meta Section */}
        <div className="p-4 border-t border-gray-200 text-sm text-gray-500 flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            <span>{formatTimestamp(post.timestamp)}</span>
          </div>
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigator.clipboard.writeText(`${window.location.origin}/posts/${slug}`); alert('Link copied to clipboard!'); }} className="hover:text-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
          </button>
        </div>
      </Card>
    </Link>
  );
};