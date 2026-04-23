import { NextRequest, NextResponse } from 'next/server';
import { reorderCertifications } from '@/lib/services/certifications-service';

export async function POST(request: NextRequest) {
  try {
    const { orderedIds } = await request.json();
    await reorderCertifications(orderedIds);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/certifications/reorder:', error);
    return NextResponse.json(
      { error: 'Failed to reorder certifications' },
      { status: 500 }
    );
  }
}
