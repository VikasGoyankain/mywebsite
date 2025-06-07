"use client"

import React, { useState, useEffect, useMemo } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { Post } from '@/lib/types/Post';
import { useProfileStore } from '@/lib/profile-store';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Posts() {
  const { profileData } = useProfileStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [currentMediaIndices, setCurrentMediaIndices] = useState<Record<string, number>>({});

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

  const formatContentWithLinks = (content: string) => {
    const parts = content.split(/(\s+)/);
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        return (
          <span key={index} className="text-blue-500 hover:text-blue-600 cursor-pointer font-medium">
            {part}
          </span>
        );
      }
      if (part.startsWith('http')) {
        return (
          <a 
            key={index} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 underline inline-flex items-center gap-1"
          >
            {part.length > 30 ? `${part.substring(0, 30)}...` : part}
            <ExternalLink className="h-3 w-3" />
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const sharePost = async (post: Post) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title || 'Professional Insight',
          text: post.content.substring(0, 100) + '...',
          url: window.location.href + '?post=' + post.id,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href + '?post=' + post.id);
      alert('Link copied to clipboard!');
    }
  };

  const openMediaModal = (post: Post, mediaIndex: number = 0) => {
    setSelectedPost(post);
    setSelectedMediaIndex(mediaIndex);
  };

  const getCategoryColor = (tag: string) => {
    const colors: Record<string, string> = {
      'legal': 'bg-gradient-to-r from-blue-500 to-cyan-500',
      'business': 'bg-gradient-to-r from-purple-500 to-pink-500',
      'finance': 'bg-gradient-to-r from-green-500 to-emerald-500',
      'technology': 'bg-gradient-to-r from-pink-500 to-rose-500',
      'education': 'bg-gradient-to-r from-yellow-500 to-orange-500',
    };
    
    const lowerTag = tag.toLowerCase();
    for (const key in colors) {
      if (lowerTag.includes(key)) {
        return colors[key];
      }
    }
    return 'bg-gradient-to-r from-gray-500 to-gray-600';
  };

  const renderMedia = (media: Post['media'], post: Post) => {
    if (!media || media.length === 0) return null;

    if (media.length === 1) {
      const item = media[0];
      return (
        <div 
          className="relative rounded-2xl overflow-hidden group cursor-pointer"
          onClick={() => openMediaModal(post, 0)}
        >
          {item.type === 'image' ? (
            <img
              src={item.url}
              alt={item.caption || "Post media"}
              className="w-full h-64 sm:h-80 object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="relative">
              <video
                src={item.url}
                className="w-full h-64 sm:h-80 object-cover"
                controls={false}
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 group-hover:scale-110 transition-transform">
                  <Play className="h-8 w-8 text-gray-800" />
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Multiple media - create a grid
    const gridClass = media.length === 2 ? 'grid-cols-2' : 'grid-cols-2';
    
    return (
      <div className={`grid ${gridClass} gap-2 rounded-2xl overflow-hidden`}>
        {media.slice(0, 4).map((item, index) => (
          <div 
            key={item.id} 
            className={`relative group cursor-pointer ${media.length === 3 && index === 0 ? 'row-span-2' : 'aspect-square'}`}
            onClick={() => openMediaModal(post, index)}
          >
            {item.type === 'image' ? (
              <img
                src={item.url}
                alt={item.caption || `Media ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="relative w-full h-full">
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                  controls={false}
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Play className="h-6 w-6 text-white" />
                </div>
              </div>
            )}
            {index === 3 && media.length > 4 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                <span className="text-white text-2xl font-bold">+{media.length - 4}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
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

            {/* View Mode */}
            <div className="flex rounded-lg border border-input bg-background/50 backdrop-blur-sm">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
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
          <div className={viewMode === 'grid' ? 'columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6' : 'max-w-2xl mx-auto space-y-6'}>
            {filteredAndSortedPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card 
                  className="break-inside-avoid group hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] border-0 shadow-lg bg-card/60 backdrop-blur-sm overflow-hidden"
                >
                  <CardContent className="p-0">
                    {/* Media Section */}
                    {post.media && post.media.length > 0 && (
                      <div className="relative">
                        {renderMedia(post.media, post)}
                        <div className="absolute top-4 right-4 flex gap-2">
                          {post.tags && post.tags.length > 0 && (
                            <Badge className={`${getCategoryColor(post.tags[0])} text-white border-0 shadow-lg`}>
                              {post.tags[0]}
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            variant="secondary"
                            className="bg-white/90 backdrop-blur-sm hover:bg-white"
                            onClick={() => sharePost(post)}
                          >
                            <Share className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Content Section */}
                    <div className="p-6">
                      {(!post.media || post.media.length === 0) && (
                        <div className="mb-4 flex justify-between items-start">
                          {post.tags && post.tags.length > 0 && (
                            <Badge className={`${getCategoryColor(post.tags[0])} text-white border-0`}>
                              {post.tags[0]}
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sharePost(post)}
                          >
                            <Share className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      
                      {/* Title */}
                      {post.title && (
                        <h2 className="text-xl font-bold text-foreground mb-3 leading-tight">{post.title}</h2>
                      )}
                      
                      {/* Content */}
                      <div className="text-foreground/90 leading-relaxed mb-4 text-sm sm:text-base">
                        {formatContentWithLinks(post.content)}
                      </div>
                      
                      {/* Post Meta */}
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}</span>
                        </div>
                        
                        {post.tags && post.tags.length > 1 && (
                          <div className="flex flex-wrap gap-1">
                            {post.tags.slice(1, 3).map((tag) => (
                              <span key={tag} className="text-xs text-muted-foreground hover:text-foreground cursor-pointer">
                                #{tag}
                              </span>
                            ))}
                            {post.tags.length > 3 && (
                              <span className="text-xs text-muted-foreground">+{post.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
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

      {/* Media Modal */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          {selectedPost && (
            <>
              <DialogHeader className="p-6 pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <DialogTitle className="text-xl font-semibold">
                      {selectedPost.title || selectedPost.tags?.[0] || 'Post Details'}
                    </DialogTitle>
                    <div className="flex items-center text-sm text-muted-foreground mt-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{formatDistanceToNow(new Date(selectedPost.timestamp), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sharePost(selectedPost)}
                  >
                    <Share className="h-4 w-4" />
                  </Button>
                </div>
              </DialogHeader>
              
              <div className="flex-1 overflow-auto">
                {selectedPost.media && selectedPost.media.length > 0 && (
                  <div className="relative bg-black/5 flex items-center justify-center min-h-[300px] max-h-[60vh]">
                    {selectedPost.media[selectedMediaIndex].type === 'image' ? (
                      <img
                        src={selectedPost.media[selectedMediaIndex].url}
                        alt={selectedPost.media[selectedMediaIndex].caption || "Post media"}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <video
                        src={selectedPost.media[selectedMediaIndex].url}
                        controls
                        className="max-w-full max-h-full object-contain"
                      />
                    )}
                    
                    {selectedPost.media.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                        {selectedPost.media.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedMediaIndex(index)}
                            className={`w-3 h-3 rounded-full transition-colors ${
                              index === selectedMediaIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="p-6">
                  <div className="text-foreground leading-relaxed">
                    {formatContentWithLinks(selectedPost.content)}
                  </div>
                  
                  {selectedPost.tags && selectedPost.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedPost.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="bg-background/50">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}