import redis from './redis'

export interface AdminSection {
  id: string
  title: string
  description: string
  icon: string
  linkHref: string
  linkText: string
  category: 'frequent' | 'content' | 'management' | 'tools'
  priority: number
  isActive: boolean
  usageCount: number
  lastUsed?: string
  createdAt: string
  updatedAt: string
}

export interface AdminSectionUsage {
  id: string
  sectionId: string
  accessedAt: string
  userId?: string
  sessionId?: string
}

export interface AdminSectionAnalytics {
  sectionId: string
  title: string
  totalUsage: number
  dailyUsage: number
  weeklyUsage: number
  monthlyUsage: number
  lastUsed: string
}

// Redis keys
const REDIS_KEYS = {
  ADMIN_SECTIONS: 'admin:sections',
  ADMIN_SECTION_USAGE: 'admin:section:usage',
  ADMIN_SECTION_INDEX: 'admin:section:index'
}

// Helper function to generate unique ID
function generateId(): string {
  return `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Get all admin sections
export async function getAllAdminSections(): Promise<AdminSection[]> {
  try {
    const sections = await redis.hgetall(REDIS_KEYS.ADMIN_SECTIONS)
    if (!sections) return []
    
    return Object.values(sections)
      .map(section => typeof section === 'string' ? JSON.parse(section) : section)
      .filter(section => section.isActive)
      .sort((a, b) => a.priority - b.priority)
  } catch (error) {
    console.error('Error fetching admin sections:', error)
    return []
  }
}

// Get single admin section
export async function getAdminSection(id: string): Promise<AdminSection | null> {
  try {
    const section = await redis.hget(REDIS_KEYS.ADMIN_SECTIONS, id)
    if (!section) return null
    
    return typeof section === 'string' ? JSON.parse(section) : section
  } catch (error) {
    console.error('Error fetching admin section:', error)
    return null
  }
}

// Create new admin section
export async function createAdminSection(sectionData: Omit<AdminSection, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>): Promise<AdminSection> {
  try {
    const id = generateId()
    const now = new Date().toISOString()
    
    const section: AdminSection = {
      ...sectionData,
      id,
      usageCount: 0,
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
export async function updateAdminSection(id: string, updates: Partial<AdminSection>): Promise<AdminSection | null> {
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

// Record section usage
export async function recordSectionUsage(sectionId: string, userId?: string): Promise<void> {
  if (!sectionId || typeof sectionId !== 'string') {
    throw new Error('Invalid section ID provided')
  }

  try {
    const section = await getAdminSection(sectionId)
    if (!section) {
      throw new Error(`Section not found: ${sectionId}`)
    }

    const now = new Date().toISOString()
    
    // Generate a unique usage ID with timestamp and random suffix
    const usageId = `usage_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    
    const usage: AdminSectionUsage = {
      id: usageId,
      sectionId,
      accessedAt: now,
      userId: userId || undefined
    }

    // Store usage data in Redis
    await Promise.all([
      // Store usage entry
      redis.hSet(`admin:section:usage:${usageId}`, usage),
      // Update section's usage count
      redis.hIncrBy(`admin:section:${sectionId}`, 'usageCount', 1),
      // Update section's last used timestamp
      redis.hSet(`admin:section:${sectionId}`, 'lastUsed', now)
    ]).catch((error) => {
      console.error('Redis operation failed:', error)
      throw new Error('Failed to record section usage')
    })
  } catch (error) {
    console.error(`Error recording usage for section ${sectionId}:`, error)
    throw error
  }
}

// Get section analytics
export async function getSectionAnalytics(): Promise<AdminSectionAnalytics[]> {
  try {
    const sections = await getAllAdminSections()
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    
    const analytics: AdminSectionAnalytics[] = []
    
    for (const section of sections) {
      // Get all usage records for this section
      const allUsage = await redis.hgetall(REDIS_KEYS.ADMIN_SECTION_USAGE)
      const sectionUsage = Object.values(allUsage || {})
        .map(usage => typeof usage === 'string' ? JSON.parse(usage) : usage)
        .filter((usage: AdminSectionUsage) => usage.sectionId === section.id)
      
      const dailyUsage = sectionUsage.filter(usage => usage.accessedAt >= oneDayAgo).length
      const weeklyUsage = sectionUsage.filter(usage => usage.accessedAt >= oneWeekAgo).length
      const monthlyUsage = sectionUsage.filter(usage => usage.accessedAt >= oneMonthAgo).length
      
      analytics.push({
        sectionId: section.id,
        title: section.title,
        totalUsage: section.usageCount,
        dailyUsage,
        weeklyUsage,
        monthlyUsage,
        lastUsed: section.lastUsed || ''
      })
    }
    
    return analytics.sort((a, b) => b.totalUsage - a.totalUsage)
  } catch (error) {
    console.error('Error getting section analytics:', error)
    return []
  }
}

