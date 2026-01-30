/**
 * BLOG CONTENT SCHEMA — Complete TypeScript Interface
 * 
 * This is the authoritative, future-proof schema for the Blog content model.
 * Following this ensures blogs remain clean, extensible, and migration-safe.
 */

// Status enum for lifecycle control
export type BlogStatus = 'draft' | 'published' | 'archived';

// Visibility enum for access control
export type BlogVisibility = 'public' | 'private' | 'unlisted';

// Audience enum for targeting
export type BlogAudience = 'general' | 'students' | 'collaborators' | 'professionals';

// Blog type enum for categorization
export type BlogType = 'blog' | 'note' | 'essay' | 'project-log' | 'tutorial' | 'research';

/**
 * Core Blog Interface
 * Each blog post follows this structure
 */
export interface Blog {
  // ============================================
  // CORE IDENTITY FIELDS (MANDATORY)
  // ============================================
  
  /** Unique identifier - auto-generated UUID */
  id: string;
  
  /** Human-readable title - clear, descriptive, sentence case */
  title: string;
  
  /** Permanent URL identifier - lowercase, hyphen-separated, NEVER change after publishing */
  slug: string;
  
  /** Publishing date - ISO format YYYY-MM-DD, represents first publication */
  date: string;
  
  /** Content type categorization */
  type: BlogType;
  
  /** Lifecycle status - controls visibility and indexing */
  status: BlogStatus;
  
  // ============================================
  // CLASSIFICATION & DISCOVERY FIELDS
  // ============================================
  
  /** 1-2 sentence summary for previews, SEO, and AI context (max ~160 chars) */
  summary: string;
  
  /** Lightweight categorization - lowercase, kebab-case, max 3-5 tags */
  tags: string[];
  
  // ============================================
  // LINKING FIELDS (RELATIONSHIPS)
  // ============================================
  
  /** Connect blog → project (project slug/ID or null) */
  linked_project: string | null;
  
  /** Connect blog → long-form scholarship (publication slug/ID or null) */
  linked_publication: string | null;
  
  /** YouTube / video URL or null */
  linked_video: string | null;
  
  // ============================================
  // VERSIONING & GOVERNANCE FIELDS
  // ============================================
  
  /** Last edit date - ISO format for transparency */
  last_updated: string | null;
  
  /** Semantic version - v1.0 initial, v1.1 minor, v2.0 substantial rethink */
  version: string;
  
  /** SEO + duplication control */
  canonical: boolean;
  
  // ============================================
  // ACCESS & VISIBILITY FIELDS
  // ============================================
  
  /** Access level control */
  visibility: BlogVisibility;
  
  /** Target audience */
  audience: BlogAudience;
  
  // ============================================
  // CONTENT
  // ============================================
  
  /** Main blog content - Markdown or plain text */
  content: string;
  
  // ============================================
  // SYSTEM FIELDS (AUTO-GENERATED)
  // ============================================
  
  /** Calculated reading time */
  reading_time?: string;
  
  /** View count */
  views?: number;
  
  /** AI embedding reference */
  ai_embedding_id?: string;
  
  /** Creation timestamp */
  created_at: string;
  
  /** Update timestamp */
  updated_at: string;
}

/**
 * Blog creation input - fields required when creating a new blog
 */
export interface CreateBlogInput {
  title: string;
  slug?: string;
  date?: string;
  type?: BlogType;
  status?: BlogStatus;
  summary: string;
  tags?: string[];
  content?: string;
  linked_project?: string | null;
  linked_publication?: string | null;
  linked_video?: string | null;
  version?: string;
  canonical?: boolean;
  visibility?: BlogVisibility;
  audience?: BlogAudience;
}

/**
 * Blog update input - fields that can be updated
 */
export interface UpdateBlogInput {
  title?: string;
  slug?: string;
  status?: BlogStatus;
  summary?: string;
  tags?: string[];
  content?: string;
  linked_project?: string | null;
  linked_publication?: string | null;
  linked_video?: string | null;
  last_updated?: string;
  version?: string;
  canonical?: boolean;
  visibility?: BlogVisibility;
  audience?: BlogAudience;
}

/**
 * Blog list item - minimal data for list views
 */
export interface BlogListItem {
  id: string;
  title: string;
  slug: string;
  date: string;
  status: BlogStatus;
  summary: string;
  tags: string[];
  linked_project: string | null;
  linked_video: string | null;
  reading_time?: string;
}

/**
 * Generate slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Calculate reading time from content
 */
export function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const plainText = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ');
  const wordCount = plainText.split(' ').filter(word => word.length > 0).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}

/**
 * Default values for new blog
 */
export const DEFAULT_BLOG_VALUES: Partial<Blog> = {
  type: 'blog',
  status: 'draft',
  version: 'v1.0',
  canonical: true,
  visibility: 'public',
  audience: 'general',
  linked_project: null,
  linked_publication: null,
  linked_video: null,
  last_updated: null,
};
