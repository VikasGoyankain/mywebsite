import { kv } from '@vercel/kv'
import { Post } from '../types/Post'
import { generateId } from '../utils'

const POSTS_KEY = 'posts:all'
const POSTS_VIEWS_KEY = 'posts:views'

// Get all posts from the database
export async function getAllPosts(): Promise<Post[]> {
  try {
    const posts = await kv.get<Post[]>(POSTS_KEY)
    return posts || []
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

// Update an existing post
export async function updatePost(id: string, data: Partial<Post>): Promise<Post | null> {
  try {
    const posts = await getAllPosts()
    const index = posts.findIndex(p => p.id === id)
    
    if (index === -1) return null
    
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

// Delete a post
export async function deletePost(id: string): Promise<boolean> {
  try {
    const posts = await getAllPosts()
    const filteredPosts = posts.filter(p => p.id !== id)
    
    if (filteredPosts.length === posts.length) {
      return false
    }
    
    await kv.set(POSTS_KEY, filteredPosts)
    // Also delete view count
    await kv.hdel(POSTS_VIEWS_KEY, id)
    return true
  } catch (error) {
    console.error(`Failed to delete post ${id}:`, error)
    return false
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