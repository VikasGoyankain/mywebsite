import { NextRequest, NextResponse } from 'next/server';
import {
  getReadingBySlug,
  getReadingById,
  updateReading,
  deleteReading,
} from '@/lib/services/readings-service';
import { UpdateReadingInput } from '@/types/expertise';

type RouteParams = {
  params: Promise<{ slug: string }>;
};

// GET /api/readings/[slug] - Get single reading by slug or ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    // Try by slug first, then by ID
    let reading = await getReadingBySlug(slug);
    if (!reading) {
      reading = await getReadingById(slug);
    }

    if (!reading) {
      return NextResponse.json(
        { error: 'Reading not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(reading);
  } catch (error) {
    console.error('Error in GET /api/readings/[slug]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reading' },
      { status: 500 }
    );
  }
}

// PUT /api/readings/[slug] - Update reading
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const body: UpdateReadingInput = await request.json();

    // Find the reading by slug or ID
    let reading = await getReadingBySlug(slug);
    if (!reading) {
      reading = await getReadingById(slug);
    }

    if (!reading) {
      return NextResponse.json(
        { error: 'Reading not found' },
        { status: 404 }
      );
    }

    // Validate type if provided
    if (body.type && !['book', 'course'].includes(body.type)) {
      return NextResponse.json(
        { error: 'Type must be either "book" or "course"' },
        { status: 400 }
      );
    }

    const updatedReading = await updateReading(reading.id, body);
    return NextResponse.json(updatedReading);
  } catch (error) {
    console.error('Error in PUT /api/readings/[slug]:', error);
    const message = error instanceof Error ? error.message : 'Failed to update reading';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/readings/[slug] - Delete reading
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    // Find the reading by slug or ID
    let reading = await getReadingBySlug(slug);
    if (!reading) {
      reading = await getReadingById(slug);
    }

    if (!reading) {
      return NextResponse.json(
        { error: 'Reading not found' },
        { status: 404 }
      );
    }

    const deleted = await deleteReading(reading.id);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete reading' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Reading deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/readings/[slug]:', error);
    return NextResponse.json(
      { error: 'Failed to delete reading' },
      { status: 500 }
    );
  }
}
