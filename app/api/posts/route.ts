import { NextResponse } from 'next/server'
import { 
  getAllPosts, 
  getPostById,
  createPost,
  updatePost,
  deletePost,
  addComment
} from '@/lib/services/posts-service'
import { Post } from '@/lib/types/Post'

// GET - Fetch all posts or a specific post by ID
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const id = searchParams.get('id')
    
    // Get a specific post by ID
    if (id) {
      const post = await getPostById(id)
      
      if (!post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 })
      }
      
      return NextResponse.json(post)
    }
    
    // Get all posts
    const posts = await getAllPosts()
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error handling posts request:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' }, 
      { status: 500 }
    )
  }
}

// POST - Create a new post
export async function POST(request: Request) {
  try {
    const postData = await request.json()
    
    // Validate required fields
    if (!postData.content || !postData.type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Set default values if not provided
    const newPost: Omit<Post, 'id'> = {
      ...postData,
      author: postData.author || 'You',
      timestamp: postData.timestamp ? new Date(postData.timestamp) : new Date(),
      tags: postData.tags || [],
      comments: postData.comments || []
    }
    
    const createdPost = await createPost(newPost)
    return NextResponse.json(createdPost, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}

// PUT - Update an existing post
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      )
    }
    
    const postData = await request.json()
    
    // Convert timestamp string to Date if provided
    if (postData.timestamp && typeof postData.timestamp === 'string') {
      postData.timestamp = new Date(postData.timestamp)
    }
    
    const updatedPost = await updatePost(id, postData)
    
    if (!updatedPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a post
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      )
    }
    
    const success = await deletePost(id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  }
}