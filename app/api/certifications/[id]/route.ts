import { NextRequest, NextResponse } from 'next/server';
import {
  getCertificationById,
  updateCertification,
  deleteCertification,
} from '@/lib/services/certifications-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const certification = await getCertificationById(params.id);
    if (!certification) {
      return NextResponse.json(
        { error: 'Certification not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(certification);
  } catch (error) {
    console.error('Error in GET /api/certifications/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certification' },
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
    const updated = await updateCertification(params.id, body);
    if (!updated) {
      return NextResponse.json(
        { error: 'Certification not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error in PUT /api/certifications/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to update certification' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteCertification(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/certifications/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to delete certification' },
      { status: 500 }
    );
  }
}
