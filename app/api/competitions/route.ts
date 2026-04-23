import { NextRequest, NextResponse } from 'next/server';
import {
  getAllCompetitions,
  createCompetition,
} from '@/lib/services/competitions-service';

export async function GET() {
  try {
    const competitions = await getAllCompetitions();
    return NextResponse.json(competitions);
  } catch (error) {
    console.error('Error in GET /api/competitions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch competitions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newCompetition = await createCompetition(body);
    return NextResponse.json(newCompetition, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/competitions:', error);
    return NextResponse.json(
      { error: 'Failed to create competition' },
      { status: 500 }
    );
  }
}
