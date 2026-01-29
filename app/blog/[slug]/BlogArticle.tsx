"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Post } from '@/lib/types/Post'
import { ArrowLeft, Share2, Calendar, Clock, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { Footer } from '@/components/Footer'
import { useDatabaseInit } from '@/hooks/use-database-init'
import { getReadingTime } from '@/lib/utils'

interface BlogArticleProps {
  post: Post & { 
    readTime?: string
    updatedAt?: string | Date
  }
}

// Format date to readable string
const formatDate = (dateValue: string | Date | undefined) => {
  if (!dateValue) return ''
  const date = new Date(dateValue)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

// Format content with proper paragraph handling
const formatContent = (content: string) => {
  return content.split('\n').map((line, index) => {
    if (!line.trim()) return null
    
    // Handle hashtags and URLs
    const hashtagRegex = /#(\w+)/g
    const urlRegex = /(https?:\/\/[^\s]+)/g
    
    let formattedLine = line
    formattedLine = formattedLine.replace(
      hashtagRegex, 
      '<span class="text-primary/80">#$1</span>'
    )
    formattedLine = formattedLine.replace(
      urlRegex, 
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">$1</a>'
    )
    
    return (
      <p 
        key={index} 
        className="mb-6 leading-relaxed" 
        dangerouslySetInnerHTML={{ __html: formattedLine }} 
      />
    )
  }).filter(Boolean)
}

const BlogArticle: React.FC<BlogArticleProps> = ({ post }) => {
  const router = useRouter()
  useDatabaseInit()

  const readTime = post.readTime || getReadingTime(post.content)

  const handleShare = async () => {
    const url = window.location.href
    const title = post?.title || 'Blog entry'
    
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        toast({
          title: "Shared",
          description: "Link shared successfully.",
        })
      } catch {
        // User cancelled or error
      }
    } else {
      navigator.clipboard.writeText(url)
      toast({
        title: "Link copied",
        description: "URL copied to clipboard.",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal Header */}
      <header className="border-b border-border/50">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => router.push('/blog')}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Blog
            </Button>
            
            <Button
              onClick={handleShare}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <Share2 className="w-4 h-4" />
              <span className="sr-only">Share</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <main className="flex-grow">
        <article className="max-w-2xl mx-auto px-6 py-12 md:py-16">
          {/* Article Header */}
          <header className="mb-10">
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight mb-6 leading-snug text-balance">
              {post.title}
            </h1>
            
            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(post.created_at || post.timestamp)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {readTime}
              </span>
            </div>
          </header>

          {/* Featured Image (if exists, subtle presentation) */}
          {post.media && post.media.length > 0 && (
            <figure className="mb-10 -mx-6 md:mx-0">
              <img 
                src={post.media[0].url} 
                alt={post.media[0].caption || post.title || 'Article image'} 
                className="w-full h-auto rounded-none md:rounded-lg"
              />
              {post.media[0].caption && (
                <figcaption className="mt-3 text-sm text-muted-foreground/70 text-center px-6 md:px-0">
                  {post.media[0].caption}
                </figcaption>
              )}
            </figure>
          )}

          {/* Article Body */}
          <div className="prose-custom text-foreground/90 text-base md:text-lg">
            {formatContent(post.content)}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <footer className="mt-12 pt-8 border-t border-border/30">
              <div className="flex flex-wrap items-center gap-2">
                <Tag className="w-4 h-4 text-muted-foreground/60" />
                {post.tags.map((tag, index) => (
                  <Link 
                    key={index} 
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                  >
                    <Badge 
                      variant="secondary" 
                      className="text-xs font-normal bg-secondary/50 hover:bg-secondary text-secondary-foreground/80 cursor-pointer transition-colors"
                    >
                      {tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            </footer>
          )}

          {/* Back Link */}
          <div className="mt-12">
            <Link 
              href="/blog" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to all entries
            </Link>
          </div>
        </article>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default BlogArticle
