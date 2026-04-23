import redis from './redis'

export interface AdminCategory {
  id: string
  name: string
  description: string
  icon: string
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Redis keys
const REDIS_KEYS = {
  ADMIN_CATEGORIES: 'admin:categories',
}

// Helper function to generate unique ID
function generateId(): string {
  return `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Get all admin categories
export async function getAllAdminCategories(): Promise<AdminCategory[]> {
  try {
    const categoriesData = await redis.hgetall(REDIS_KEYS.ADMIN_CATEGORIES)
    
    if (!categoriesData || Object.keys(categoriesData).length === 0) {
      // Initialize with default categories if none exist
      await initializeDefaultCategories()
      return getAllAdminCategories()
    }

    const categories: AdminCategory[] = []
    
    for (const [key, data] of Object.entries(categoriesData)) {
      try {
        let category: AdminCategory
        if (typeof data === 'string') {
          // Try to parse if it's a string
          category = JSON.parse(data)
        } else if (typeof data === 'object' && data !== null) {
          // Already an object
          category = data as AdminCategory
        } else {
          // Invalid data, skip
          console.warn(`Invalid category data for key ${key}:`, data)
          continue
        }
        
        // Validate required fields
        if (category.id && category.name) {
          categories.push(category)
        }
      } catch (parseError) {
        console.warn(`Failed to parse category data for key ${key}:`, parseError)
        // Delete corrupted entry
        await redis.hdel(REDIS_KEYS.ADMIN_CATEGORIES, key)
      }
    }

    // If all data was corrupted, reinitialize
    if (categories.length === 0) {
      await redis.del(REDIS_KEYS.ADMIN_CATEGORIES)
      await initializeDefaultCategories()
      return getAllAdminCategories()
    }

    // Sort by order and filter active
    return categories
      .filter(cat => cat.isActive)
      .sort((a, b) => a.order - b.order)
  } catch (error) {
    console.error('Error fetching admin categories:', error)
    return []
  }
}

// Get single category by ID
export async function getAdminCategory(id: string): Promise<AdminCategory | null> {
  try {
    const categoryData = await redis.hget(REDIS_KEYS.ADMIN_CATEGORIES, id)
    
    if (!categoryData) {
      return null
    }

    return typeof categoryData === 'string' ? JSON.parse(categoryData) : categoryData as AdminCategory
  } catch (error) {
    console.error('Error fetching admin category:', error)
    return null
  }
}

// Add new category
export async function addAdminCategory(category: Omit<AdminCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdminCategory> {
  try {
    const newCategory: AdminCategory = {
      ...category,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await redis.hset(
      REDIS_KEYS.ADMIN_CATEGORIES,
      { [newCategory.id]: JSON.stringify(newCategory) }
    )

    return newCategory
  } catch (error) {
    console.error('Error adding admin category:', error)
    throw error
  }
}

// Update existing category
export async function updateAdminCategory(id: string, updates: Partial<Omit<AdminCategory, 'id' | 'createdAt'>>): Promise<AdminCategory | null> {
  try {
    const existingCategory = await getAdminCategory(id)
    
    if (!existingCategory) {
      return null
    }

    const updatedCategory: AdminCategory = {
      ...existingCategory,
      ...updates,
      id: existingCategory.id,
      createdAt: existingCategory.createdAt,
      updatedAt: new Date().toISOString()
    }

    await redis.hset(
      REDIS_KEYS.ADMIN_CATEGORIES,
      { [id]: JSON.stringify(updatedCategory) }
    )

    return updatedCategory
  } catch (error) {
    console.error('Error updating admin category:', error)
    throw error
  }
}

// Delete category
export async function deleteAdminCategory(id: string): Promise<boolean> {
  try {
    await redis.hdel(REDIS_KEYS.ADMIN_CATEGORIES, id)
    return true
  } catch (error) {
    console.error('Error deleting admin category:', error)
    return false
  }
}

// Reorder categories
export async function reorderAdminCategories(categoryIds: string[]): Promise<boolean> {
  try {
    const categories = await getAllAdminCategories()
    
    for (let i = 0; i < categoryIds.length; i++) {
      const category = categories.find(c => c.id === categoryIds[i])
      if (category) {
        await updateAdminCategory(category.id, { order: i })
      }
    }

    return true
  } catch (error) {
    console.error('Error reordering admin categories:', error)
    return false
  }
}

// Initialize default categories
export async function initializeDefaultCategories(): Promise<void> {
  const defaultCategories: Omit<AdminCategory, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      name: 'Content Management',
      description: 'Manage website content, blog posts, and media',
      icon: 'FileText',
      order: 1,
      isActive: true
    },
    {
      name: 'Profile & Experience',
      description: 'Manage your professional profile and experience',
      icon: 'User',
      order: 2,
      isActive: true
    },
    {
      name: 'Legal & Cases',
      description: 'Manage legal expertise and case vault',
      icon: 'Scale',
      order: 3,
      isActive: true
    },
    {
      name: 'Site Settings',
      description: 'Configure site settings and preferences',
      icon: 'Settings',
      order: 4,
      isActive: true
    },
    {
      name: 'Tools & Utilities',
      description: 'Access admin tools and utilities',
      icon: 'Wrench',
      order: 5,
      isActive: true
    }
  ]

  const existingCategories = await redis.hgetall(REDIS_KEYS.ADMIN_CATEGORIES)
  
  // Only add categories if they don't exist
  if (!existingCategories || Object.keys(existingCategories).length === 0) {
    for (const category of defaultCategories) {
      await addAdminCategory(category)
    }
  }
}
