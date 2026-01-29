import { NextResponse } from 'next/server';
import { getPostBySlug } from '@/lib/services/posts-service'; // This function will need to be created

export async function GET(
  request: Request,
  context: { params: { slug: string } }
) {
  try {
    const { slug } = context.params;
    const decodedSlug = decodeURIComponent(slug);

    if (!decodedSlug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const post = await getPostBySlug(decodedSlug);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}
