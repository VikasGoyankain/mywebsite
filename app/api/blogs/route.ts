import { NextRequest, NextResponse } from 'next/server';
import {
  getAllBlogs,
  getPublishedBlogs,
  createBlog,
  getBlogStats,
} from '@/lib/services/blogs-service';
import { CreateBlogInput } from '@/lib/types/Blog';

// GET /api/blogs - Get all blogs (public only for non-admin, all for admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get('all') === 'true';
    const status = searchParams.get('status');

    let blogs;
    if (includeAll) {
      // Admin request - return all blogs
      blogs = await getAllBlogs();
      
      // Filter by status if specified
      if (status) {
        blogs = blogs.filter((b) => b.status === status);
      }
    } else {
      // Public request - return only published blogs
      blogs = await getPublishedBlogs();
    }

    return NextResponse.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}

// POST /api/blogs - Create a new blog
export async function POST(request: NextRequest) {
  try {
    const body: CreateBlogInput = await request.json();

    // Validate required fields
    if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!body.summary || typeof body.summary !== 'string' || !body.summary.trim()) {
      return NextResponse.json(
        { error: 'Summary is required' },
        { status: 400 }
      );
    }

    const blog = await createBlog({
      title: body.title.trim(),
      slug: body.slug,
      date: body.date,
      type: body.type,
      status: body.status || 'draft',
      summary: body.summary.trim(),
      tags: body.tags || [],
      linked_project: body.linked_project,
      linked_publication: body.linked_publication,
      linked_video: body.linked_video,
      content: body.content,
      version: body.version,
      canonical: body.canonical,
      visibility: body.visibility,
      audience: body.audience,
    });

    return NextResponse.json(blog, { status: 201 });
  } catch (error: any) {
    console.error('Error creating blog:', error);
    
    if (error.message?.includes('already exists')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create blog' },
      { status: 500 }
    );
  }
}
