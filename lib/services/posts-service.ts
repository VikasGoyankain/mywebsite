import { kv } from '@vercel/kv'
import { Post, Comment } from '../types/Post'

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
      // Get latest view count
      const views = await getViewCount(id)
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
    
    const newPost: Post = {
      ...post,
      id: newId,
      comments: post.comments || []
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

// Add a comment to a post
export async function addComment(postId: string, comment: Omit<Comment, 'id'>): Promise<Comment | null> {
  try {
    const posts = await getAllPosts()
    const postIndex = posts.findIndex(p => p.id === postId)
    
    if (postIndex === -1) return null
    
    const newComment: Comment = {
      ...comment,
      id: generateId()
    }
    
    posts[postIndex].comments.push(newComment)
    await kv.set(POSTS_KEY, posts)
    
    return newComment
  } catch (error) {
    console.error(`Failed to add comment to post ${postId}:`, error)
    return null
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

// Helper function to generate a unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}