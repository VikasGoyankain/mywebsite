import { NextRequest, NextResponse } from 'next/server'
import { recordSectionUsage } from '@/lib/admin-sections'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'Section ID is required' }, { status: 400 })
    }

    await recordSectionUsage(id)
    return NextResponse.json({ message: 'Usage recorded' })
  } catch (error) {
    console.error('Error recording section usage:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}