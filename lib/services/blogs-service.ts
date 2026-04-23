import redis from '../redis';
import {
  Blog,
  BlogStatus,
  CreateBlogInput,
  UpdateBlogInput,
  generateSlug,
  calculateReadingTime,
} from '../types/Blog';

// Redis keys
const REDIS_KEYS = {
  BLOGS: 'blogs:all',
  BLOG_INDEX: 'blogs:index',
  BLOG_SLUGS: 'blogs:slugs',
  BLOG_TAGS: 'blogs:tags',
};

// Generate unique ID
function generateId(): string {
  return `blog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get all blogs
export async function getAllBlogs(): Promise<Blog[]> {
  try {
    const blogs = await redis.hgetall(REDIS_KEYS.BLOGS);
    if (!blogs) return [];

    return Object.values(blogs)
      .map((blog) => (typeof blog === 'string' ? JSON.parse(blog) : blog))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }
}

// Check if a pin is still valid (not expired)
function isPinValid(blog: Blog): boolean {
  if (!blog.isPinned) return false;
  if (!blog.pinDeadline) return true; // No deadline = pinned forever
  return new Date(blog.pinDeadline) > new Date();
}

// Get published blogs only (with pinned blogs sorted first)
export async function getPublishedBlogs(): Promise<Blog[]> {
  const blogs = await getAllBlogs();
  const published = blogs.filter(
    (blog) => blog.status === 'published' && blog.visibility === 'public'
  );

  // Separate pinned and non-pinned blogs
  const pinned = published
    .filter((blog) => isPinValid(blog))
    .sort((a, b) => (b.pinPriority || 0) - (a.pinPriority || 0));
  
  const notPinned = published
    .filter((blog) => !isPinValid(blog))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return [...pinned, ...notPinned];
}

// Pin a blog
export async function pinBlog(
  id: string,
  deadline?: string | null,
  priority?: number
): Promise<Blog | null> {
  try {
    const blog = await getBlogById(id);
    if (!blog) return null;

    const updatedBlog: Blog = {
      ...blog,
      isPinned: true,
      pinDeadline: deadline || null,
      pinPriority: priority || 1,
      updated_at: new Date().toISOString(),
    };

    await redis.hset(REDIS_KEYS.BLOGS, {
      [id]: JSON.stringify(updatedBlog),
    });

    return updatedBlog;
  } catch (error) {
    console.error('Error pinning blog:', error);
    return null;
  }
}

// Unpin a blog
export async function unpinBlog(id: string): Promise<Blog | null> {
  try {
    const blog = await getBlogById(id);
    if (!blog) return null;

    const updatedBlog: Blog = {
      ...blog,
      isPinned: false,
      pinDeadline: null,
      pinPriority: undefined,
      updated_at: new Date().toISOString(),
    };

    await redis.hset(REDIS_KEYS.BLOGS, {
      [id]: JSON.stringify(updatedBlog),
    });

    return updatedBlog;
  } catch (error) {
    console.error('Error unpinning blog:', error);
    return null;
  }
}

// Get single blog by ID
export async function getBlogById(id: string): Promise<Blog | null> {
  try {
    const blog = await redis.hget(REDIS_KEYS.BLOGS, id);
    if (!blog) return null;

    const parsed = typeof blog === 'string' ? JSON.parse(blog) : blog;
    return parsed as Blog;
  } catch (error) {
    console.error('Error fetching blog by ID:', error);
    return null;
  }
}

// Get single blog by slug
export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  try {
    // First try direct slug lookup
    const blogId = await redis.hget(REDIS_KEYS.BLOG_SLUGS, slug);
    if (blogId) {
      return getBlogById(blogId as string);
    }

    // Fallback: search through all blogs
    const blogs = await getAllBlogs();
    return blogs.find((blog) => blog.slug === slug) || null;
  } catch (error) {
    console.error('Error fetching blog by slug:', error);
    return null;
  }
}

// Create new blog
export async function createBlog(input: CreateBlogInput): Promise<Blog> {
  try {
    const id = generateId();
    const now = new Date().toISOString();
    const slug = input.slug || generateSlug(input.title);

    // Check for duplicate slug
    const existingBlog = await getBlogBySlug(slug);
    if (existingBlog) {
      throw new Error(`Blog with slug "${slug}" already exists`);
    }

    const blog: Blog = {
      id,
      title: input.title,
      slug,
      date: input.date || now,
      type: input.type || 'blog',
      status: input.status || 'draft',
      summary: input.summary,
      tags: input.tags || [],
      linked_project: input.linked_project || null,
      linked_publication: input.linked_publication || null,
      linked_video: input.linked_video || null,
      content: input.content || '',
      version: input.version || 'v1.0',
      canonical: input.canonical !== undefined ? input.canonical : true,
      visibility: input.visibility || 'public',
      audience: input.audience || 'general',
      last_updated: null,
      created_at: now,
      updated_at: now,
      reading_time: calculateReadingTime(input.content || ''),
    };

    // Save blog
    await redis.hset(REDIS_KEYS.BLOGS, {
      [id]: JSON.stringify(blog),
    });

    // Save slug index
    await redis.hset(REDIS_KEYS.BLOG_SLUGS, {
      [slug]: id,
    });

    // Update tag index
    for (const tag of blog.tags) {
      await redis.sadd(`${REDIS_KEYS.BLOG_TAGS}:${tag.toLowerCase()}`, id);
    }

    return blog;
  } catch (error) {
    console.error('Error creating blog:', error);
    throw error;
  }
}

// Update blog
export async function updateBlog(
  id: string,
  updates: UpdateBlogInput
): Promise<Blog | null> {
  try {
    const existingBlog = await getBlogById(id);
    if (!existingBlog) return null;

    const now = new Date().toISOString();
    const oldSlug = existingBlog.slug;

    // If title changed, update slug
    let newSlug = existingBlog.slug;
    if (updates.title && updates.title !== existingBlog.title) {
      newSlug = updates.slug || generateSlug(updates.title);

      // Check for duplicate slug (excluding current blog)
      const slugBlog = await getBlogBySlug(newSlug);
      if (slugBlog && slugBlog.id !== id) {
        throw new Error(`Blog with slug "${newSlug}" already exists`);
      }
    } else if (updates.slug && updates.slug !== existingBlog.slug) {
      newSlug = updates.slug;
      const slugBlog = await getBlogBySlug(newSlug);
      if (slugBlog && slugBlog.id !== id) {
        throw new Error(`Blog with slug "${newSlug}" already exists`);
      }
    }

    const updatedBlog: Blog = {
      ...existingBlog,
      ...updates,
      slug: newSlug,
      updated_at: now,
      last_updated: now,
      reading_time: updates.content
        ? calculateReadingTime(updates.content)
        : existingBlog.reading_time,
    };

    // Save updated blog
    await redis.hset(REDIS_KEYS.BLOGS, {
      [id]: JSON.stringify(updatedBlog),
    });

    // Update slug index if changed
    if (oldSlug !== newSlug) {
      await redis.hdel(REDIS_KEYS.BLOG_SLUGS, oldSlug);
      await redis.hset(REDIS_KEYS.BLOG_SLUGS, {
        [newSlug]: id,
      });
    }

    // Update tag index if tags changed
    if (updates.tags) {
      // Remove old tags
      for (const tag of existingBlog.tags) {
        await redis.srem(`${REDIS_KEYS.BLOG_TAGS}:${tag.toLowerCase()}`, id);
      }
      // Add new tags
      for (const tag of updatedBlog.tags) {
        await redis.sadd(`${REDIS_KEYS.BLOG_TAGS}:${tag.toLowerCase()}`, id);
      }
    }

    return updatedBlog;
  } catch (error) {
    console.error('Error updating blog:', error);
    throw error;
  }
}

// Delete blog
export async function deleteBlog(id: string): Promise<boolean> {
  try {
    const blog = await getBlogById(id);
    if (!blog) return false;

    // Delete blog
    await redis.hdel(REDIS_KEYS.BLOGS, id);

    // Delete slug index
    await redis.hdel(REDIS_KEYS.BLOG_SLUGS, blog.slug);

    // Remove from tag index
    for (const tag of blog.tags) {
      await redis.srem(`${REDIS_KEYS.BLOG_TAGS}:${tag.toLowerCase()}`, id);
    }

    return true;
  } catch (error) {
    console.error('Error deleting blog:', error);
    return false;
  }
}

// Change blog status
export async function changeBlogStatus(
  id: string,
  status: BlogStatus
): Promise<Blog | null> {
  return updateBlog(id, { status });
}

// Get blogs by status
export async function getBlogsByStatus(status: BlogStatus): Promise<Blog[]> {
  const blogs = await getAllBlogs();
  return blogs.filter((blog) => blog.status === status);
}

// Get blogs by tag
export async function getBlogsByTag(tag: string): Promise<Blog[]> {
  try {
    const blogIds = await redis.smembers(
      `${REDIS_KEYS.BLOG_TAGS}:${tag.toLowerCase()}`
    );
    if (!blogIds || blogIds.length === 0) return [];

    const blogs = await Promise.all(
      blogIds.map((id) => getBlogById(id as string))
    );
    return blogs.filter((blog): blog is Blog => blog !== null);
  } catch (error) {
    console.error('Error fetching blogs by tag:', error);
    return [];
  }
}

// Get all unique tags
export async function getAllTags(): Promise<string[]> {
  const blogs = await getAllBlogs();
  const tagSet = new Set<string>();
  blogs.forEach((blog) => blog.tags.forEach((tag) => tagSet.add(tag)));
  return Array.from(tagSet).sort();
}

// Search blogs
export async function searchBlogs(query: string): Promise<Blog[]> {
  const blogs = await getAllBlogs();
  const lowercaseQuery = query.toLowerCase();

  return blogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(lowercaseQuery) ||
      blog.summary.toLowerCase().includes(lowercaseQuery) ||
      blog.content?.toLowerCase().includes(lowercaseQuery) ||
      blog.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
  );
}

// Get blog statistics
export async function getBlogStats(): Promise<{
  total: number;
  published: number;
  drafts: number;
  archived: number;
  totalTags: number;
  totalViews: number;
}> {
  const blogs = await getAllBlogs();
  const tags = await getAllTags();

  return {
    total: blogs.length,
    published: blogs.filter((b) => b.status === 'published').length,
    drafts: blogs.filter((b) => b.status === 'draft').length,
    archived: blogs.filter((b) => b.status === 'archived').length,
    totalTags: tags.length,
    totalViews: blogs.reduce((sum, b) => sum + (b.views || 0), 0),
  };
}

// Increment view count for a blog
export async function incrementBlogViews(slug: string): Promise<number> {
  try {
    // Find blog by slug or ID
    let blog = await getBlogBySlug(slug);
    if (!blog) {
      blog = await getBlogById(slug);
    }

    if (!blog) {
      return 0;
    }

    // Increment views
    const newViews = (blog.views || 0) + 1;
    
    const updatedBlog: Blog = {
      ...blog,
      views: newViews,
    };

    // Save updated blog
    await redis.hset(REDIS_KEYS.BLOGS, {
      [blog.id]: JSON.stringify(updatedBlog),
    });

    return newViews;
  } catch (error) {
    console.error('Error incrementing blog views:', error);
    return 0;
  }
}
