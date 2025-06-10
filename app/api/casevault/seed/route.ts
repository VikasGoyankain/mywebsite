import { NextRequest, NextResponse } from 'next/server'
import redis from '@/lib/redis'
import { mockCases } from '@/app/casevault/data/mockCases'

const CASE_PREFIX = 'casevault:case:'

// POST to seed the database with mock cases
export async function POST(request: NextRequest) {
  try {
    // Check if there's a secret key in the request for security
    const { searchParams } = new URL(request.url)
    const secretKey = searchParams.get('key')
    
    // In production, you would use a more secure method
    if (secretKey !== process.env.SEED_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Check if we should force overwrite existing data
    const forceOverwrite = searchParams.get('force') === 'true'
    
    // Check if there are existing cases
    const existingKeys = await redis.keys(`${CASE_PREFIX}*`)
    
    if (existingKeys.length > 0 && !forceOverwrite) {
      return NextResponse.json(
        { 
          message: 'Database already contains cases. Use ?force=true to overwrite.',
          existingCount: existingKeys.length
        },
        { status: 409 }
      )
    }
    
    // If forcing overwrite, delete existing cases
    if (existingKeys.length > 0 && forceOverwrite) {
      await Promise.all(existingKeys.map(key => redis.del(key)))
    }
    
    // Seed the database with mock cases
    await Promise.all(
      mockCases.map(async (caseItem) => {
        await redis.set(`${CASE_PREFIX}${caseItem.id}`, caseItem)
      })
    )
    
    return NextResponse.json({
      success: true,
      message: `Seeded database with ${mockCases.length} cases`,
      cases: mockCases.map(c => ({ id: c.id, title: c.title }))
    })
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    )
  }
} 