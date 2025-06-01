'use client'

import { useState, useEffect } from 'react'
import { ResearchCard } from '@/components/research/research-card'
import { ResearchFilters } from '@/components/research/research-filters'
import { ResearchStudy, ResearchDomain } from '@/lib/models/research'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { BookOpen, FileText, Award, ScrollText, Search } from 'lucide-react'

export default function ResearchPage() {
  const [studies, setStudies] = useState<ResearchStudy[]>([])
  const [filteredStudies, setFilteredStudies] = useState<ResearchStudy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isFiltered, setIsFiltered] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  // Extract unique domains and years for filters
  const availableDomains = Array.from(
    new Set(studies.map((study) => study.domain))
  ).sort()

  const availableYears = Array.from(
    new Set(studies.map((study) => study.year))
  ).sort((a, b) => b - a) // Sort years in descending order

  useEffect(() => {
    const fetchStudies = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/research')
        
        if (!response.ok) {
          throw new Error('Failed to fetch research studies')
        }
        
        const data = await response.json()
        setStudies(data)
        setFilteredStudies(data)
      } catch (err: any) {
        setError(err.message || 'Failed to load research studies')
      } finally {
        setLoading(false)
      }
    }
    
    fetchStudies()
  }, [])

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setFilteredStudies(studies)
      setIsFiltered(false)
      return
    }

    setIsFiltered(true)
    setLoading(true)

    try {
      const response = await fetch(`/api/research?query=${encodeURIComponent(query)}`)
      
      if (!response.ok) {
        throw new Error('Failed to search research studies')
      }
      
      const data = await response.json()
      setFilteredStudies(data)
    } catch (err: any) {
      setError(err.message || 'Failed to search research studies')
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = async (domain: string, year: number | null) => {
    // If no filters selected, show all studies
    if (domain === 'all' && !year) {
      setFilteredStudies(studies)
      setIsFiltered(false)
      return
    }

    setIsFiltered(true)
    setLoading(true)

    try {
      let url = '/api/research?'
      
      if (domain && domain !== 'all') {
        url += `domain=${encodeURIComponent(domain)}&`
      }
      
      if (year) {
        url += `year=${year}`
      }
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Failed to filter research studies')
      }
      
      const data = await response.json()
      setFilteredStudies(data)
    } catch (err: any) {
      setError(err.message || 'Failed to filter research studies')
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setFilteredStudies(studies)
    setIsFiltered(false)
  }

  const filterByTab = (tab: string) => {
    setActiveTab(tab)
    
    if (tab === 'all') {
      setFilteredStudies(studies)
      return
    }
    
    if (tab === 'featured') {
      setFilteredStudies(studies.filter(study => study.featured))
      return
    }
    
    // Filter by domain category
    const domainMap: Record<string, string[]> = {
      'law': [ResearchDomain.LAW, ResearchDomain.CONSTITUTION, ResearchDomain.HUMAN_RIGHTS],
      'policy': [ResearchDomain.POLITICS, ResearchDomain.GOVERNANCE, ResearchDomain.EDUCATION],
      'social': [ResearchDomain.SOCIAL_JUSTICE, ResearchDomain.ENVIRONMENT]
    }
    
    const domains = domainMap[tab] || []
    setFilteredStudies(studies.filter(study => domains.includes(study.domain)))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pb-16">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Research Studies
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto text-blue-100">
              Explore original research across law, policy, education, and governance. 
              <span className="hidden sm:inline"> These publications represent significant contributions 
              to academic discourse and policy development.</span>
            </p>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <ResearchFilters
            onSearch={handleSearch}
            onFilter={handleFilter}
            availableDomains={availableDomains}
            availableYears={availableYears}
            clearFilters={clearFilters}
            isFiltered={isFiltered}
          />
        </div>
        
        <Tabs value={activeTab} onValueChange={filterByTab} className="mb-8">
          <TabsList className="mx-auto flex justify-center rounded-lg bg-slate-100 p-1">
            <TabsTrigger value="all" className="flex items-center gap-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <ScrollText className="h-4 w-4" />
              <span className="hidden sm:inline">All Studies</span>
              <span className="sm:hidden">All</span>
            </TabsTrigger>
            <TabsTrigger value="featured" className="flex items-center gap-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Featured</span>
              <span className="sm:hidden">Featured</span>
            </TabsTrigger>
            <TabsTrigger value="law" className="flex items-center gap-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Law</span>
              <span className="sm:hidden">Law</span>
            </TabsTrigger>
            <TabsTrigger value="policy" className="flex items-center gap-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Policy</span>
              <span className="sm:hidden">Policy</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <ScrollText className="h-4 w-4" />
              <span className="hidden sm:inline">Social Justice</span>
              <span className="sm:hidden">Social</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
            <p>{error}</p>
          </div>
        )}
        
        {isFiltered && filteredStudies.length > 0 && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">
              Showing {filteredStudies.length} {filteredStudies.length === 1 ? 'result' : 'results'}
            </p>
            <button 
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Clear filters
            </button>
          </div>
        )}
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex flex-col space-y-3">
                <Skeleton className="h-48 w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredStudies.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No research studies found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your filters or search terms</p>
            <button 
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
            {filteredStudies.map((study) => (
              <div key={study.id} className="transition-all duration-300 opacity-100 transform translate-y-0">
                <ResearchCard study={study} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 