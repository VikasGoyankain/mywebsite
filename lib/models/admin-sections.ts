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
  createdAt: Date
  updatedAt: Date
  usageCount: number
  lastUsed?: Date
}

export interface AdminSectionUsage {
  id: string
  sectionId: string
  accessedAt: Date
  userId?: string
  sessionId?: string
}

export interface AdminSectionAnalytics {
  sectionId: string
  totalUsage: number
  dailyUsage: number
  weeklyUsage: number
  monthlyUsage: number
  lastUsed: Date
  averageSessionDuration?: number
} 