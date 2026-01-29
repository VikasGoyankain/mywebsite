import { NextResponse } from 'next/server'
import { 
  createResearchStudy,
  updateResearchStudy,
  deleteResearchStudy,
  initializeDefaultResearchStudies
} from '@/lib/services/research-service'
import { ResearchStudy } from '@/lib/models/research'

// Helper to validate if a user is allowed to do admin actions
// In a real application, you would implement proper authentication
async function isAuthorized(request: Request): Promise<boolean> {
  // For now, we'll just return true for development
  // In production, you should implement proper authentication
  return true
}

export async function POST(request: Request) {
  try {
    if (!await isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    // Initialize default studies
    if (data.action === 'initialize') {
      const result = await initializeDefaultResearchStudies()
      return NextResponse.json({ success: result })
    }
    
    // Create new research study
    const study = await createResearchStudy(data)
    return NextResponse.json(study, { status: 201 })
  } catch (error) {
    console.error('Failed to create research study:', error)
    return NextResponse.json(
      { error: 'Failed to create research study' }, 
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    if (!await isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }
    
    const data: Partial<ResearchStudy> = await request.json()
    const updatedStudy = await updateResearchStudy(id, data)
    
    if (!updatedStudy) {
      return NextResponse.json({ error: 'Research study not found' }, { status: 404 })
    }
    
    return NextResponse.json(updatedStudy)
  } catch (error) {
    console.error('Failed to update research study:', error)
    return NextResponse.json(
      { error: 'Failed to update research study' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    if (!await isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }
    
    const success = await deleteResearchStudy(id)
    
    if (!success) {
      return NextResponse.json({ error: 'Research study not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete research study:', error)
    return NextResponse.json(
      { error: 'Failed to delete research study' }, 
      { status: 500 }
    )
  }
} 