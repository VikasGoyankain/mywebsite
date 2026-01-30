"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Search, X, Video, FolderOpen, Verified, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Blog, BlogStatus, calculateReadingTime } from '@/lib/types/Blog';
import { Post } from '@/lib/types/Post';
import { useProfileStore } from '@/lib/profile-store';
import { useDatabaseInit } from '@/hooks/use-database-init';
import { Footer } from '@/components/Footer';
import { NotificationBanner } from '@/components/blog/NotificationBanner';
import { PushNotificationPrompt } from '@/components/blog/PushNotificationPrompt';
import { cn } from '@/lib/utils';

export default function BlogPage() {
  useDatabaseInit();
  const router = useRouter();
  const { profileData } = useProfileStore();

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch blogs - with fallback to posts API
  useEffect(() => {
    async function fetchBlogs() {
      try {
        // Try blogs API first
        let data: Blog[] = [];
        try {
          const response = await fetch('/api/blogs');
          if (response.ok) {
            data = await response.json();
          }
        } catch {}

        // Fallback to posts API if no blogs
        if (data.length === 0) {
          const response = await fetch('/api/posts');
          if (!response.ok) throw new Error('Failed to fetch posts');
          const posts: Post[] = await response.json();

          // Transform posts to blog format
          data = posts.map((post) => ({
            id: post.id,
            title: post.title || 'Untitled',
            slug: post.id,
            date: post.created_at?.toString() || new Date(post.timestamp).toISOString(),
            type: 'blog' as const,
            status: 'published' as BlogStatus,
            summary: post.description || post.content?.substring(0, 160).replace(/<[^>]*>/g, '') || '',
            tags: post.tags || [],
            linked_project: null,
            linked_publication: null,
            linked_video: post.media?.some((m) => m.type === 'video') ? 'video' : null,
            content: post.content,
            version: 'v1.0',
            canonical: true,
            visibility: 'public' as const,
            audience: 'general' as const,
            last_updated: post.updated_at?.toString() || null,
            created_at: post.created_at?.toString() || new Date(post.timestamp).toISOString(),
            updated_at: post.updated_at?.toString() || new Date(post.timestamp).toISOString(),
            reading_time: calculateReadingTime(post.content || ''),
          }));
        }

        // Filter only published blogs for public view
        setBlogs(data.filter((b) => b.status === 'published'));
      } catch (err: any) {
        setError('Failed to load blogs');
        console.error('Error fetching blogs:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, []);

  // Extract unique tags
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    blogs.forEach((blog) => blog.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [blogs]);

  // Filter blogs
  const filteredBlogs = useMemo(() => {
    let result = blogs;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (blog) =>
          blog.title.toLowerCase().includes(query) ||
          blog.summary.toLowerCase().includes(query) ||
          blog.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    if (selectedTag) {
      result = result.filter((blog) =>
        blog.tags.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase())
      );
    }

    // Sort by date descending
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [blogs, searchQuery, selectedTag]);

  // JSON-LD structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Blog',
    description: 'Reflections on law, technology, and systems thinking.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://vikasgoyanka.in'}/blog`,
    author: {
      '@type': 'Person',
      name: profileData?.name || 'Vikas Goyanka',
      url: process.env.NEXT_PUBLIC_BASE_URL || 'https://vikasgoyanka.in',
    },
    blogPost: filteredBlogs.slice(0, 10).map((blog) => ({
      '@type': 'BlogPosting',
      headline: blog.title,
      description: blog.summary,
      datePublished: blog.date,
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://vikasgoyanka.in'}/blog/${blog.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen flex flex-col bg-background">
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

              {/* Desktop Social Links */}
              <div className="hidden md:flex items-center gap-2">
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

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
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
              <div className="md:hidden mt-3 py-3 border-t border-border/60">
                <div className="flex items-center justify-center gap-4">
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

        {/* Main content */}
        <main className="flex-1 py-16 sm:py-20">
          <div className="blog-container">
            {/* Page header */}
            <header className="mb-16 animate-fade-in">
              <h1 className="blog-title mb-4">Blog</h1>
              <p className="blog-subtitle max-w-md">
                Reflections, documented thinking, and notes on projects and systems.
              </p>
            </header>

            {/* Search */}
            <div className="mb-10 animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 bg-card border-border/60 focus:border-primary/40 focus:ring-0"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Tags filter */}
            {availableTags.length > 0 && (
              <div
                className="flex flex-wrap gap-2 mb-12 animate-slide-up"
                style={{ animationDelay: '0.15s', animationFillMode: 'backwards' }}
              >
                <button
                  onClick={() => setSelectedTag(null)}
                  className={cn('blog-tag', !selectedTag && 'blog-tag-active')}
                >
                  All
                </button>
                {availableTags.slice(0, 6).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={cn('blog-tag', selectedTag === tag && 'blog-tag-active')}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="py-20 text-center">
                <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary" />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="py-16 text-center">
                <p className="text-muted-foreground">{error}</p>
              </div>
            )}

            {/* Blog list */}
            {!loading && !error && (
              <div className="animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
                {filteredBlogs.length > 0 ? (
                  <div>
                    {filteredBlogs.map((blog) => (
                      <Link
                        key={blog.id}
                        href={`/blog/${blog.slug}`}
                        className="blog-card block group"
                      >
                        {/* Date */}
                        <time className="blog-meta block mb-2">
                          {format(new Date(blog.date), 'MMMM d, yyyy')}
                        </time>

                        {/* Title */}
                        <h2 className="text-xl font-medium mb-2 text-foreground group-hover:text-primary transition-colors duration-200">
                          {blog.title}
                        </h2>

                        {/* Summary */}
                        <p className="text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                          {blog.summary}
                        </p>

                        {/* Tags and indicators */}
                        <div className="flex items-center gap-3 flex-wrap">
                          {blog.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="blog-tag">
                              {tag}
                            </span>
                          ))}

                          {blog.linked_project && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <FolderOpen className="w-3 h-3" />
                              Project
                            </span>
                          )}

                          {blog.linked_video && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Video className="w-3 h-3" />
                              Video
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center">
                    <p className="text-muted-foreground">No posts found</p>
                    {(searchQuery || selectedTag) && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedTag(null);
                        }}
                        className="mt-4 text-sm text-primary hover:underline"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Post count */}
            {!loading && !error && filteredBlogs.length > 0 && (
              <div className="mt-16 pt-8 border-t border-border/40 text-center">
                <p className="text-sm text-muted-foreground/70">
                  {blogs.length} {blogs.length === 1 ? 'post' : 'posts'} published
                </p>
              </div>
            )}
          </div>
        </main>

        <Footer />
        <NotificationBanner />
        <PushNotificationPrompt variant="floating" />
      </div>
    </>
  );
}
