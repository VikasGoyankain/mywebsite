"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Post, Media } from '@/lib/types/Post';
import { 
  Share, 
  ArrowLeft, 
  Verified,
  Linkedin,
  Twitter,
  Instagram,
  Send, // For Telegram
  Facebook,
  Github,
  Youtube,
  Users // Fallback icon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useProfileStore } from "@/lib/profile-store";

// Icon mapping for social media
const getIconComponent = (iconName: string) => {
  switch (iconName.toLowerCase()) {
    case 'linkedin':
      return Linkedin;
    case 'twitter':
      return Twitter;
    case 'instagram':
      return Instagram;
    case 'telegram':
      return Send;
    case 'facebook':
      return Facebook;
    case 'github':
      return Github;
    case 'youtube':
      return Youtube;
    default:
      return Users;
  }
};

const PostPage = () => {
  const { slug } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profileData } = useProfileStore();

  useEffect(() => {
    if (slug) {
      const fetchPost = async () => {
        // Ensure slug is treated as string, as useParams can return string | string[]
        const currentSlug = Array.isArray(slug) ? slug[0] : slug;
        setLoading(true); // Set loading to true at the beginning of fetch
        setError(null); // Reset error state
        try {
          const response = await fetch(`/api/posts/${encodeURIComponent(currentSlug)}`);
          if (!response.ok) {
            if (response.status === 404) {
              setError('Post not found');
            } else {
              throw new Error('Failed to fetch post');
            }
            setPost(null); // Ensure post is null if not found or error
          } else {
            const foundPost = await response.json();
            setPost(foundPost);
          }
        } catch (err: any) {
          setError(err.message || 'Failed to load post');
          setPost(null); // Ensure post is null on error
        } finally {
          setLoading(false);
        }
      };

      fetchPost();
    } else {
      // Handle case where slug is not available (e.g., during initial render or if routing is misconfigured)
      setLoading(false);
      setError("Post slug not available.");
    }
  }, [slug]);

  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      const hashtagRegex = /#(\w+)/g; // Corrected: Changed \\w to \w
      const urlRegex = /(https?:\/\/[^\s]+)/g; // Corrected: Changed [^\\s] to [^\s]
      
      let formattedLine = line;
      
      formattedLine = formattedLine.replace(hashtagRegex, '<span class="text-blue-500 hover:underline cursor-pointer">#$1</span>'); // Added styling for hashtags
      formattedLine = formattedLine.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">$1</a>'); // Added styling for links
      
      return (
        <p key={index} className="mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: formattedLine }} />
      );
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = post?.title || 'Check out this post';
    
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
        toast({
          title: "Shared successfully!",
          description: "Post has been shared.",
        });
      } catch (err) {
        // User cancelled sharing or error
        console.error("Share failed:", err);
        toast({
          title: "Share failed",
          description: "Could not share the post.",
          variant: "destructive",
        });
      }
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Post URL has been copied to clipboard.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-900 dark:to-neutral-800">
        <div className="animate-pulse text-xl text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-900 dark:to-neutral-800">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-900 dark:to-neutral-800">
      {/* Navbar */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-neutral-800 shadow-sm">
        <div className="px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-y-2 sm:gap-y-0 justify-between max-w-6xl mx-auto">
          {/* Profile Info */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Avatar className="w-10 h-10 ring-2 ring-blue-500/20">
              <AvatarImage src={profileData.profileImage || "/placeholder.svg"} alt={profileData.name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold">
                {profileData.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 dark:text-white">{profileData.name}</span>
                <Verified className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">{profileData.title}</span>
            </div>
          </div>

          {/* Social Links - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {profileData.socialLinks.map((social) => {
              const IconComponent = getIconComponent(social.name);
              return (
                <Link
                  key={social.id}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full transition-all duration-200 hover:scale-105 relative group"
                  aria-label={`Visit ${social.name} profile`}
                >
                  <div className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                    <IconComponent className="w-5 h-5" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Social Links - Mobile */}
          <div className="flex md:hidden items-center gap-1 w-full justify-end">
            {profileData.socialLinks.slice(0, 3).map((social) => {
              const IconComponent = getIconComponent(social.name);
              return (
                <Link
                  key={social.id}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-full transition-all duration-200 hover:scale-105"
                  aria-label={`Visit ${social.name} profile`}
                >
                  <div className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                    <IconComponent className="w-4 h-4" />
                  </div>
                </Link>
              );
            })}
            {profileData.socialLinks.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                className="p-1.5"
                onClick={() => {
                  const el = document.getElementById('social-links-mobile');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Back Button and Content */}
      <div className="max-w-4xl mx-auto px-4">
        <Button
          onClick={() => router.push('/posts')}
          variant="ghost"
          className="mt-4 mb-2 hover:bg-blue-50 dark:hover:bg-blue-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Posts
        </Button>

        {!post ? (
          <div className="text-gray-500 dark:text-gray-400 text-xl text-center py-20">Post not found</div>
        ) : (
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl overflow-hidden mb-8 mt-4">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-4 sm:mb-0">
                  {post.title || "Untitled Post"}
                </h1>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="sm"
                  className="ml-0 sm:ml-4 hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-300 dark:border-neutral-700 dark:text-white dark:hover:border-blue-700 transition-colors"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
              
              {post.media && post.media.length > 0 && (
                <div className={`grid gap-4 mb-8 ${
                  post.media.length === 1 ? 'grid-cols-1' : 
                  post.media.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
                  'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                }`}>
                  {post.media.map((mediaItem: Media) => (
                    <div key={mediaItem.id} className="group">
                      <div className="relative overflow-hidden rounded-xl bg-gray-100 dark:bg-neutral-700 aspect-w-4 aspect-h-3">
                        {mediaItem.type === 'image' ? (
                          <img 
                            src={mediaItem.url} 
                            alt={mediaItem.caption || post.title || 'Post image'} 
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : mediaItem.type === 'video' ? (
                          <video 
                            src={mediaItem.url} 
                            controls 
                            className="w-full h-full object-cover"
                          />
                        ) : null}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
                      </div>
                      {mediaItem.caption && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 px-1 italic">
                          {mediaItem.caption}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <div className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed">
                  {formatContent(post.content)}
                </div>
              </div>
               {post.createdAt && (
                <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
                  Posted on: {new Date(post.createdAt).toLocaleDateString()}
                </div>
              )}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-4">
                  {post.tags.map((tag) => (
                    <span key={tag} className="inline-block bg-gray-200 dark:bg-neutral-700 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 dark:text-gray-200 mr-2 mb-2">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostPage;