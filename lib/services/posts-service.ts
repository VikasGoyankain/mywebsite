import { kv } from '@vercel/kv'
import { Post, Media } from '../types/Post'
import { generateId } from '../utils'
import { deleteFromImageKit } from '../imagekit'
import redis, { zrangeAll, zrevrangeAll } from '../redis'

const POSTS_KEY = 'posts:all'
const POSTS_VIEWS_KEY = 'posts:views'

// Get all posts from the database, sorted by most recent
export async function getAllPosts(): Promise<Post[]> {
  try {
    const posts = await kv.get<Post[]>(POSTS_KEY)
    if (!posts) return []

    // Sort posts by timestamp in descending order (newest first)
    return posts.sort((a, b) => {
      const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0
      const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0
      return dateB - dateA
    })
  } catch (error) {
    console.error('Failed to fetch posts:', error)
    return []
  }
}

// Get a single post by ID
export async function getPostById(id: string): Promise<Post | null> {
  try {
    const posts = await getAllPosts()
    const post = posts.find(p => p.id === id)
    
    if (post) {
      // Increment view count
      await incrementViewCount(id)
      return post
    }
    
    return null
  } catch (error) {
    console.error(`Failed to fetch post ${id}:`, error)
    return null
  }
}

// Get a post by its slug (derived from title)
export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const posts = await getAllPosts()
    const decodedSlug = decodeURIComponent(slug)
    
    const post = posts.find(p => {
      if (!p.title) return false
      const postSlug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      return postSlug === decodedSlug.replace(/\?$/, '') // Remove trailing question mark if present
    })
    
    if (post) {
      // Increment view count if found
      await incrementViewCount(post.id)
      return post
    }
    
    return null
  } catch (error) {
    console.error(`Failed to fetch post by slug ${slug}:`, error)
    return null
  }
}

// Create a new post
export async function createPost(post: Omit<Post, 'id'>): Promise<Post> {
  try {
    const posts = await getAllPosts()
    const newId = generateId()
    
    // Ensure media array is properly formatted
    const processedMedia = post.media?.map(media => ({
      ...media,
      // Ensure each media item has an ID
      id: media.id || generateId()
    })) || []
    
    const newPost: Post = {
      ...post,
      id: newId,
      media: processedMedia
    }
    
    await kv.set(POSTS_KEY, [...posts, newPost])
    return newPost
  } catch (error) {
    console.error('Failed to create post:', error)
    throw new Error('Failed to create post')
  }
}

// Redis-optimized: Create a new post
export async function createPostRedisOptimized(post: Omit<Post, 'id'>): Promise<Post> {
  try {
    const newId = generateId();
    const now = Date.now();
    // Process media and store each as a hash
    const mediaIds: string[] = [];
    if (post.media && post.media.length > 0) {
      for (const media of post.media) {
        const mediaId = media.id || generateId();
        mediaIds.push(mediaId);
        await redis.hmset(`media:${mediaId}`, {
          id: mediaId,
          post_id: newId,
          type: media.type || '',
          url: media.url,
          caption: media.caption || '',
          fileId: media.fileId || '',
        });
        await redis.sadd('media:all', mediaId);
      }
    }
    // Store post as hash
    await redis.hmset(`post:${newId}`, {
      id: newId,
      title: post.title,
      content: post.content,
      author: post.author,
      tags: (post.tags || []).join(','),
      media_ids: mediaIds.join(','),
      created_at: now,
      updated_at: now,
    });
    // Add to sorted set for time-based queries
    await redis.zadd('posts:by-time', { score: now, member: newId });
    // (No tag sets/indexing)
    return { ...post, id: newId, media: post.media } as Post;
  } catch (error) {
    console.error('Failed to create post (Redis optimized):', error);
    throw new Error('Failed to create post');
  }
}

// Update an existing post
export async function updatePost(id: string, data: Partial<Post>): Promise<Post | null> {
  try {
    const posts = await getAllPosts()
    const index = posts.findIndex(p => p.id === id)
    if (index === -1) return null

    // --- Media cleanup logic ---
    // Find removed media (present in old post, not in new data)
    const oldMedia = posts[index].media || [];
    const newMedia = data.media || [];
    const removedMedia = oldMedia.filter(
      oldItem => !newMedia.some(newItem => newItem.url === oldItem.url)
    );
    if (removedMedia.length > 0) {
      for (const media of removedMedia) {
        await deleteFromImageKit(media.url);
      }
    }
    // --- End media cleanup logic ---

    // Process media if it exists in the update data
    if (data.media) {
      data.media = data.media.map(media => ({
        ...media,
        // Ensure each media item has an ID
        id: media.id || generateId()
      }))
    }

    const updatedPost = { ...posts[index], ...data }
    posts[index] = updatedPost
    await kv.set(POSTS_KEY, posts)
    return updatedPost
  } catch (error) {
    console.error(`Failed to update post ${id}:`, error)
    return null
  }
}

