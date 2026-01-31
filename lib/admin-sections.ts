import redis from './redis'

export interface AdminSection {
  id: string
  title: string
  description: string
  icon: string
  linkHref: string
  linkText: string
  categoryId: string // Links to AdminCategory
  order: number // Order within the category
  isActive: boolean
  isPinned: boolean // Show in pinned sections at top
  createdAt: string
  updatedAt: string
}

// Redis keys
const REDIS_KEYS = {
  ADMIN_SECTIONS: 'admin:sections',
}

// Helper function to generate unique ID
function generateId(): string {
  return `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Get all admin sections
export async function getAllAdminSections(): Promise<AdminSection[]> {
  try {
    const sectionsData = await redis.hgetall(REDIS_KEYS.ADMIN_SECTIONS)
    
    if (!sectionsData || Object.keys(sectionsData).length === 0) {
      return []
    }

    const sections: AdminSection[] = []
    
    for (const [key, data] of Object.entries(sectionsData)) {
      try {
        let section: AdminSection
        if (typeof data === 'string') {
          section = JSON.parse(data)
        } else if (typeof data === 'object' && data !== null) {
          section = data as AdminSection
        } else {
          console.warn(`Invalid section data for key ${key}:`, data)
          continue
        }
        
        // Validate required fields and set defaults for missing optional fields
        if (section.id && section.title) {
          // Ensure isPinned has a default value for older sections
          if (typeof section.isPinned !== 'boolean') {
            section.isPinned = false
          }
          sections.push(section)
        }
      } catch (parseError) {
        console.warn(`Failed to parse section data for key ${key}:`, parseError)
        await redis.hdel(REDIS_KEYS.ADMIN_SECTIONS, key)
      }
    }

    // Filter active sections and sort by order
    return sections
      .filter(section => section.isActive)
      .sort((a, b) => a.order - b.order)
  } catch (error) {
    console.error('Error fetching admin sections:', error)
    return []
  }
}

// Get sections by category ID
export async function getSectionsByCategory(categoryId: string): Promise<AdminSection[]> {
  try {
    const allSections = await getAllAdminSections()
    return allSections
      .filter(section => section.categoryId === categoryId)
      .sort((a, b) => a.order - b.order)
  } catch (error) {
    console.error('Error fetching sections by category:', error)
    return []
  }
}

// Get pinned sections
export async function getPinnedSections(): Promise<AdminSection[]> {
  try {
    const allSections = await getAllAdminSections()
    return allSections
      .filter(section => section.isPinned)
      .sort((a, b) => a.order - b.order)
  } catch (error) {
    console.error('Error fetching pinned sections:', error)
    return []
  }
}

// Get single admin section by ID
export async function getAdminSection(id: string): Promise<AdminSection | null> {
  try {
    const section = await redis.hget(REDIS_KEYS.ADMIN_SECTIONS, id)
    if (!section) return null
    
    return typeof section === 'string' ? JSON.parse(section) : section as AdminSection
  } catch (error) {
    console.error('Error fetching admin section:', error)
    return null
  }
}

// Create new admin section
export async function createAdminSection(
  sectionData: Omit<AdminSection, 'id' | 'createdAt' | 'updatedAt'>
): Promise<AdminSection> {
  try {
    const id = generateId()
    const now = new Date().toISOString()
    
    const section: AdminSection = {
      ...sectionData,
      id,
      createdAt: now,
      updatedAt: now
    }
    
    await redis.hset(REDIS_KEYS.ADMIN_SECTIONS, {
      [id]: JSON.stringify(section)
    })
    
    return section
  } catch (error) {
    console.error('Error creating admin section:', error)
    throw new Error('Failed to create admin section')
  }
}

// Update admin section
export async function updateAdminSection(
  id: string, 
  updates: Partial<Omit<AdminSection, 'id' | 'createdAt'>>
): Promise<AdminSection | null> {
  try {
    const existingSection = await getAdminSection(id)
    if (!existingSection) return null
    
    const updatedSection: AdminSection = {
      ...existingSection,
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    await redis.hset(REDIS_KEYS.ADMIN_SECTIONS, {
      [id]: JSON.stringify(updatedSection)
    })
    
    return updatedSection
  } catch (error) {
    console.error('Error updating admin section:', error)
    throw new Error('Failed to update admin section')
  }
}

// Delete admin section
export async function deleteAdminSection(id: string): Promise<boolean> {
  try {
    const result = await redis.hdel(REDIS_KEYS.ADMIN_SECTIONS, id)
    return result > 0
  } catch (error) {
    console.error('Error deleting admin section:', error)
    return false
  }
}

// Reorder sections within a category
export async function reorderSections(categoryId: string, sectionIds: string[]): Promise<boolean> {
  try {
    const sections = await getSectionsByCategory(categoryId)
    
    for (let i = 0; i < sectionIds.length; i++) {
      const section = sections.find(s => s.id === sectionIds[i])
      if (section) {
        await updateAdminSection(section.id, { order: i })
      }
    }

    return true
  } catch (error) {
    console.error('Error reordering sections:', error)
    return false
  }
}

// Initialize default sections with category mapping
export async function initializeDefaultSections(categoryMap: Map<string, string>): Promise<void> {
  try {
    const existingSections = await getAllAdminSections()
    
    // Define default sections matching actual admin pages
    // Actual admin routes: blogs, casevault, expedu, expertise, family, footer, personal, profile, settings, subscribers, url-shortner, works
    const defaultSections = [
      // ===== Content Management =====
      {
        title: 'Blog Posts',
        description: 'Create, edit, and manage blog posts and articles',
        icon: 'FileText',
        linkHref: '/admin/blogs',
        linkText: 'Manage Blog',
        categoryName: 'Content Management',
        order: 1,
        isActive: true,
        isPinned: false
      },
      
      // ===== Profile & Experience =====
      {
        title: 'Profile',
        description: 'Update your personal profile information and bio',
        icon: 'User',
        linkHref: '/admin/profile',
        linkText: 'Edit Profile',
        categoryName: 'Profile & Experience',
        order: 1,
        isActive: true,
        isPinned: false
      },
      {
        title: 'Personal Information',
        description: 'Manage personal details, contact info, and social links',
        icon: 'UserCircle',
        linkHref: '/admin/personal',
        linkText: 'Edit Personal Info',
        categoryName: 'Profile & Experience',
        order: 2,
        isActive: true,
        isPinned: false
      },
      {
        title: 'Education & Experience',
        description: 'Manage your educational background and work experience',
        icon: 'GraduationCap',
        linkHref: '/admin/expedu',
        linkText: 'Manage Education',
        categoryName: 'Profile & Experience',
        order: 3,
        isActive: true,
        isPinned: false
      },
      {
        title: 'Expertise & Skills',
        description: 'Manage your professional expertise, skills, and competencies',
        icon: 'Star',
        linkHref: '/admin/expertise',
        linkText: 'Manage Expertise',
        categoryName: 'Profile & Experience',
        order: 4,
        isActive: true,
        isPinned: false
      },
      
      // ===== Legal & Cases =====
      {
        title: 'Case Vault',
        description: 'Manage legal case studies, judgments, and legal research',
        icon: 'Briefcase',
        linkHref: '/admin/casevault',
        linkText: 'Manage Cases',
        categoryName: 'Legal & Cases',
        order: 1,
        isActive: true,
        isPinned: false
      },
      {
        title: 'My Works',
        description: 'Showcase your legal publications, articles, and achievements',
        icon: 'Award',
        linkHref: '/admin/works',
        linkText: 'Manage Works',
        categoryName: 'Legal & Cases',
        order: 2,
        isActive: true,
        isPinned: false
      },
      
      // ===== Site Settings =====
      {
        title: 'Dashboard Configuration',
        description: 'Manage admin dashboard categories and navigation sections',
        icon: 'Settings',
        linkHref: '/admin/admin-settings',
        linkText: 'Configure Dashboard',
        categoryName: 'Site Settings',
        order: 1,
        isActive: true,
        isPinned: false
      },
      {
        title: 'General Settings',
        description: 'Configure site-wide settings, password, and preferences',
        icon: 'Wrench',
        linkHref: '/admin/settings',
        linkText: 'Site Settings',
        categoryName: 'Site Settings',
        order: 2,
        isActive: true,
        isPinned: false
      },
      {
        title: 'Family Members',
        description: 'Add and manage family member profiles and information',
        icon: 'Users',
        linkHref: '/admin/family',
        linkText: 'Manage Family',
        categoryName: 'Site Settings',
        order: 3,
        isActive: true,
        isPinned: false
      },
      {
        title: 'Footer Content',
        description: 'Customize website footer links, text, and layout',
        icon: 'Layout',
        linkHref: '/admin/footer',
        linkText: 'Edit Footer',
        categoryName: 'Site Settings',
        order: 4,
        isActive: true,
        isPinned: false
      },
      {
        title: 'Subscribers',
        description: 'View and manage newsletter subscribers and email list',
        icon: 'Mail',
        linkHref: '/admin/subscribers',
        linkText: 'View Subscribers',
        categoryName: 'Site Settings',
        order: 5,
        isActive: true,
        isPinned: false
      },
      
      // ===== Tools & Utilities =====
      {
        title: 'URL Shortener',
        description: 'Create and manage shortened URLs for sharing',
        icon: 'Link',
        linkHref: '/admin/url-shortner',
        linkText: 'Manage URLs',
        categoryName: 'Tools & Utilities',
        order: 1,
        isActive: true,
        isPinned: false
      }
    ]
    
    // Only initialize if no sections exist
    if (existingSections.length === 0) {
      console.log('Creating default sections with category map:', Array.from(categoryMap.entries()))
      
      for (const sectionData of defaultSections) {
        const categoryId = categoryMap.get(sectionData.categoryName)
        if (categoryId) {
          const { categoryName, ...section } = sectionData
          try {
            await createAdminSection({
              ...section,
              categoryId
            })
            console.log(`Created section: ${sectionData.title}`)
          } catch (err) {
            console.error(`Failed to create section ${sectionData.title}:`, err)
          }
        } else {
          console.warn(`Category not found for section: ${sectionData.title}, category: ${sectionData.categoryName}`)
        }
      }
    }
    
    console.log('Default admin sections initialized')
  } catch (error) {
    console.error('Error initializing default sections:', error)
  }
}