// Initialize default sections
export async function initializeDefaultSections(): Promise<void> {
  try {
    const existingSections = await getAllAdminSections()
    
    const defaultSections = [
      {
        title: 'Blog',
        description: 'Manage blog posts with the new content schema',
        icon: 'FileText',
        linkHref: '/admin/blogs',
        linkText: 'Manage Blog',
        category: 'content' as const,
        priority: 1,
        isActive: true
      },
      {
        title: 'Profile',
        description: 'Update your personal information and contact details',
        icon: 'User',
        linkHref: '/admin/profile',
        linkText: 'Edit Profile',
        category: 'frequent' as const,
        priority: 2,
        isActive: true
      },
      {
        title: 'Settings',
        description: 'Manage your website settings',
        icon: 'Settings',
        linkHref: '/admin/settings',
        linkText: 'Manage Settings',
        category: 'management' as const,
        priority: 3,
        isActive: true
      },
      {
        title: 'Family',
        description: 'Manage family members and their access',
        icon: 'Users',
        linkHref: '/admin/family',
        linkText: 'Manage Family',
        category: 'management' as const,
        priority: 4,
        isActive: true
      },
      {
        title: 'Expertise',
        description: 'Manage your skills, certifications and professional competencies',
        icon: 'Star',
        linkHref: '/admin/expertise',
        linkText: 'Manage Expertise',
        category: 'content' as const,
        priority: 5,
        isActive: true
      },
      {
        title: 'My Works',
        description: 'Manage your research publications and legal case studies',
        icon: 'Award',
        linkHref: '/admin/works',
        linkText: 'Manage Works',
        category: 'content' as const,
        priority: 6,
        isActive: true
      },
      {
        title: 'Case Vault',
        description: 'Manage legal case studies and research',
        icon: 'Briefcase',
        linkHref: '/admin/casevault',
        linkText: 'Manage Cases',
        category: 'content' as const,
        priority: 7,
        isActive: true
      },
      {
        title: 'URL Shortener',
        description: 'Create and manage short URLs',
        icon: 'Link',
        linkHref: '/admin/url-shortner',
        linkText: 'Manage URLs',
        category: 'tools' as const,
        priority: 8,
        isActive: true
      },
      {
        title: 'Subscribers',
        description: 'View and manage newsletter subscribers',
        icon: 'Users',
        linkHref: '/admin/subscribers',
        linkText: 'Manage Subscribers',
        category: 'management' as const,
        priority: 9,
        isActive: true
      },
      {
        title: 'Footer',
        description: 'Customize footer content and settings',
        icon: 'FileText',
        linkHref: '/admin/footer',
        linkText: 'Manage Footer',
        category: 'management' as const,
        priority: 10,
        isActive: true
      }
    ]
    
    // If no sections existed, create all defaults
    if (existingSections.length === 0) {
      for (const sectionData of defaultSections) {
        await createAdminSection(sectionData)
      }
      return
    }
    
    // For existing sections, add missing ones and update existing ones to match defaults
    const existingByHref = new Map(existingSections.map(s => [s.linkHref, s]))
    
    for (const defaultSection of defaultSections) {
      const existing = existingByHref.get(defaultSection.linkHref)
      
      if (!existing) {
        // Add missing section
        await createAdminSection(defaultSection)
      } else if (existing.category !== defaultSection.category || existing.priority !== defaultSection.priority) {
        // Update existing section to match defaults
        await updateAdminSection(existing.id, {
          title: defaultSection.title,
          description: defaultSection.description,
          icon: defaultSection.icon,
          category: defaultSection.category,
          priority: defaultSection.priority
        })
      }
    }
    
    // Remove duplicate sections with the same linkHref (keep only the first one)
    const allSections = await redis.hgetall(REDIS_KEYS.ADMIN_SECTIONS) as Record<string, string>
    if (allSections) {
      const sectionsByHref = new Map<string, string>()
      const toDelete: string[] = []
      
      for (const [id, sectionStr] of Object.entries(allSections)) {
        const section = typeof sectionStr === 'string' ? JSON.parse(sectionStr) : sectionStr
        
        if (!sectionsByHref.has(section.linkHref)) {
          sectionsByHref.set(section.linkHref, id)
        } else {
          // This is a duplicate, mark for deletion
          toDelete.push(id)
        }
      }
      
      // Delete all duplicates
      for (const id of toDelete) {
        await redis.hdel(REDIS_KEYS.ADMIN_SECTIONS, id)
      }
    }
    
    console.log('Default admin sections initialized')
  } catch (error) {
    console.error('Error initializing default sections:', error)
  }
}