"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Search, Video, FolderOpen, Pin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Blog, BlogStatus, calculateReadingTime } from '@/lib/types/Blog';
import { useProfileStore } from '@/lib/profile-store';
import { useDatabaseInit } from '@/hooks/use-database-init';
import { Footer } from '@/components/Footer';
import { PushNotificationPrompt } from '@/components/blog/PushNotificationPrompt';
import { SmartSearch, SortOption } from '@/components/blog/SmartSearch';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function BlogPage() {
  useDatabaseInit();
  const router = useRouter();
  const { profileData } = useProfileStore();

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Fetch blogs - with fallback to posts API
  useEffect(() => {
    async function fetchBlogs() {
      try {
        // Fetch blogs from API
        const response = await fetch('/api/blogs');
        if (!response.ok) throw new Error('Failed to fetch blogs');
        const data: Blog[] = await response.json();

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

  // Check if pin is valid (not expired)
  const isPinValid = (blog: Blog): boolean => {
    if (!blog.isPinned) return false;
    if (!blog.pinDeadline) return true;
    return new Date(blog.pinDeadline) > new Date();
  };

  // Filter and sort blogs
  const filteredBlogs = useMemo(() => {
    let result = blogs;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (blog) =>
          blog.title.toLowerCase().includes(query) ||
          blog.summary.toLowerCase().includes(query) ||
          blog.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Apply tag filter
    if (selectedTag) {
      result = result.filter((blog) =>
        blog.tags.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase())
      );
    }

    // Separate pinned and non-pinned
    const pinned = result.filter((blog) => isPinValid(blog))
      .sort((a, b) => (b.pinPriority || 0) - (a.pinPriority || 0));
    
    const notPinned = result.filter((blog) => !isPinValid(blog));

    // Apply sorting to non-pinned blogs
    switch (sortBy) {
      case 'oldest':
        notPinned.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'popular':
        notPinned.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'trending':
        // Trending = recent + popular (last 30 days with high views)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        notPinned.sort((a, b) => {
          const aRecent = new Date(a.date) > thirtyDaysAgo;
          const bRecent = new Date(b.date) > thirtyDaysAgo;
          if (aRecent && !bRecent) return -1;
          if (!aRecent && bRecent) return 1;
          return (b.views || 0) - (a.views || 0);
        });
        break;
      case 'newest':
      default:
        notPinned.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    return [...pinned, ...notPinned];
  }, [blogs, searchQuery, selectedTag, sortBy]);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vikasgoyanka.in';

  // JSON-LD structured data for Blog
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${baseUrl}/blog#blog`,
    name: 'Blog — Vikas Goyanka',
    description: 'Explore articles on law, technology, systems thinking, and personal reflections by Vikas Goyanka.',
    url: `${baseUrl}/blog`,
    inLanguage: 'en-IN',
    author: {
      '@type': 'Person',
      '@id': `${baseUrl}#person`,
      name: profileData?.name || 'Vikas Goyanka',
      url: baseUrl,
    },
    publisher: {
      '@type': 'Person',
      '@id': `${baseUrl}#person`,
      name: profileData?.name || 'Vikas Goyanka',
    },
    blogPost: filteredBlogs.slice(0, 10).map((blog) => ({
      '@type': 'BlogPosting',
      '@id': `${baseUrl}/blog/${blog.slug}`,
      headline: blog.title,
      description: blog.summary,
      datePublished: blog.date,
      dateModified: blog.updated_at || blog.date,
      url: `${baseUrl}/blog/${blog.slug}`,
      keywords: blog.tags?.join(', '),
      author: {
        '@type': 'Person',
        name: profileData?.name || 'Vikas Goyanka',
      },
    })),
  };

  // Breadcrumb structured data
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${baseUrl}/blog`,
      },
    ],
  };

  // WebPage structured data
  const webPageData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${baseUrl}/blog#webpage`,
    name: 'Blog — Thoughts & Reflections',
    description: 'Explore articles on law, technology, systems thinking, and personal reflections.',
    url: `${baseUrl}/blog`,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${baseUrl}#website`,
      name: 'Vikas Goyanka',
      url: baseUrl,
    },
    about: {
      '@type': 'Blog',
      '@id': `${baseUrl}/blog#blog`,
    },
    mainEntity: {
      '@type': 'Blog',
      '@id': `${baseUrl}/blog#blog`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageData) }}
      />

      <div className="min-h-screen flex flex-col bg-background">
        {/* Main content */}
        <main className="flex-1 py-6 sm:py-8 md:py-10">
          <div className="blog-container">
            {/* Page header */}
            <header className="mb-6 sm:mb-8 md:mb-10 animate-fade-in">
              <h1 className="blog-title mb-3 sm:mb-4">Blog</h1>
              <p className="blog-subtitle max-w-md">
                Reflections, documented thinking, and notes on projects and systems.
              </p>
            </header>

            {/* Smart Search */}
            <div className="mb-6 sm:mb-8 animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
              <SmartSearch
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedTag={selectedTag}
                onTagSelect={setSelectedTag}
                availableTags={availableTags}
                sortBy={sortBy}
                onSortChange={setSortBy}
                totalResults={filteredBlogs.length}
                className="max-w-2xl"
              />
            </div>

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
                  <div className="space-y-0 sm:space-y-2">
                    <AnimatePresence mode="popLayout">
                      {filteredBlogs.map((blog, index) => (
                        <motion.div
                          key={blog.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ 
                            duration: 0.3, 
                            delay: index * 0.04,
                            ease: [0.22, 1, 0.36, 1]
                          }}
                        >
                          <Link
                            href={`/blog/${blog.slug}`}
                            className={cn(
                              'blog-card block group relative overflow-hidden',
                              isPinValid(blog) && 'ring-1 ring-amber-500/30 bg-gradient-to-r from-amber-50/50 to-transparent'
                            )}
                          >
                            {/* Hover gradient overlay - desktop only */}
                            <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                            
                            {/* Pinned Badge */}
                            {isPinValid(blog) && (
                              <div className="absolute -top-1 -right-1 z-10">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25">
                                  <Pin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                  Pinned
                                </span>
                              </div>
                            )}

                            {/* Content wrapper */}
                            <div className="relative z-10">
                              {/* Date and Reading Time */}
                              <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2 text-xs sm:text-sm text-muted-foreground">
                                <time className="blog-meta">
                                  {format(new Date(blog.date), 'MMM d, yyyy')}
                                </time>
                                {blog.reading_time && (
                                  <>
                                    <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {blog.reading_time}
                                    </span>
                                  </>
                                )}
                              </div>

                              {/* Title */}
                              <h2 className="blog-card-title text-base sm:text-xl font-medium mb-1.5 sm:mb-2 text-foreground sm:group-hover:text-primary transition-colors duration-200">
                                {blog.title}
                                {/* Arrow - desktop only */}
                                <span className="hidden sm:inline-block ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
                                  →
                                </span>
                              </h2>

                              {/* Summary */}
                              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-2 sm:mb-3 line-clamp-2">
                                {blog.summary}
                              </p>

                              {/* Tags and indicators */}
                              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                {blog.tags.slice(0, 2).map((tag) => (
                                  <span key={tag} className="blog-tag text-[10px] sm:text-xs sm:group-hover:bg-primary/10 transition-colors">
                                    {tag}
                                  </span>
                                ))}
                                {blog.tags.length > 2 && (
                                  <span className="text-[10px] sm:text-xs text-muted-foreground">+{blog.tags.length - 2}</span>
                                )}

                                {blog.linked_project && (
                                  <span className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                                    <FolderOpen className="w-3 h-3" />
                                    <span className="hidden sm:inline">Project</span>
                                  </span>
                                )}

                                {blog.linked_video && (
                                  <span className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                                    <Video className="w-3 h-3" />
                                    <span className="hidden sm:inline">Video</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </AnimatePresence>
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
        <PushNotificationPrompt variant="floating" />
      </div>
    </>
  );
}
