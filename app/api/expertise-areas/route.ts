import { NextRequest, NextResponse } from 'next/server';
import {
  getAllExpertiseAreas,
  createExpertiseArea,
} from '@/lib/services/expertise-areas-service';

export async function GET() {
  try {
    const areas = await getAllExpertiseAreas();
    return NextResponse.json(areas);
  } catch (error) {
    console.error('Error in GET /api/expertise-areas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expertise areas' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newArea = await createExpertiseArea(body);
    return NextResponse.json(newArea, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/expertise-areas:', error);
    return NextResponse.json(
      { error: 'Failed to create expertise area' },
      { status: 500 }
    );
  }
}
