"use client"

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Post } from '@/lib/types/Post';

const PostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      // This is a simplified version. In a real app, you would fetch the post
      // from your API using the slug.
      const fetchPost = async () => {
        try {
          const response = await fetch(`/api/posts`);
          if (!response.ok) {
            throw new Error('Failed to fetch posts');
          }
          const posts = await response.json();
          const foundPost = posts.find((p: Post) => encodeURIComponent(p.title.toLowerCase().replace(/\s+/g, '-')) === slug || p.id === slug);
          
          if (foundPost) {
            setPost(foundPost);
          } else {
            setError('Post not found');
          }
        } catch (err: any) {
          setError(err.message || 'Failed to load post');
        } finally {
          setLoading(false);
        }
      };

      fetchPost();
    }
  }, [slug]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
      {post.media && post.media.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {post.media.map((m) => (
            <div key={m.id}>
              <img src={m.url} alt={m.caption || ''} className="w-full h-auto object-cover rounded-lg" />
              {m.caption && <p className="text-sm text-gray-500 mt-1">{m.caption}</p>}
            </div>
          ))}
        </div>
      )}
      <div className="prose max-w-none whitespace-pre-wrap">
        {post.content}
      </div>
    </div>
  );
};

export default PostPage;