import { NextRequest, NextResponse } from 'next/server'
import { getSectionAnalytics } from '@/lib/admin-sections'

export async function GET() {
  try {
    const analytics = await getSectionAnalytics()
    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 