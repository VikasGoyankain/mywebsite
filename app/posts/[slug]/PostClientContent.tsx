"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Post } from '@/lib/types/Post';
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
  Users, // Fallback icon
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useProfileStore } from "@/lib/profile-store";
import { Footer } from "@/components/Footer";
import { useDatabaseInit } from "@/hooks/use-database-init";

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

interface PostClientContentProps {
  post: Post & { 
    readTime?: string;
    updatedAt?: string | Date;
  };
}

const PostClientContent: React.FC<PostClientContentProps> = ({ post }) => {
  const router = useRouter();
  useDatabaseInit(); // Initialize database connection
  const { profileData } = useProfileStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      const hashtagRegex = /#(\w+)/g;
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      
      let formattedLine = line;
      
      formattedLine = formattedLine.replace(hashtagRegex, '<span class="text-blue-500 hover:underline cursor-pointer">#$1</span>');
      formattedLine = formattedLine.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">$1</a>');
      
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

  // Format the date safely
  const formatDate = (dateValue: string | Date | undefined) => {
    if (!dateValue) return '';
    
    const date = new Date(dateValue);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => router.push('/posts')}
                variant="ghost"
                className="mr-2 p-2 hover:bg-gray-100"
                size="icon"
                aria-label="Back to Posts"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
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
                  <span className="font-bold text-gray-900">{profileData.name}</span>
                  <Verified className="w-4 h-4 text-blue-500" />
                </div>
                <span className="text-sm text-gray-600">{profileData.title}</span>
              </div>
            </div>

            {/* Desktop Social Links */}
            <div className="hidden md:flex items-center gap-2">
              {profileData.socialLinks.map((social) => (
                <Link
                  key={social.id}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-full transition-all duration-200 hover:scale-105 relative group`}
                  aria-label={`Visit ${social.name} profile`}
                >
                  <div className={`absolute inset-0 rounded-full ${social.color || ''} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                  {social.icon ? (
                    <img
                      src={social.icon}
                      alt={social.name}
                      className="w-4 h-4 relative z-10"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                  ) : (
                    <div className="text-gray-600 hover:text-blue-600">
                      {React.createElement(getIconComponent(social.name), { className: "w-4 h-4" })}
                    </div>
                  )}
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Mobile Social Links Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-3 py-3 border-t border-gray-100">
              <div className="flex items-center justify-center gap-4">
                {profileData.socialLinks.map((social) => (
                  <Link
                    key={social.id}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 rounded-full transition-all duration-200 hover:scale-105 relative group`}
                    aria-label={`Visit ${social.name} profile`}
                  >
                    <div className={`absolute inset-0 rounded-full ${social.color || ''} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                    {social.icon ? (
                      <img
                        src={social.icon}
                        alt={social.name}
                        className="w-4 h-4 relative z-10"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                    ) : (
                      <div className="text-gray-600 hover:text-blue-600">
                        {React.createElement(getIconComponent(social.name), { className: "w-4 h-4" })}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 flex-grow">
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md overflow-hidden my-8">
          {/* Post Header */}
          <div className="p-6 border-b border-gray-200 dark:border-neutral-700">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">{post.title}</h1>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <span>{formatDate(post.createdAt || post.timestamp)}</span>
                <span className="mx-2">•</span>
                <span>{post.readTime || '5 min read'}</span>
              </div>
              <Button onClick={handleShare} size="sm" variant="ghost" className="text-gray-600 dark:text-gray-400">
                <Share className="w-4 h-4 mr-1" />
                Share
              </Button>
            </div>
          </div>

          {/* Featured Image */}
          {post.media && post.media.length > 0 && (
            <div className="relative w-full h-64 sm:h-96">
              <img 
                src={post.media[0].url} 
                alt={post.title || 'Post image'} 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Post Content */}
          <div className="p-6">
            {formatContent(post.content)}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="px-6 pb-6 pt-2">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2.5 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PostClientContent;
