import { NextResponse } from 'next/server'
import { 
  getAllResearchStudies, 
  getResearchStudyById,
  filterResearchStudies,
  searchResearchStudies
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