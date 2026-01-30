import { NextRequest, NextResponse } from 'next/server';
import {
  getBlogBySlug,
  getBlogById,
  updateBlog,
  deleteBlog,
  changeBlogStatus,
} from '@/lib/services/blogs-service';
import { UpdateBlogInput, BlogStatus } from '@/lib/types/Blog';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET /api/blogs/[slug] - Get a single blog by slug or ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    
    // Try by slug first, then by ID
    let blog = await getBlogBySlug(slug);
    if (!blog) {
      blog = await getBlogById(slug);
    }

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog' },
      { status: 500 }
    );
  }
}

// PUT /api/blogs/[slug] - Update a blog
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const body: UpdateBlogInput = await request.json();

    // Find blog by slug or ID
    let blog = await getBlogBySlug(slug);
    if (!blog) {
      blog = await getBlogById(slug);
    }

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    const updatedBlog = await updateBlog(blog.id, body);

    if (!updatedBlog) {
      return NextResponse.json(
        { error: 'Failed to update blog' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedBlog);
  } catch (error: any) {
    console.error('Error updating blog:', error);
    
    if (error.message?.includes('already exists')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update blog' },
      { status: 500 }
    );
  }
}

// PATCH /api/blogs/[slug] - Update blog status
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { status } = body as { status: BlogStatus };

    if (!status || !['draft', 'published', 'archived'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required (draft, published, archived)' },
        { status: 400 }
      );
    }

    // Find blog by slug or ID
    let blog = await getBlogBySlug(slug);
    if (!blog) {
      blog = await getBlogById(slug);
    }

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    const updatedBlog = await changeBlogStatus(blog.id, status);

    if (!updatedBlog) {
      return NextResponse.json(
        { error: 'Failed to update blog status' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedBlog);
  } catch (error) {
    console.error('Error updating blog status:', error);
    return NextResponse.json(
      { error: 'Failed to update blog status' },
      { status: 500 }
    );
  }
}

// DELETE /api/blogs/[slug] - Delete a blog
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    // Find blog by slug or ID
    let blog = await getBlogBySlug(slug);
    if (!blog) {
      blog = await getBlogById(slug);
    }

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    const deleted = await deleteBlog(blog.id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete blog' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Blog deleted' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog' },
      { status: 500 }
    );
  }
}
