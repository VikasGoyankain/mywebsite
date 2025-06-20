"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { 
  Calendar, 
  Share, 
  Filter, 
  Search, 
  Grid, 
  List, 
  Play, 
  X, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Home,
  Verified,
  Menu
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { Post } from '@/lib/types/Post';
import { useProfileStore } from '@/lib/profile-store';
import { cn } from '@/lib/utils';
import { PostCard } from '@/components/posts/PostCard';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { useDatabaseInit } from '@/hooks/use-database-init';

export default function Posts() {
  useDatabaseInit(); // Initialize database connection
  const { profileData } = useProfileStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Add router for navigation
  const router = useRouter();

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch('/api/posts');
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        const data = await response.json();
        setPosts(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load posts');
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  const filteredAndSortedPosts = useMemo(() => {
    let filtered = posts.filter(post => {
      if (!searchQuery.trim()) return true;
      
      const query = searchQuery.toLowerCase().trim();
      return (
        (post.title?.toLowerCase().includes(query) || false) ||
        post.content.toLowerCase().includes(query) ||
        post.tags.some(tag => tag.toLowerCase().includes(query))
      );
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      if (sortBy === 'oldest') return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      return 0;
    });
  }, [posts, sortBy, searchQuery]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => router.push('/')}
                variant="ghost"
                className="mr-2 p-2 hover:bg-gray-100"
                size="icon"
                aria-label="Main Page"
              >
                <Home className="h-5 w-5" />
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
      </div>

      <div className="container mx-auto px-4 py-8 flex-grow">
        {/* Hero Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-secondary/10" />
          <div className="relative max-w-7xl mx-auto px-4 py-16">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <Avatar className="h-24 w-24 ring-4 ring-primary/20 ring-offset-4 ring-offset-background">
                  <AvatarImage src={profileData.profileImage || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl font-bold">{profileData.name?.charAt(0) || 'P'}</AvatarFallback>
                </Avatar>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                  Professional Insights
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                  Legal perspectives, business insights, and thought leadership from a professional's point of view
                </p>
              </motion.div>
            </div>
          </div>
        </div>
        
        {/* Filters and Controls */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8"
          >
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background/50 backdrop-blur-sm focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32 bg-background/50 backdrop-blur-sm">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-16">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-300 border-t-gray-900"></div>
              <p className="text-gray-500 text-lg mt-4">Loading posts...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-16">
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <p className="text-red-700 text-lg">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Posts Grid/List */}
          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAndSortedPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {!loading && !error && filteredAndSortedPosts.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No posts found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria</p>
              {searchQuery && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchQuery('')}
                  className="mt-4"
                >
                  Clear search
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}