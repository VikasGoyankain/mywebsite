import { NextRequest, NextResponse } from 'next/server'
import { 
  getAdminCategory,
  updateAdminCategory,
  deleteAdminCategory
} from '@/lib/admin-categories'
import { getSectionsByCategory } from '@/lib/admin-sections'

// GET - Get single category
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await getAdminCategory(params.id)
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(category)
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    )
  }
}

// PATCH - Update category
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, description, icon, order, isActive } = body
    
    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description
    if (icon !== undefined) updates.icon = icon
    if (order !== undefined) updates.order = order
    if (isActive !== undefined) updates.isActive = isActive
    
    const updatedCategory = await updateAdminCategory(params.id, updates)
    
    if (!updatedCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

// DELETE - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if category has sections
    const sections = await getSectionsByCategory(params.id)
    if (sections.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with existing sections. Move or delete sections first.' },
        { status: 400 }
      )
    }
    
    const success = await deleteAdminCategory(params.id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}
