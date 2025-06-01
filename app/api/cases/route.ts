import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { isRedisConnected, redis, REDIS_KEYS } from '@/lib/redis'

// Define Case type
interface Case {
  id: string
  title: string
  court: string
  category: string
  year: string
  outcome: 'In favour of client' | 'Lost' | 'Ongoing' | 'Settlement' | 'Dismissed'
  description: string
  fullDescription?: string
}

// Helper function to use either Redis or Vercel KV
const getStorage = async () => {
  try {
    // Try Redis first for read operations
    const connected = await isRedisConnected()
    if (connected) {
      return { client: redis, type: 'redis' }
    }
    // Fallback to Vercel KV
    return { client: kv, type: 'kv' }
  } catch (error) {
    console.error('Storage connection error:', error)
    // Default to Vercel KV
    return { client: kv, type: 'kv' }
  }
}

// Get storage optimized for write operations (uses Vercel KV)
const getWriteStorage = async () => {
  try {
    // Always use Vercel KV for write operations
    return { client: kv, type: 'kv' }
  } catch (error) {
    console.error('Storage write connection error:', error)
    return { client: kv, type: 'kv' }
  }
}

// Sample cases data (will be used if no cases exist in the database)
const sampleCases: Case[] = [
  {
    id: 'case-001',
    title: 'State vs. Sharma',
    court: 'Delhi High Court',
    category: 'Criminal Defense',
    year: '2023',
    outcome: 'In favour of client',
    description: 'Successfully defended a wrongfully accused client in a high-profile fraud case.',
    fullDescription: 'Successfully defended a wrongfully accused client in a high-profile fraud case. Secured acquittal through meticulous evidence examination and procedural challenges. Case involved complex financial documentation and multiple witness testimonies that were effectively cross-examined to establish reasonable doubt.'
  },
  {
    id: 'case-002',
    title: 'ABC Corp vs. XYZ Ltd',
    court: 'National Company Law Tribunal',
    category: 'Corporate',
    year: '2022',
    outcome: 'Settlement',
    description: 'Negotiated a favorable settlement in a corporate dispute over intellectual property rights.',
    fullDescription: 'Negotiated a favorable settlement in a corporate dispute over intellectual property rights. The settlement included licensing agreements and monetary compensation that preserved the client\'s business operations while acknowledging the importance of the contested intellectual property.'
  },
  {
    id: 'case-003',
    title: 'Singh Family Property Dispute',
    court: 'Civil Court',
    category: 'Civil',
    year: '2022',
    outcome: 'Ongoing',
    description: 'Representing multiple family members in a complex inheritance dispute involving ancestral property.',
    fullDescription: 'Representing multiple family members in a complex inheritance dispute involving ancestral property. The case involves interpretation of traditional family customs alongside modern property law, requiring extensive research into precedents and family documentation dating back several generations.'
  },
  {
    id: 'case-004',
    title: 'Environmental Protection Agency vs. Industrial Manufacturers Association',
    court: 'Supreme Court',
    category: 'Environmental Law',
    year: '2021',
    outcome: 'Lost',
    description: 'Represented industry association in challenge to new environmental regulations.',
    fullDescription: 'Represented industry association in challenge to new environmental regulations. Despite presenting compelling economic impact assessments, the court upheld the regulations citing constitutional provisions for environmental protection. Case established important precedent for balancing industrial development with environmental concerns.'
  }
]

export async function GET() {
  try {
    // Get storage client
    const { client, type } = await getStorage()
    
    let cases: Case[] = []
    
    if (type === 'redis') {
      // Try to get case IDs from Redis
      const caseIds = await client.get(REDIS_KEYS.CASES_INDEX) as string[] || []
      
      if (caseIds && caseIds.length > 0) {
        // Fetch each case by ID
        const casesData = await Promise.all(
          caseIds.map(async (id) => {
            const caseData = await client.get(`case:${id}`) as Case
            return caseData
          })
        )
        
        cases = casesData.filter(Boolean)
      }
    } else {
      // Vercel KV approach
      const caseIds = await client.get('cases:index') as string[] || []
      
      if (caseIds && caseIds.length > 0) {
        const casesData = await Promise.all(
          caseIds.map(async (id) => {
            const caseData = await client.get(`case:${id}`) as Case
            return caseData
          })
        )
        
        cases = casesData.filter(Boolean)
      }
    }
    
    // If no cases found, initialize with sample data
    if (cases.length === 0) {
      try {
        // Use write-optimized storage for initialization
        const writeStorage = await getWriteStorage()
        await initializeSampleCases(writeStorage.client)
        cases = sampleCases
      } catch (error) {
        console.error('Error initializing sample cases:', error)
        // Return sample cases even if initialization fails
        cases = sampleCases
      }
    }
    
    return NextResponse.json(cases)
    
  } catch (error) {
    console.error('Error fetching cases:', error)
    return NextResponse.json(
      { message: 'Error fetching cases', error: String(error) },
      { status: 500 }
    )
  }
}

