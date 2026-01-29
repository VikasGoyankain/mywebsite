import { NextRequest, NextResponse } from 'next/server'
import { 
  getAllAdminSections, 
  createAdminSection, 
  getSectionAnalytics,
  initializeDefaultSections 
} from '@/lib/admin-sections'

export async function GET() {
  try {
    // Initialize default sections if none exist
    await initializeDefaultSections()
    
    const sections = await getAllAdminSections()
    return NextResponse.json(sections)
  } catch (error) {
    console.error('Error fetching admin sections:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, icon, linkHref, linkText, category, priority, isActive } = body

    // Validate required fields
    if (!title || !description || !icon || !linkHref || !linkText || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const section = await createAdminSection({
      title,
      description,
      icon,
      linkHref,
      linkText,
      category,
      priority: priority || 0,
      isActive: isActive !== false
    })

    return NextResponse.json(section)
  } catch (error) {
    console.error('Error creating admin section:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 