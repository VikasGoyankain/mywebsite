import { NextResponse } from 'next/server'
import { addComment } from '@/lib/services/posts-service'

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')
    
    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      )
    }
    
    const commentData = await request.json()
    
    // Validate required fields
    if (!commentData.content || !commentData.author) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Convert timestamp string to Date if provided
    if (commentData.timestamp && typeof commentData.timestamp === 'string') {
      commentData.timestamp = new Date(commentData.timestamp)
    } else if (!commentData.timestamp) {
      commentData.timestamp = new Date()
    }
    
    const comment = await addComment(postId, commentData)
    
    if (!comment) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Error adding comment:', error)
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    )
  }
}