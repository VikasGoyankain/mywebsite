import { NextRequest, NextResponse } from 'next/server';
import {
  getAllReadings,
  getReadingsByType,
  createReading,
  getReadingsCount,
} from '@/lib/services/readings-service';
import { CreateReadingInput, ReadingType } from '@/types/expertise';

// GET /api/readings - List all readings or filter by type
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as ReadingType | null;

    let readings;
    if (type && (type === 'book' || type === 'course')) {
      readings = await getReadingsByType(type);
    } else {
      readings = await getAllReadings();
    }

    // Check if count only is requested
    if (searchParams.get('count') === 'true') {
      const count = await getReadingsCount();
      return NextResponse.json(count);
    }

    return NextResponse.json(readings);
  } catch (error) {
    console.error('Error in GET /api/readings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch readings' },
      { status: 500 }
    );
  }
}

// POST /api/readings - Create new reading
export async function POST(request: NextRequest) {
  try {
    const body: CreateReadingInput = await request.json();

    // Validation
    if (!body.title?.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!body.author?.trim()) {
      return NextResponse.json(
        { error: 'Author is required' },
        { status: 400 }
      );
    }

    if (!body.type || !['book', 'course'].includes(body.type)) {
      return NextResponse.json(
        { error: 'Type must be either "book" or "course"' },
        { status: 400 }
      );
    }

    if (!body.impactOnThinking?.trim()) {
      return NextResponse.json(
        { error: 'Impact on thinking is required' },
        { status: 400 }
      );
    }

    const reading = await createReading(body);
    return NextResponse.json(reading, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/readings:', error);
    const message = error instanceof Error ? error.message : 'Failed to create reading';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