// Redis-optimized: Update an existing post
export async function updatePostRedisOptimized(id: string, data: Partial<Post>): Promise<Post | null> {
  try {
    const post = await redis.hgetall(`post:${id}`);
    if (!post || !post.id) return null;
    // Parse old media IDs
    const oldMediaIds = typeof post.media_ids === 'string' ? post.media_ids.split(',') : [];
    // Parse new media
    const newMedia: Media[] = data.media || [];
    const newMediaIds = newMedia.map(m => m.id);
    // Find removed media
    const removedMediaIds = oldMediaIds.filter(mid => !newMediaIds.includes(mid));
    // Remove deleted media from Redis and ImageKit
    for (const mediaId of removedMediaIds) {
      const media = await redis.hgetall(`media:${mediaId}`);
      if (media && typeof media.fileId === 'string' && media.fileId) {
        await deleteFromImageKit(media.fileId);
      }
      await redis.del(`media:${mediaId}`);
      await redis.srem('media:all', mediaId);
    }
    // Add/update new media
    for (const media of newMedia) {
      await redis.hmset(`media:${media.id}`, {
        id: media.id,
        post_id: id,
        type: media.type,
        url: media.url,
        caption: media.caption || '',
        fileId: media.fileId || '',
      });
      await redis.sadd('media:all', media.id);
    }
    // Update post hash
    const now = Date.now();
    await redis.hmset(`post:${id}`, {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.content !== undefined ? { content: data.content } : {}),
      ...(data.author !== undefined ? { author: data.author } : {}),
      tags: (data.tags || (typeof post.tags === 'string' ? post.tags.split(',') : [])).join(','),
      media_ids: newMediaIds.join(','),
      updated_at: now,
    });
    // (No tag sets/indexing)
    // Return updated post
    const updatedPostHash = await redis.hgetall(`post:${id}`);
    if (!updatedPostHash) return null;
    // Rehydrate media
    const updatedMedia: Media[] = [];
    for (const mediaId of newMediaIds) {
      const mediaHash = await redis.hgetall(`media:${mediaId}`);
      if (mediaHash && mediaHash.id) {
        updatedMedia.push({
          id: String(mediaHash.id),
          post_id: mediaHash.post_id ? String(mediaHash.post_id) : undefined,
          type: mediaHash.type === 'image' || mediaHash.type === 'video' ? mediaHash.type : 'image',
          url: String(mediaHash.url),
          caption: mediaHash.caption ? String(mediaHash.caption) : undefined,
          fileId: mediaHash.fileId ? String(mediaHash.fileId) : undefined,
        });
      }
    }
    return {
      id: String(updatedPostHash.id),
      title: String(updatedPostHash.title),
      content: String(updatedPostHash.content),
      author: String(updatedPostHash.author),
      tags: updatedPostHash.tags ? String(updatedPostHash.tags).split(',') : [],
      media: updatedMedia,
      created_at: updatedPostHash.created_at ? String(updatedPostHash.created_at) : undefined,
      updated_at: updatedPostHash.updated_at ? String(updatedPostHash.updated_at) : undefined,
      timestamp: updatedPostHash.created_at && typeof updatedPostHash.created_at === 'string' ? new Date(updatedPostHash.created_at) : new Date(),
    } as Post;
  } catch (error) {
    console.error(`Failed to update post (Redis optimized) ${id}:`, error);
    return null;
  }
}

// Delete a post and its media from DB and ImageKit
export async function deletePost(id: string): Promise<boolean> {
  try {
    const posts = await getAllPosts()
    const post = posts.find(p => p.id === id)
    if (!post) return false

    // Delete all media from ImageKit
    if (post.media && post.media.length > 0) {
      for (const media of post.media) {
        await deleteFromImageKit(media.url)
      }
    }

    const filteredPosts = posts.filter(p => p.id !== id)
    await kv.set(POSTS_KEY, filteredPosts)
    // Also delete view count
    await kv.hdel(POSTS_VIEWS_KEY, id)
    return true
  } catch (error) {
    console.error(`Failed to delete post ${id}:`, error)
    return false
  }
}

// Redis-optimized: Delete a post and its media
export async function deletePostRedisOptimized(id: string): Promise<boolean> {
  try {
    const post = await redis.hgetall(`post:${id}`);
    if (!post || !post.id) return false;
    // Remove from sorted set
    await redis.zrem('posts:by-time', id);
    // (No tag sets/indexing)
    // Remove associated media
    const mediaIds = typeof post.media_ids === 'string' ? post.media_ids.split(',') : [];
    for (const mediaId of mediaIds) {
      const media = await redis.hgetall(`media:${mediaId}`);
      if (media && typeof media.fileId === 'string' && media.fileId) {
        await deleteFromImageKit(media.fileId);
      }
      await redis.del(`media:${mediaId}`);
      await redis.srem('media:all', mediaId);
    }
    // Remove post hash
    await redis.del(`post:${id}`);
    // Remove view count
    await redis.hdel('posts:views', id);
    return true;
  } catch (error) {
    console.error(`Failed to delete post (Redis optimized) ${id}:`, error);
    return false;
  }
}

