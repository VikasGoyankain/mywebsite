import { NextRequest, NextResponse } from 'next/server'
import redis from '@/lib/redis'
import { Case } from '@/app/casevault/data/mockCases'

const CASE_PREFIX = 'casevault:case:'

// GET case by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params Promise to get the id
    const resolvedParams = await params
    const id = resolvedParams.id
    
    if (!id) {
      return NextResponse.json(
        { error: 'Case ID is required' },
        { status: 400 }
      )
    }
    
    // Get case from Redis
    const caseData = await redis.get<Case>(`${CASE_PREFIX}${id}`)
    
    if (!caseData) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(caseData)
  } catch (error) {
    console.error('Error fetching case:', error)
    return NextResponse.json(
      { error: 'Failed to fetch case' },
      { status: 500 }
    )
  }
} 