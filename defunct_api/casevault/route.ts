import { NextRequest, NextResponse } from 'next/server'
import redis from '@/lib/redis'
import { Case } from '@/app/casevault/data/mockCases'
import { v4 as uuidv4 } from 'uuid'

const CASE_PREFIX = 'casevault:case:'

// GET all cases
export async function GET() {
  try {
    // Get all keys with the case prefix
    const keys = await redis.keys(`${CASE_PREFIX}*`)
    
    if (keys.length === 0) {
      return NextResponse.json([])
    }
    
    // Get all cases
    const cases = await Promise.all(
      keys.map(async (key) => {
        const caseData = await redis.get<Case>(key)
        return caseData
      })
    )
    
    // Filter out any null values and sort by date (newest first)
    const validCases = cases.filter(Boolean).sort((a, b) => 
      new Date(b!.judgmentDate).getTime() - new Date(a!.judgmentDate).getTime()
    )
    
    return NextResponse.json(validCases)
  } catch (error) {
    console.error('Error fetching cases:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cases' },
      { status: 500 }
    )
  }
}

// POST new case
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.title || !body.citation || !body.legalArea) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Generate a new ID if not provided
    const id = body.id || uuidv4()
    const newCase: Case = {
      ...body,
      id,
      // Set default values for any missing fields
      tags: body.tags || [],
      legalPrinciples: body.legalPrinciples || [],
      relatedCases: body.relatedCases || [],
      hasDocument: body.hasDocument || false,
      isOwnCase: body.isOwnCase || false,
      year: body.year || new Date().getFullYear()
    }
    
    // Save to Redis
    await redis.set(`${CASE_PREFIX}${id}`, newCase)
    
    return NextResponse.json(newCase, { status: 201 })
  } catch (error) {
    console.error('Error creating case:', error)
    return NextResponse.json(
      { error: 'Failed to create case' },
      { status: 500 }
    )
  }
}

// PUT/UPDATE case
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Case ID is required' },
        { status: 400 }
      )
    }
    
    // Check if case exists
    const existingCase = await redis.get<Case>(`${CASE_PREFIX}${id}`)
    if (!existingCase) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      )
    }
    
    const body = await request.json()
    
    // Update case
    const updatedCase: Case = {
      ...existingCase,
      ...body,
      id // Ensure ID doesn't change
    }
    
    await redis.set(`${CASE_PREFIX}${id}`, updatedCase)
    
    return NextResponse.json(updatedCase)
  } catch (error) {
    console.error('Error updating case:', error)
    return NextResponse.json(
      { error: 'Failed to update case' },
      { status: 500 }
    )
  }
}

// DELETE case
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Case ID is required' },
        { status: 400 }
      )
    }
    
    // Check if case exists
    const existingCase = await redis.get<Case>(`${CASE_PREFIX}${id}`)
    if (!existingCase) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      )
    }
    
    // Delete case
    await redis.del(`${CASE_PREFIX}${id}`)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting case:', error)
    return NextResponse.json(
      { error: 'Failed to delete case' },
      { status: 500 }
    )
  }
} 