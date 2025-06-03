"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Comment } from '@/lib/types/Post';

interface CommentSectionProps {
  comments: Comment[];
  postId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ comments, postId }) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localComments, setLocalComments] = useState<Comment[]>(comments);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const commentData = {
        author: 'You', // In a real app, this would be the logged-in user
        content: newComment,
        timestamp: new Date()
      };
      
      const response = await fetch(`/api/posts/comment?postId=${postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
      
      const savedComment = await response.json();
      setLocalComments([...localComments, savedComment]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCommentTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      {/* Existing Comments */}
      <div className="space-y-6 mb-6">
        {localComments.map((comment) => (
          <div key={comment.id} className="flex space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full flex items-center justify-center text-white font-semibold">
              {comment.author.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">{comment.author}</span>
                  <span className="text-sm text-gray-500">{formatCommentTime(comment.timestamp)}</span>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Comment Form */}
      <div className="flex space-x-4">
        <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white font-semibold">
          Y
        </div>
        <div className="flex-1 space-y-3">
          <Textarea
            placeholder="Share your professional thoughts..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="bg-white border-gray-300 resize-none focus:border-gray-500 focus:ring-gray-500"
            rows={3}
          />
          <Button
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || isSubmitting}
            size="sm"
            className="bg-gray-900 hover:bg-gray-800 text-white font-medium"
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </Button>
        </div>
      </div>
    </div>
  );
};