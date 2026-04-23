import { NextRequest, NextResponse } from 'next/server'
import { 
  getAllAdminCategories, 
  addAdminCategory,
  updateAdminCategory,
  initializeDefaultCategories
} from '@/lib/admin-categories'
import { 
  getAllAdminSections,
  initializeDefaultSections 
} from '@/lib/admin-sections'

// GET - List all categories
export async function GET(request: NextRequest) {
  try {
    let categories = await getAllAdminCategories()
    
    // Initialize defaults if no categories exist
    if (categories.length === 0) {
      console.log('No categories found, initializing defaults...')
      await initializeDefaultCategories()
      
      // Get the newly created categories
      categories = await getAllAdminCategories()
      console.log('Categories initialized:', categories.length)
    }
    
    // Check if sections need to be initialized
    const sections = await getAllAdminSections()
    if (sections.length === 0 && categories.length > 0) {
      console.log('No sections found, initializing defaults...')
      // Create a map of category names to IDs for default sections
      const categoryMap = new Map(
        categories.map(cat => [cat.name, cat.id])
      )
      
      // Initialize default sections with the category mapping
      await initializeDefaultSections(categoryMap)
      console.log('Sections initialized')
    }
    
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching admin categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, icon, order, isActive } = body
    
    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      )
    }
    
    const category = await addAdminCategory({
      name,
      description,
      icon: icon || 'Folder',
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true
    })
    
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}

// PUT - Update category order (for reordering)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { categoryIds } = body
    
    if (!Array.isArray(categoryIds)) {
      return NextResponse.json(
        { error: 'categoryIds must be an array' },
        { status: 400 }
      )
    }
    
    // Update order for each category
    for (let i = 0; i < categoryIds.length; i++) {
      await updateAdminCategory(categoryIds[i], { order: i })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering categories:', error)
    return NextResponse.json(
      { error: 'Failed to reorder categories' },
      { status: 500 }
    )
  }
}
