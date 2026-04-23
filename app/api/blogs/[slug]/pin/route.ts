import { NextRequest, NextResponse } from 'next/server';
import {
  getBlogBySlug,
  getBlogById,
  pinBlog,
  unpinBlog,
} from '@/lib/services/blogs-service';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// POST /api/blogs/[slug]/pin - Pin a blog
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const body = await request.json().catch(() => ({}));
    const { deadline, priority } = body as { deadline?: string; priority?: number };

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

    // Validate deadline if provided
    if (deadline) {
      const deadlineDate = new Date(deadline);
      if (isNaN(deadlineDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid deadline date format' },
          { status: 400 }
        );
      }
      if (deadlineDate <= new Date()) {
        return NextResponse.json(
          { error: 'Deadline must be in the future' },
          { status: 400 }
        );
      }
    }

    // Validate priority if provided
    if (priority !== undefined && (typeof priority !== 'number' || priority < 0 || priority > 100)) {
      return NextResponse.json(
        { error: 'Priority must be a number between 0 and 100' },
        { status: 400 }
      );
    }

    const pinnedBlog = await pinBlog(blog.id, deadline || null, priority || 1);

    if (!pinnedBlog) {
      return NextResponse.json(
        { error: 'Failed to pin blog' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Blog pinned successfully',
      blog: pinnedBlog,
    });
  } catch (error) {
    console.error('Error pinning blog:', error);
    return NextResponse.json(
      { error: 'Failed to pin blog' },
      { status: 500 }
    );
  }
}

// DELETE /api/blogs/[slug]/pin - Unpin a blog
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

    const unpinnedBlog = await unpinBlog(blog.id);

    if (!unpinnedBlog) {
      return NextResponse.json(
        { error: 'Failed to unpin blog' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Blog unpinned successfully',
      blog: unpinnedBlog,
    });
  } catch (error) {
    console.error('Error unpinning blog:', error);
    return NextResponse.json(
      { error: 'Failed to unpin blog' },
      { status: 500 }
    );
  }
}