// Remove unused media from ImageKit (helper for draft/removed media)
export async function cleanupUnusedMedia(mediaList: Media[]): Promise<void> {
  if (!mediaList || mediaList.length === 0) return;
  for (const media of mediaList) {
    await deleteFromImageKit(media.url);
  }
}

// View counting functionality
async function incrementViewCount(postId: string): Promise<number> {
  try {
    return await kv.hincrby(POSTS_VIEWS_KEY, postId, 1)
  } catch (error) {
    console.error(`Failed to increment view count for post ${postId}:`, error)
    return 0
  }
}

async function getViewCount(postId: string): Promise<number> {
  try {
    const count = await kv.hget<number>(POSTS_VIEWS_KEY, postId)
    return count || 0
  } catch (error) {
    console.error(`Failed to get view count for post ${postId}:`, error)
    return 0
  }
}

// Redis-optimized: Remove draft media
export async function removeDraftMedia(mediaId: string): Promise<boolean> {
  try {
    const media = await redis.hgetall(`media:${mediaId}`);
    if (!media || !media.id) return false;
    if (media.fileId && typeof media.fileId === 'string') {
      await deleteFromImageKit(media.fileId);
    }
    await redis.del(`media:${mediaId}`);
    await redis.srem('media:all', mediaId);
    await redis.srem('media:draft', mediaId);
    return true;
  } catch (error) {
    console.error(`Failed to remove draft media ${mediaId}:`, error);
    return false;
  }
}

// Helper: Add media to draft set
export async function addMediaToDraft(mediaId: string) {
  await redis.sadd('media:draft', mediaId);
}

// Helper: Remove media from draft set
export async function removeMediaFromDraft(mediaId: string) {
  await redis.srem('media:draft', mediaId);
}

// Helper: Get all posts (Redis-optimized)
export async function getAllPostsRedisOptimized(): Promise<Post[]> {
  try {
    const postIds = await zrevrangeAll('posts:by-time');
    const posts: Post[] = [];
    for (const id of postIds) {
      const postHash = await redis.hgetall(`post:${id}`);
      if (!postHash || !postHash.id) continue;
      // Get media
      const mediaIds = typeof postHash.media_ids === 'string' ? postHash.media_ids.split(',') : [];
      const media: Media[] = [];
      for (const mediaId of mediaIds) {
        const mediaHash = await redis.hgetall(`media:${mediaId}`);
        if (mediaHash && mediaHash.id) {
          media.push({
            id: String(mediaHash.id),
            post_id: mediaHash.post_id ? String(mediaHash.post_id) : undefined,
            type: mediaHash.type === 'image' || mediaHash.type === 'video' ? mediaHash.type : 'image',
            url: String(mediaHash.url),
            caption: mediaHash.caption ? String(mediaHash.caption) : undefined,
            fileId: mediaHash.fileId ? String(mediaHash.fileId) : undefined,
          });
        }
      }
      posts.push({
        id: String(postHash.id),
        title: String(postHash.title),
        content: String(postHash.content),
        author: String(postHash.author),
        tags: postHash.tags ? String(postHash.tags).split(',') : [],
        media,
        created_at: postHash.created_at ? String(postHash.created_at) : undefined,
        updated_at: postHash.updated_at ? String(postHash.updated_at) : undefined,
        timestamp: postHash.created_at && typeof postHash.created_at === 'string' ? new Date(postHash.created_at) : new Date(),
      } as Post);
    }
    return posts;
  } catch (error) {
    console.error('Failed to fetch posts (Redis optimized):', error);
    return [];
  }
}

// Helper: Get all draft media
export async function getAllDraftMedia(): Promise<Media[]> {
  try {
    const mediaIds = await redis.smembers('media:draft');
    const media: Media[] = [];
    for (const mediaId of mediaIds) {
      const mediaHash = await redis.hgetall(`media:${mediaId}`);
      if (mediaHash && mediaHash.id) {
        media.push({
          id: String(mediaHash.id),
          post_id: mediaHash.post_id ? String(mediaHash.post_id) : undefined,
          type: mediaHash.type === 'image' || mediaHash.type === 'video' ? mediaHash.type : 'image',
          url: String(mediaHash.url),
          caption: mediaHash.caption ? String(mediaHash.caption) : undefined,
          fileId: mediaHash.fileId ? String(mediaHash.fileId) : undefined,
        });
      }
    }
    return media;
  } catch (error) {
    console.error('Failed to fetch draft media:', error);
    return [];
  }
}