import { NextRequest, NextResponse } from 'next/server';
import { reorderReadings } from '@/lib/services/readings-service';

// POST /api/readings/reorder - Reorder readings
export async function POST(request: NextRequest) {
  try {
    const { orderedIds } = await request.json();

    if (!Array.isArray(orderedIds)) {
      return NextResponse.json(
        { error: 'orderedIds must be an array' },
        { status: 400 }
      );
    }

    const success = await reorderReadings(orderedIds);
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to reorder readings' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/readings/reorder:', error);
    return NextResponse.json(
      { error: 'Failed to reorder readings' },
      { status: 500 }
    );
  }
}
