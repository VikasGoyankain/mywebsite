"use client"

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Share, Clock } from 'lucide-react';
import { CommentSection } from './CommentSection';
import { Post } from '@/lib/types/Post';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [showComments, setShowComments] = useState(false);

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

  return (
    <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {post.author.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-lg">{post.author}</p>
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
          {post.type === 'text' && (
            <p className="text-gray-700 text-lg leading-relaxed">{post.content}</p>
          )}
          
          {post.type === 'image' && (
            <div>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">{post.content}</p>
              <div className="rounded-lg overflow-hidden shadow-md border border-gray-200">
                <img 
                  src={post.imageUrl} 
                  alt={post.title || 'Professional image'}
                  className="w-full h-80 object-cover"
                />
              </div>
            </div>
          )}
          
          {post.type === 'video' && (
            <div>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">{post.content}</p>
              <div className="rounded-lg overflow-hidden shadow-md bg-gray-100 aspect-video flex items-center justify-center border border-gray-200">
                <div className="text-center">
                  <p className="text-gray-500 mb-2">Video Preview</p>
                  <Button variant="outline" size="sm">
                    Watch Video
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {post.comments.length} {post.comments.length === 1 ? 'Comment' : 'Comments'}
          </Button>
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

      {/* Comments Section */}
      {showComments && <CommentSection comments={post.comments} postId={post.id} />}
    </Card>
  );
};