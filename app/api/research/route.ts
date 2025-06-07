import { NextResponse } from 'next/server'
import { 
  getAllResearchStudies, 
  getResearchStudyById,
  filterResearchStudies,
  searchResearchStudies,
  createResearchStudy,
  updateResearchStudy,
  deleteResearchStudy
} from '@/lib/services/research-service'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const id = searchParams.get('id')
    const query = searchParams.get('query')
    const domain = searchParams.get('domain') || undefined
    const year = searchParams.get('year') ? parseInt(searchParams.get('year') as string, 10) : undefined
    const tags = searchParams.get('tags')?.split(',')
    
    // Get a specific research study by ID
    if (id) {
      const study = await getResearchStudyById(id)
      
      if (!study) {
        return NextResponse.json({ error: 'Research study not found' }, { status: 404 })
      }
      
      return NextResponse.json(study)
    }
    
    // Search for studies by query
    if (query) {
      const studies = await searchResearchStudies(query)
      return NextResponse.json(studies)
    }
    
    // Filter studies by domain, year, or tags
    if (domain || year || tags) {
      const studies = await filterResearchStudies({ domain, year, tags })
      return NextResponse.json(studies)
    }
    
    // Get all studies
    const studies = await getAllResearchStudies()
    return NextResponse.json(studies)
  } catch (error) {
    console.error('Error handling research studies request:', error)
    return NextResponse.json(
      { error: 'Failed to fetch research studies' }, 
      { status: 500 }
    )
  }
}

// Create a new research study
export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Validate required fields
    if (!data.title || !data.abstract || !data.domain) {
      return NextResponse.json(
        { message: 'Missing required fields: title, abstract, and domain are required' }, 
        { status: 400 }
      )
    }
    
    const study = await createResearchStudy(data)
    return NextResponse.json(study, { status: 201 })
  } catch (error) {
    console.error('Error creating research study:', error)
    return NextResponse.json(
      { message: 'Failed to create research study', error: String(error) }, 
      { status: 500 }
    )
  }
}

// Update a research study
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { message: 'Research study ID is required' }, 
        { status: 400 }
      )
    }
    
    const data = await request.json()
    
    // Validate required fields
    if (!data.title || !data.abstract || !data.domain) {
      return NextResponse.json(
        { message: 'Missing required fields: title, abstract, and domain are required' }, 
        { status: 400 }
      )
    }
    
    const updatedStudy = await updateResearchStudy(id, data)
    
    if (!updatedStudy) {
      return NextResponse.json(
        { message: `Research study with ID ${id} not found` }, 
        { status: 404 }
      )
    }
    
    return NextResponse.json(updatedStudy)
  } catch (error) {
    console.error('Error updating research study:', error)
    return NextResponse.json(
      { message: 'Failed to update research study', error: String(error) }, 
      { status: 500 }
    )
  }
}

// Delete a research study
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { message: 'Research study ID is required' }, 
        { status: 400 }
      )
    }
    
    const success = await deleteResearchStudy(id)
    
    if (!success) {
      return NextResponse.json(
        { message: `Research study with ID ${id} not found` }, 
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: 'Research study deleted successfully' })
  } catch (error) {
    console.error('Error deleting research study:', error)
    return NextResponse.json(
      { message: 'Failed to delete research study', error: String(error) }, 
      { status: 500 }
    )
  }
} 