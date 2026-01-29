import { kv } from '@vercel/kv'
import { ResearchStudy, DEFAULT_RESEARCH_STUDIES } from '../models/research'

const RESEARCH_KEY = 'research:studies'
const RESEARCH_VIEWS_KEY = 'research:views'

export async function getAllResearchStudies(): Promise<ResearchStudy[]> {
  try {
    const studies = await kv.get<ResearchStudy[]>(RESEARCH_KEY)
    return studies || DEFAULT_RESEARCH_STUDIES
  } catch (error) {
    console.error('Failed to fetch research studies:', error)
    return DEFAULT_RESEARCH_STUDIES
  }
}

export async function getResearchStudyById(id: string): Promise<ResearchStudy | null> {
  try {
    const studies = await getAllResearchStudies()
    const study = studies.find(s => s.id === id)
    
    if (study) {
      // Increment view count
      await incrementViewCount(id)
      // Get latest view count
      const views = await getViewCount(id)
      return { ...study, views: views || study.views }
    }
    
    return null
  } catch (error) {
    console.error(`Failed to fetch research study ${id}:`, error)
    return null
  }
}

export async function createResearchStudy(study: Omit<ResearchStudy, 'id' | 'views' | 'publishedAt'>): Promise<ResearchStudy> {
  try {
    const studies = await getAllResearchStudies()
    const newId = generateId()
    const now = new Date().toISOString()
    
    const newStudy: ResearchStudy = {
      ...study,
      id: newId,
      views: 0,
      publishedAt: now
    }
    
    await kv.set(RESEARCH_KEY, [...studies, newStudy])
    return newStudy
  } catch (error) {
    console.error('Failed to create research study:', error)
    throw new Error('Failed to create research study')
  }
}

export async function updateResearchStudy(id: string, data: Partial<ResearchStudy>): Promise<ResearchStudy | null> {
  try {
    const studies = await getAllResearchStudies()
    const index = studies.findIndex(s => s.id === id)
    
    if (index === -1) return null
    
    const updatedStudy = { ...studies[index], ...data }
    studies[index] = updatedStudy
    
    await kv.set(RESEARCH_KEY, studies)
    return updatedStudy
  } catch (error) {
    console.error(`Failed to update research study ${id}:`, error)
    return null
  }
}

export async function deleteResearchStudy(id: string): Promise<boolean> {
  try {
    const studies = await getAllResearchStudies()
    const filteredStudies = studies.filter(s => s.id !== id)
    
    if (filteredStudies.length === studies.length) {
      return false
    }
    
    await kv.set(RESEARCH_KEY, filteredStudies)
    // Also delete view count
    await kv.hdel(RESEARCH_VIEWS_KEY, id)
    return true
  } catch (error) {
    console.error(`Failed to delete research study ${id}:`, error)
    return false
  }
}

export async function searchResearchStudies(query: string): Promise<ResearchStudy[]> {
  try {
    const studies = await getAllResearchStudies()
    const normalizedQuery = query.toLowerCase().trim()
    
    return studies.filter(study => {
      return (
        study.title.toLowerCase().includes(normalizedQuery) ||
        study.abstract.toLowerCase().includes(normalizedQuery) ||
        study.domain.toLowerCase().includes(normalizedQuery) ||
        study.tags.some(tag => tag.toLowerCase().includes(normalizedQuery))
      )
    })
  } catch (error) {
    console.error('Failed to search research studies:', error)
    return []
  }
}

export async function filterResearchStudies(filters: {
  domain?: string;
  year?: number;
  tags?: string[];
}): Promise<ResearchStudy[]> {
  try {
    const studies = await getAllResearchStudies()
    
    return studies.filter(study => {
      const domainMatch = !filters.domain || study.domain === filters.domain
      const yearMatch = !filters.year || study.year === filters.year
      const tagsMatch = !filters.tags?.length || 
        filters.tags.some(tag => study.tags.includes(tag))
      
      return domainMatch && yearMatch && tagsMatch
    })
  } catch (error) {
    console.error('Failed to filter research studies:', error)
    return []
  }
}

export async function getFeaturedResearchStudies(): Promise<ResearchStudy[]> {
  try {
    const studies = await getAllResearchStudies()
    return studies.filter(study => study.featured)
  } catch (error) {
    console.error('Failed to fetch featured research studies:', error)
    return []
  }
}

export async function getRecentResearchStudies(limit = 5): Promise<ResearchStudy[]> {
  try {
    const studies = await getAllResearchStudies()
    return studies
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit)
  } catch (error) {
    console.error('Failed to fetch recent research studies:', error)
    return []
  }
}

export async function initializeDefaultResearchStudies(): Promise<boolean> {
  try {
    const exists = await kv.exists(RESEARCH_KEY)
    
    if (!exists) {
      await kv.set(RESEARCH_KEY, DEFAULT_RESEARCH_STUDIES)
      return true
    }
    
    return false
  } catch (error) {
    console.error('Failed to initialize default research studies:', error)
    return false
  }
}

// View counting functionality
async function incrementViewCount(studyId: string): Promise<number> {
  try {
    return await kv.hincrby(RESEARCH_VIEWS_KEY, studyId, 1)
  } catch (error) {
    console.error(`Failed to increment view count for study ${studyId}:`, error)
    return 0
  }
}

async function getViewCount(studyId: string): Promise<number> {
  try {
    const count = await kv.hget<number>(RESEARCH_VIEWS_KEY, studyId)
    return count || 0
  } catch (error) {
    console.error(`Failed to get view count for study ${studyId}:`, error)
    return 0
  }
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
} 