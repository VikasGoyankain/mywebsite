"use client";

import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { FileText, Video, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlogCardProps {
  post: {
    id: string;
    title?: string;
    description?: string;
    content: string;
    tags: string[];
    created_at?: string | Date;
    timestamp?: Date;
    readTime?: string;
    media?: Array<{ type: string }>;
    linkedProject?: string;
    linkedVideo?: string;
  };
  className?: string;
}

export function BlogCard({ post, className }: BlogCardProps) {
  // Get the date from created_at or timestamp
  const postDate = post.created_at 
    ? new Date(post.created_at) 
    : post.timestamp 
      ? new Date(post.timestamp) 
      : new Date();

  // Generate summary from description or content
  const summary = post.description 
    || post.content.replace(/<[^>]*>/g, '').substring(0, 140) + (post.content.length > 140 ? '…' : '');

  // Check for linked content
  const hasVideo = post.media?.some(m => m.type === 'video') || post.linkedVideo;
  const hasProject = post.linkedProject;

  // Generate slug from id (or use title-based slug if available)
  const slug = post.id;

  return (
    <Link 
      href={`/blog/${slug}`}
      className={cn(
        "group block py-6 border-b border-gray-100 last:border-b-0",
        "transition-colors duration-200 hover:bg-gray-50/50 -mx-4 px-4 rounded-lg",
        className
      )}
    >
      <article className="space-y-2">
        {/* Date - subtle */}
        <time 
          dateTime={postDate.toISOString()}
          className="text-sm text-muted-foreground/70 font-light tracking-wide"
        >
          {format(postDate, 'MMMM d, yyyy')}
        </time>

        {/* Title - primary focus */}
        <h2 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors leading-snug">
          {post.title || 'Untitled'}
          <ArrowUpRight className="inline-block ml-1 w-4 h-4 opacity-0 -translate-y-0.5 translate-x-0 group-hover:opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-1 transition-all duration-200" />
        </h2>

        {/* Summary - one line */}
        <p className="text-muted-foreground text-[0.95rem] leading-relaxed line-clamp-2">
          {summary}
        </p>

        {/* Tags and indicators */}
        <div className="flex items-center gap-2 pt-2 flex-wrap">
          {/* Tags - subtle, small */}
          {post.tags.slice(0, 3).map((tag) => (
            <Badge 
              key={tag} 
              variant="secondary"
              className="text-xs font-normal bg-gray-100 hover:bg-gray-200 text-muted-foreground px-2 py-0.5"
            >
              {tag}
            </Badge>
          ))}
          {post.tags.length > 3 && (
            <span className="text-xs text-muted-foreground/60">
              +{post.tags.length - 3}
            </span>
          )}

          {/* Linked content indicators */}
          {hasProject && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground/60 ml-auto">
              <FileText className="w-3 h-3" />
              <span>Project</span>
            </span>
          )}
          {hasVideo && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground/60 ml-auto">
              <Video className="w-3 h-3" />
              <span>Video</span>
            </span>
          )}

          {/* Reading time */}
          {post.readTime && (
            <span className="text-xs text-muted-foreground/50 ml-auto">
              {post.readTime}
            </span>
          )}
        </div>
      </article>
    </Link>
  );
}
