import { NextRequest, NextResponse } from 'next/server';
import { reorderExpertiseAreas } from '@/lib/services/expertise-areas-service';

export async function POST(request: NextRequest) {
  try {
    const { orderedIds } = await request.json();
    await reorderExpertiseAreas(orderedIds);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/expertise-areas/reorder:', error);
    return NextResponse.json(
      { error: 'Failed to reorder expertise areas' },
      { status: 500 }
    );
  }
}