// Initialize database with sample cases
async function initializeSampleCases(client: any) {
  try {
    const caseIds = sampleCases.map(c => c.id)
    
    // Store each case (always use Vercel KV)
    for (const caseData of sampleCases) {
      await client.set(`case:${caseData.id}`, caseData)
    }
    
    // Store case IDs index (always use Vercel KV)
    await client.set('cases:index', caseIds)
    
    console.log('Sample cases initialized')
  } catch (error) {
    console.error('Error initializing sample cases:', error)
    throw error
  }
}

// Admin route to add a new case (would typically require authentication)
export async function POST(request: Request) {
  try {
    // In a production environment, you would verify authentication here
    
    const newCase = await request.json()
    
    // Validate required fields
    if (!newCase.title || !newCase.court || !newCase.category || !newCase.outcome) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Generate ID if not provided
    if (!newCase.id) {
      newCase.id = `case-${Date.now()}`
    }
    
    // Get storage client - use write-optimized storage
    const { client, type } = await getWriteStorage()
    
    try {
      // Store the new case (always with Vercel KV)
      await client.set(`case:${newCase.id}`, newCase)
      
      // Update the index
      let caseIds = await client.get('cases:index') as string[] || []
      caseIds = Array.isArray(caseIds) ? caseIds : []
      caseIds.push(newCase.id)
      await client.set('cases:index', caseIds)
      
      return NextResponse.json(newCase, { status: 201 })
    } catch (storageError) {
      console.error('Storage error:', storageError)
      return NextResponse.json(
        { message: 'Failed to save case to database', error: String(storageError) },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('Error adding new case:', error)
    return NextResponse.json(
      { message: 'Error adding new case', error: String(error) },
      { status: 500 }
    )
  }
}

// Admin route to update an existing case
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { message: 'Case ID is required' },
        { status: 400 }
      )
    }
    
    const updatedCase = await request.json()
    
    // Validate required fields
    if (!updatedCase.title || !updatedCase.court || !updatedCase.category || !updatedCase.outcome) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Ensure ID matches
    updatedCase.id = id
    
    // Get write-optimized storage
    const { client } = await getWriteStorage()
    
    try {
      // Check if case exists (read from any storage)
      const readStorage = await getStorage()
      let caseData = await readStorage.client.get(`case:${id}`)
      
      if (!caseData) {
        return NextResponse.json(
          { message: 'Case not found' },
          { status: 404 }
        )
      }
      
      // Update case with write storage
      await client.set(`case:${id}`, updatedCase)
      
      return NextResponse.json(updatedCase)
    } catch (storageError) {
      console.error('Storage error:', storageError)
      return NextResponse.json(
        { message: 'Failed to update case in database', error: String(storageError) },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error updating case:', error)
    return NextResponse.json(
      { message: 'Error updating case', error: String(error) },
      { status: 500 }
    )
  }
}

// Admin route to delete a case
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { message: 'Case ID is required' },
        { status: 400 }
      )
    }
    
    // Get write-optimized storage client
    const { client } = await getWriteStorage()
    
    try {
      // Check if case exists (read from any storage)
      const readStorage = await getStorage()
      let caseData = await readStorage.client.get(`case:${id}`)
      
      if (!caseData) {
        return NextResponse.json(
          { message: 'Case not found' },
          { status: 404 }
        )
      }
      
      // Delete case with write storage
      await client.del(`case:${id}`)
      
      // Update index
      let caseIds = await client.get('cases:index') as string[] || []
      caseIds = Array.isArray(caseIds) ? caseIds.filter(caseId => caseId !== id) : []
      await client.set('cases:index', caseIds)
      
      return NextResponse.json({ success: true, message: 'Case deleted successfully' })
    } catch (storageError) {
      console.error('Storage error:', storageError)
      return NextResponse.json(
        { message: 'Failed to delete case from database', error: String(storageError) },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error deleting case:', error)
    return NextResponse.json(
      { message: 'Error deleting case', error: String(error) },
      { status: 500 }
    )
  }
} 