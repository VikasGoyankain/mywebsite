import { NextRequest, NextResponse } from 'next/server';
import {
  getAllCertifications,
  createCertification,
} from '@/lib/services/certifications-service';

export async function GET() {
  try {
    const certifications = await getAllCertifications();
    return NextResponse.json(certifications);
  } catch (error) {
    console.error('Error in GET /api/certifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newCertification = await createCertification(body);
    return NextResponse.json(newCertification, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/certifications:', error);
    return NextResponse.json(
      { error: 'Failed to create certification' },
      { status: 500 }
    );
  }
}
