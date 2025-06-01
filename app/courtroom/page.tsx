'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, Search, Filter, Briefcase, Gavel, Scale, Award } from 'lucide-react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'

// Case type definition
interface Case {
  id: string
  title: string
  court: string
  category: string
  year: string
  outcome: 'In favour of client' | 'Lost' | 'Ongoing' | 'Settlement' | 'Dismissed'
  description: string
  fullDescription?: string
}

export default function CourtroomExperience() {
  // State for cases data
  const [cases, setCases] = useState<Case[]>([])
  const [filteredCases, setFilteredCases] = useState<Case[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  
  // State for filters - initialize with 'all' instead of empty strings
  const [searchQuery, setSearchQuery] = useState('')
  const [courtFilter, setCourtFilter] = useState<string>('all')
  const [yearFilter, setYearFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  
  // State for expanded case descriptions
  const [expandedCases, setExpandedCases] = useState<Record<string, boolean>>({})
  
  // Fetch cases from API
  useEffect(() => {
    const fetchCases = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/cases')
        
        if (!response.ok) {
          throw new Error('Failed to fetch cases')
        }
        
        const data = await response.json()
        setCases(data)
        setFilteredCases(data)
      } catch (error: any) {
        console.error('Error fetching cases:', error)
        setError(error.message || 'An error occurred while fetching cases')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchCases()
  }, [])
  
  // Apply filters - check for 'all' instead of empty strings
  useEffect(() => {
    let result = [...cases]
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        item => 
          item.title.toLowerCase().includes(query) || 
          item.description.toLowerCase().includes(query) ||
          item.court.toLowerCase().includes(query)
      )
    }
    
    if (yearFilter && yearFilter !== "all") {
      result = result.filter(item => item.year === yearFilter)
    }
    
    if (courtFilter && courtFilter !== "all") {
      result = result.filter(item => item.court === courtFilter)
    }
    
    if (categoryFilter && categoryFilter !== "all") {
      result = result.filter(item => item.category === categoryFilter)
    }
    
    setFilteredCases(result)
  }, [cases, searchQuery, courtFilter, yearFilter, categoryFilter])
  
  // Toggle case description expansion
  const toggleExpand = (caseId: string) => {
    setExpandedCases(prev => ({
      ...prev,
      [caseId]: !prev[caseId]
    }))
  }
  
  // Get unique courts, years, and categories for filters
  const courts = Array.from(new Set(cases.map(c => c.court))).sort()
  const years = Array.from(new Set(cases.map(c => c.year))).sort((a, b) => Number(b) - Number(a))
  const categories = Array.from(new Set(cases.map(c => c.category))).sort()
  
  // Helper function for outcome badge color
  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'In favour of client':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'Lost':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'Ongoing':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'Settlement':
        return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'Dismissed':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }
  
  // Use sample data if no cases are loaded (for development)
  useEffect(() => {
    if (!isLoading && cases.length === 0 && !error) {
      const sampleCases: Case[] = [
        {
          id: 'case-001',
          title: 'State vs. Sharma',
          court: 'Delhi High Court',
          category: 'Criminal Defense',
          year: '2023',
          outcome: 'In favour of client',
          description: 'Successfully defended a wrongfully accused client in a high-profile fraud case.',
          fullDescription: 'Successfully defended a wrongfully accused client in a high-profile fraud case. Secured acquittal through meticulous evidence examination and procedural challenges. Case involved complex financial documentation and multiple witness testimonies that were effectively cross-examined to establish reasonable doubt.'
        },
        {
          id: 'case-002',
          title: 'ABC Corp vs. XYZ Ltd',
          court: 'National Company Law Tribunal',
          category: 'Corporate',
          year: '2022',
          outcome: 'Settlement',
          description: 'Negotiated a favorable settlement in a corporate dispute over intellectual property rights.',
          fullDescription: 'Negotiated a favorable settlement in a corporate dispute over intellectual property rights. The settlement included licensing agreements and monetary compensation that preserved the client\'s business operations while acknowledging the importance of the contested intellectual property.'
        },
        {
          id: 'case-003',
          title: 'Singh Family Property Dispute',
          court: 'Civil Court',
          category: 'Civil',
          year: '2022',
          outcome: 'Ongoing',
          description: 'Representing multiple family members in a complex inheritance dispute involving ancestral property.',
          fullDescription: 'Representing multiple family members in a complex inheritance dispute involving ancestral property. The case involves interpretation of traditional family customs alongside modern property law, requiring extensive research into precedents and family documentation dating back several generations.'
        },
        {
          id: 'case-004',
          title: 'Environmental Protection Agency vs. Industrial Manufacturers Association',
          court: 'Supreme Court',
          category: 'Environmental Law',
          year: '2021',
          outcome: 'Lost',
          description: 'Represented industry association in challenge to new environmental regulations.',
          fullDescription: 'Represented industry association in challenge to new environmental regulations. Despite presenting compelling economic impact assessments, the court upheld the regulations citing constitutional provisions for environmental protection. Case established important precedent for balancing industrial development with environmental concerns.'
        }
      ]
      
      setCases(sampleCases)
      setFilteredCases(sampleCases)
    }
  }, [isLoading, cases.length, error])
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-12 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <Link 
            href="/" 
            className="inline-flex items-center mb-6 text-blue-100 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Profile
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                <Gavel className="w-8 h-8" />
                Legal Case Portfolio
              </h1>
              <p className="mt-2 text-blue-100 max-w-2xl">
                A comprehensive record of court cases, legal proceedings, and judicial matters handled 
                across various courts, tribunals, and legal disciplines.
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Badge className="bg-blue-800 hover:bg-blue-700 text-white">
                {filteredCases.length} Cases
              </Badge>
              <Badge className="bg-green-700 hover:bg-green-600 text-white">
                {filteredCases.filter(c => c.outcome === 'In favour of client').length} Won
              </Badge>
              <Badge className="bg-yellow-600 hover:bg-yellow-500 text-white">
                {filteredCases.filter(c => c.outcome === 'Ongoing').length} Ongoing
              </Badge>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {/* Filters */}
        <Card className="p-4 md:p-6 mb-8 bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search cases by title, court or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map(year => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={courtFilter} onValueChange={setCourtFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by Court" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courts</SelectItem>
                  {courts.map(court => (
                    <SelectItem key={court} value={court}>
                      {court}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Active filters */}
          {(searchQuery || yearFilter !== 'all' || courtFilter !== 'all' || categoryFilter !== 'all') && (
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-500 flex items-center">
                <Filter className="w-3 h-3 mr-1" /> Active filters:
              </span>
              
              {searchQuery && (
                <Badge variant="outline" className="gap-1 bg-blue-50">
                  Search: {searchQuery}
                  <button onClick={() => setSearchQuery('')} className="ml-1 text-gray-500 hover:text-gray-700">×</button>
                </Badge>
              )}
              
              {yearFilter !== 'all' && (
                <Badge variant="outline" className="gap-1 bg-blue-50">
                  Year: {yearFilter}
                  <button onClick={() => setYearFilter('all')} className="ml-1 text-gray-500 hover:text-gray-700">×</button>
                </Badge>
              )}
              
              {courtFilter !== 'all' && (
                <Badge variant="outline" className="gap-1 bg-blue-50">
                  Court: {courtFilter}
                  <button onClick={() => setCourtFilter('all')} className="ml-1 text-gray-500 hover:text-gray-700">×</button>
                </Badge>
              )}
              
              {categoryFilter !== 'all' && (
                <Badge variant="outline" className="gap-1 bg-blue-50">
                  Category: {categoryFilter}
                  <button onClick={() => setCategoryFilter('all')} className="ml-1 text-gray-500 hover:text-gray-700">×</button>
                </Badge>
              )}
              
              {(searchQuery || yearFilter !== 'all' || courtFilter !== 'all' || categoryFilter !== 'all') && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setSearchQuery('')
                    setYearFilter('all')
                    setCourtFilter('all')
                    setCategoryFilter('all')
                  }}
                  className="ml-auto text-xs"
                >
                  Clear all filters
                </Button>
              )}
            </div>
          )}
        </Card>
        
        {/* Cases Grid */}
        <div className="space-y-6">
          {isLoading ? (
            // Loading skeletons
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="p-5 bg-white/80 backdrop-blur-sm">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-7 w-2/3" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </Card>
            ))
          ) : error ? (
            <Card className="p-6 bg-red-50 border-red-200">
              <div className="text-center text-red-800">
                <h3 className="text-lg font-semibold mb-2">Error Loading Cases</h3>
                <p>{error}</p>
                <Button 
                  variant="outline" 
                  className="mt-4 border-red-300 text-red-700 hover:bg-red-100"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </div>
            </Card>
          ) : filteredCases.length === 0 ? (
            <Card className="p-6 bg-white/80 backdrop-blur-sm">
              <div className="text-center text-gray-600">
                <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <h3 className="text-lg font-semibold mb-2">No Cases Found</h3>
                <p>No cases match your current filter criteria. Try adjusting your filters.</p>
              </div>
            </Card>
          ) : (
            filteredCases.map(caseItem => (
              <Card 
                key={caseItem.id} 
                className="overflow-hidden bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow duration-300"
              >
                <div className="border-l-4 border-blue-700 p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
                          <Briefcase className="w-5 h-5 mr-2 text-blue-700" />
                          {caseItem.title}
                        </h3>
                        <Badge className={`${getOutcomeColor(caseItem.outcome)} ml-2`}>
                          {caseItem.outcome}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <Gavel className="w-4 h-4 mr-1 text-gray-500" />
                          {caseItem.court}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Scale className="w-4 h-4 mr-1 text-gray-500" />
                          <Badge variant="outline" className="bg-gray-50">
                            {caseItem.category}
                          </Badge>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Award className="w-4 h-4 mr-1 text-gray-500" />
                          {caseItem.year}
                        </div>
                      </div>
                      
                      <div className="text-gray-700">
                        {expandedCases[caseItem.id] && caseItem.fullDescription ? 
                          caseItem.fullDescription : 
                          caseItem.description
                        }
                      </div>
                      
                      {caseItem.fullDescription && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => toggleExpand(caseItem.id)}
                          className="mt-2 text-blue-600 hover:text-blue-800 p-0 h-auto font-normal"
                        >
                          {expandedCases[caseItem.id] ? 'View Less' : 'View More'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 