import { NextRequest, NextResponse } from 'next/server';
import {
  getExpertiseAreaById,
  updateExpertiseArea,
  deleteExpertiseArea,
} from '@/lib/services/expertise-areas-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const area = await getExpertiseAreaById(params.id);
    if (!area) {
      return NextResponse.json(
        { error: 'Expertise area not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(area);
  } catch (error) {
    console.error('Error in GET /api/expertise-areas/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expertise area' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updated = await updateExpertiseArea(params.id, body);
    if (!updated) {
      return NextResponse.json(
        { error: 'Expertise area not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error in PUT /api/expertise-areas/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to update expertise area' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteExpertiseArea(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/expertise-areas/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to delete expertise area' },
      { status: 500 }
    );
  }
}
