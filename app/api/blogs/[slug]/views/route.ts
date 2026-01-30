import { NextRequest, NextResponse } from 'next/server';
import { incrementBlogViews, getBlogBySlug, getBlogById } from '@/lib/services/blogs-service';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// POST /api/blogs/[slug]/views - Increment view count
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    const newViews = await incrementBlogViews(slug);

    return NextResponse.json({ views: newViews });
  } catch (error) {
    console.error('Error incrementing views:', error);
    return NextResponse.json(
      { error: 'Failed to increment views' },
      { status: 500 }
    );
  }
}

// GET /api/blogs/[slug]/views - Get view count
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    return NextResponse.json({ views: blog.views || 0 });
  } catch (error) {
    console.error('Error fetching views:', error);
    return NextResponse.json(
      { error: 'Failed to fetch views' },
      { status: 500 }
    );
  }
}
