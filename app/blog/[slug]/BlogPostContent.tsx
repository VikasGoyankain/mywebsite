"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { Share2, Clock, ChevronRight, ExternalLink, Video, FolderOpen, Verified, Menu, X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { Post } from '@/lib/types/Post';
import { Footer } from '@/components/Footer';
import { useDatabaseInit } from '@/hooks/use-database-init';
import { useProfileStore } from '@/lib/profile-store';
import { calculateReadingTime } from '@/lib/types/Blog';
import { PushNotificationPrompt } from '@/components/blog/PushNotificationPrompt';

interface BlogPostContentProps {
  post: Post & {
    readTime?: string;
    updated_at?: string | Date;
    linked_project?: string | null;
    linked_publication?: string | null;
    linked_video?: string | null;
    version?: string;
    summary?: string;
  };
}

export default function BlogPostContent({ post }: BlogPostContentProps) {
  const router = useRouter();
  useDatabaseInit();
  const { profileData } = useProfileStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Calculate reading time
  const readTime = post.readTime || calculateReadingTime(post.content);

  // Get dates
  const publishedDate = post.created_at 
    ? new Date(post.created_at) 
    : post.timestamp 
      ? new Date(post.timestamp) 
      : new Date();

  const updatedDate = post.updated_at ? new Date(post.updated_at) : null;
  const isUpdated = updatedDate && updatedDate > publishedDate;

  // Format content with proper typography
  const formatContent = (content: string) => {
    const paragraphs = content.split('\n').filter(line => line.trim());
    
    return paragraphs.map((paragraph, index) => {
      // Handle URLs
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      let formatted = paragraph.replace(
        urlRegex, 
        '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary underline underline-offset-4 decoration-primary/30 hover:decoration-primary transition-colors">$1</a>'
      );
      
      // Handle hashtags
      const hashtagRegex = /#(\w+)/g;
      formatted = formatted.replace(
        hashtagRegex, 
        '<span class="text-primary/80 font-medium">#$1</span>'
      );

      return (
        <p 
          key={index} 
          className="blog-body mb-6 last:mb-0"
          dangerouslySetInnerHTML={{ __html: formatted }} 
        />
      );
    });
  };

  // Share handler
  const handleShare = async () => {
    const url = window.location.href;
    const title = post.title || 'Blog post';
    
    // Try native share first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        toast({
          title: "Shared",
          description: "Link shared successfully",
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fall through to clipboard
      }
    }
    
    // Fallback to clipboard
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for older browsers or non-HTTPS
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      toast({
        title: "Link copied",
        description: "URL copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Share failed",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header - matching homepage navbar */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/60 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                <AvatarImage src={profileData?.profileImage || "/placeholder.svg"} alt={profileData?.name || 'Profile'} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-white font-bold">
                  {profileData?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || 'VG'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">{profileData?.name || 'Blog'}</span>
                  <Verified className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">{profileData?.title || ''}</span>
              </div>
            </Link>

            {/* Desktop: Back to Blog + Social Links + Share */}
            <div className="hidden md:flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/blog')}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Blog
              </Button>
              
              <div className="h-5 w-px bg-border/60" />
              
              {profileData?.socialLinks?.slice(0, 4).map((social) => (
                <Link
                  key={social.id}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full transition-all duration-200 hover:scale-105 relative group"
                  aria-label={`Visit ${social.name} profile`}
                >
                  <div className={`absolute inset-0 rounded-full ${social.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                  <img
                    src={social.icon}
                    alt={social.name}
                    className="w-4 h-4 relative z-10"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                </Link>
              ))}
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="text-muted-foreground hover:text-foreground"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Mobile: Menu Button + Share */}
            <div className="flex md:hidden items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="text-muted-foreground hover:text-foreground"
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-3 py-3 border-t border-border/60 space-y-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/blog')}
                className="w-full justify-start text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
              <div className="flex items-center justify-center gap-4 pt-2">
                {profileData?.socialLinks?.map((social) => (
                  <Link
                    key={social.id}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full transition-all duration-200 hover:scale-105 relative group"
                    aria-label={`Visit ${social.name} profile`}
                  >
                    <div className={`absolute inset-0 rounded-full ${social.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                    <img
                      src={social.icon}
                      alt={social.name}
                      className="w-4 h-4 relative z-10"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-16 sm:py-20">
        <article className="blog-container">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground/60 mb-10 animate-fade-in">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/blog" className="hover:text-foreground transition-colors">
              Blog
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-muted-foreground truncate max-w-[200px]">
              {post.title}
            </span>
          </nav>

          {/* Article Header */}
          <header className="mb-12 animate-slide-up">
            {/* Title - Serif for calm institutional feel */}
            <h1 className="blog-title mb-6">
              {post.title || 'Untitled'}
            </h1>

            {/* Summary if exists */}
            {post.summary && (
              <p className="blog-subtitle max-w-2xl mb-6">
                {post.summary}
              </p>
            )}

            {/* Meta line */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 blog-meta">
              <time dateTime={publishedDate.toISOString()}>
                {format(publishedDate, 'MMMM d, yyyy')}
              </time>
              
              {isUpdated && (
                <span className="text-muted-foreground/50">
                  · Updated {format(updatedDate!, 'MMM d, yyyy')}
                </span>
              )}

              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {readTime}
              </span>

              {post.version && (
                <span className="text-muted-foreground/50">
                  · {post.version}
                </span>
              )}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {post.tags.map((tag) => (
                  <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`}>
                    <span className="blog-tag cursor-pointer">
                      {tag}
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {/* Linked resources */}
            {(post.linked_project || post.linked_publication || post.linked_video) && (
              <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-border/40">
                {post.linked_project && (
                  <a
                    href={post.linked_project}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <FolderOpen className="w-4 h-4" />
                    View Project
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {post.linked_publication && (
                  <a
                    href={post.linked_publication}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Read Publication
                  </a>
                )}
                {post.linked_video && (
                  <a
                    href={post.linked_video}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Video className="w-4 h-4" />
                    Watch Video
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
          </header>

          {/* Article Content */}
          <div className="animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
            {formatContent(post.content)}
          </div>

          {/* Article Footer */}
          <footer className="mt-20 pt-10 border-t border-border/40">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => router.push('/blog')}
                className="text-muted-foreground hover:text-foreground -ml-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                All posts
              </Button>

              <Button
                variant="ghost"
                onClick={handleShare}
                className="text-muted-foreground hover:text-foreground -mr-4"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </footer>
        </article>
      </main>

      <Footer />
      
      {/* Push Notification Prompt */}
      <PushNotificationPrompt variant="floating" />
    </div>
  );
}
