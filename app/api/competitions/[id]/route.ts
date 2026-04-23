import { NextRequest, NextResponse } from 'next/server';
import {
  getCompetitionById,
  updateCompetition,
  deleteCompetition,
} from '@/lib/services/competitions-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const competition = await getCompetitionById(params.id);
    if (!competition) {
      return NextResponse.json(
        { error: 'Competition not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(competition);
  } catch (error) {
    console.error('Error in GET /api/competitions/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch competition' },
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
    const updated = await updateCompetition(params.id, body);
    if (!updated) {
      return NextResponse.json(
        { error: 'Competition not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error in PUT /api/competitions/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to update competition' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteCompetition(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/competitions/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to delete competition' },
      { status: 500 }
    );
  }
}
