import { NextRequest, NextResponse } from 'next/server'
import { getAdminSection, updateAdminSection, deleteAdminSection } from '@/lib/admin-sections'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const section = await getAdminSection(params.id)
    
    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 })
    }

    return NextResponse.json(section)
  } catch (error) {
    console.error('Error fetching admin section:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, description, icon, linkHref, linkText, categoryId, order, isActive, isPinned } = body

    const section = await updateAdminSection(params.id, {
      ...(title && { title }),
      ...(description && { description }),
      ...(icon && { icon }),
      ...(linkHref && { linkHref }),
      ...(linkText && { linkText }),
      ...(categoryId && { categoryId }),
      ...(order !== undefined && { order }),
      ...(isActive !== undefined && { isActive }),
      ...(isPinned !== undefined && { isPinned })
    })

    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 })
    }

    return NextResponse.json(section)
  } catch (error) {
    console.error('Error updating admin section:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteAdminSection(params.id)
    
    if (!success) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Section deleted successfully' })
  } catch (error) {
    console.error('Error deleting admin section:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 