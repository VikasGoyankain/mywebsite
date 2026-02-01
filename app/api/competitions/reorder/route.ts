import { NextRequest, NextResponse } from 'next/server';
import { reorderCompetitions } from '@/lib/services/competitions-service';

export async function POST(request: NextRequest) {
  try {
    const { orderedIds } = await request.json();
    await reorderCompetitions(orderedIds);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/competitions/reorder:', error);
    return NextResponse.json(
      { error: 'Failed to reorder competitions' },
      { status: 500 }
    );
  }
}
