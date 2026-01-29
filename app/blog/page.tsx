"use client"

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { ArrowLeft, Calendar, ArrowUpRight, Folder, Video, X } from 'lucide-react'
import { Post } from '@/lib/types/Post'
import { Footer } from '@/components/Footer'
import { useDatabaseInit } from '@/hooks/use-database-init'

// Format date to a readable string
const formatDate = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Extract year from date
const getYear = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.getFullYear()
}

// Blog Entry Component - minimal, calm design
const BlogEntry: React.FC<{ post: Post }> = ({ post }) => {
  const slug = encodeURIComponent(post.title?.toLowerCase().replace(/\s+/g, '-') || post.id)
  
  // Check if post has video link indicator (simple heuristic)
  const hasVideoLink = post.content?.toLowerCase().includes('youtube') || 
                       post.content?.toLowerCase().includes('video') ||
                       post.tags?.some(tag => tag.toLowerCase().includes('video'))
  
  // Check if linked to a project (simple heuristic based on tags)
  const hasProjectLink = post.tags?.some(tag => 
    tag.toLowerCase().includes('project') || 
    tag.toLowerCase().includes('research')
  )

  return (
    <Link href={`/blog/${slug}`} className="group block">
      <article className="py-6 border-b border-border/50 transition-colors hover:bg-muted/30">
        <div className="flex flex-col gap-3">
          {/* Title */}
          <h2 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors leading-snug text-balance">
            {post.title || 'Untitled'}
          </h2>
          
          {/* Summary / Description */}
          {post.description && (
            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
              {post.description}
            </p>
          )}
          
          {/* Meta row: Date, Tags, Indicators */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {/* Date */}
            <span className="text-muted-foreground/70 tabular-nums">
              {formatDate(post.timestamp || post.created_at || new Date())}
            </span>
            
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {post.tags.slice(0, 3).map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs font-normal bg-secondary/50 hover:bg-secondary/70 text-secondary-foreground/80"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Indicators */}
            <div className="flex items-center gap-2 ml-auto">
              {hasProjectLink && (
                <span className="text-muted-foreground/60" title="Linked to a project">
                  <Folder className="w-3.5 h-3.5" />
                </span>
              )}
              {hasVideoLink && (
                <span className="text-muted-foreground/60" title="Video summary">
                  <Video className="w-3.5 h-3.5" />
                </span>
              )}
              <ArrowUpRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}

export default function BlogPage() {
  useDatabaseInit()
  const router = useRouter()
  
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Filters
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const [selectedYear, setSelectedYear] = useState<string>('all')

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch('/api/posts')
        if (!response.ok) {
          throw new Error('Failed to fetch posts')
        }
        const data = await response.json()
        setPosts(data)
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load posts'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  // Extract unique tags and years for filters
  const availableTags = useMemo(() => {
    const tags = new Set<string>()
    posts.forEach(post => {
      post.tags?.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [posts])

  const availableYears = useMemo(() => {
    const years = new Set<number>()
    posts.forEach(post => {
      const date = post.timestamp || post.created_at
      if (date) {
        years.add(getYear(date))
      }
    })
    return Array.from(years).sort((a, b) => b - a)
  }, [posts])

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // Tag filter
      if (selectedTag !== 'all' && !post.tags?.includes(selectedTag)) {
        return false
      }
      // Year filter
      if (selectedYear !== 'all') {
        const postYear = getYear(post.timestamp || post.created_at || new Date())
        if (postYear !== parseInt(selectedYear)) {
          return false
        }
      }
      return true
    }).sort((a, b) => {
      // Sort by date, newest first
      const dateA = new Date(a.timestamp || a.created_at || 0)
      const dateB = new Date(b.timestamp || b.created_at || 0)
      return dateB.getTime() - dateA.getTime()
    })
  }, [posts, selectedTag, selectedYear])

  const hasActiveFilters = selectedTag !== 'all' || selectedYear !== 'all'

  const clearFilters = () => {
    setSelectedTag('all')
    setSelectedYear('all')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal Header */}
      <header className="border-b border-border/50">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => router.push('/')}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-2xl mx-auto px-6 py-12 md:py-16">
          {/* Page Header */}
          <header className="mb-12">
            <h1 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-4">
              Blog
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-lg">
              Short reflections, updates, and notes supporting ongoing work.
            </p>
          </header>

          {/* Filters - Lightweight */}
          {(availableTags.length > 0 || availableYears.length > 0) && (
            <div className="flex flex-wrap items-center gap-3 mb-10 pb-6 border-b border-border/30">
              {/* Tag Filter */}
              {availableTags.length > 0 && (
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger className="w-auto min-w-[120px] h-9 text-sm bg-transparent border-border/50">
                    <SelectValue placeholder="All topics" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All topics</SelectItem>
                    {availableTags.map(tag => (
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Year Filter */}
              {availableYears.length > 0 && (
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-auto min-w-[100px] h-9 text-sm bg-transparent border-border/50">
                    <SelectValue placeholder="All years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All years</SelectItem>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="text-muted-foreground hover:text-foreground h-9"
                >
                  <X className="w-3.5 h-3.5 mr-1.5" />
                  Clear
                </Button>
              )}

              {/* Results count */}
              {hasActiveFilters && (
                <span className="text-sm text-muted-foreground/70 ml-auto">
                  {filteredPosts.length} {filteredPosts.length === 1 ? 'entry' : 'entries'}
                </span>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="py-16 text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-muted-foreground/30 border-t-muted-foreground"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.reload()}
              >
                Try again
              </Button>
            </div>
          )}

          {/* Blog List */}
          {!loading && !error && (
            <div className="divide-y divide-border/0">
              {filteredPosts.map((post) => (
                <BlogEntry key={post.id} post={post} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredPosts.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters 
                  ? 'No entries match your filters.' 
                  : 'No entries yet.'}
              </p>
              {hasActiveFilters && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
