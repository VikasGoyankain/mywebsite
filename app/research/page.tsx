'use client'

import { useState, useEffect, useRef } from 'react'
import { ResearchCard } from '@/components/research/research-card'
import { ResearchFilters } from '@/components/research/research-filters'
import { ResearchStudy } from '@/lib/models/research'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, BookOpen, ChevronRight, ArrowUpRight, TrendingUp, Filter, BookOpenCheck } from 'lucide-react'
import { useProfileStore } from "@/lib/profile-store"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { Footer } from "@/components/Footer"
import Image from "next/image"
import { motion } from 'framer-motion'

export default function ResearchPage() {
  const [studies, setStudies] = useState<ResearchStudy[]>([])
  const [filteredStudies, setFilteredStudies] = useState<ResearchStudy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isFiltered, setIsFiltered] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const { profileData } = useProfileStore()
  const filtersRef = useRef<HTMLDivElement>(null)

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

  const toggleFilters = () => {
    setShowFilters(!showFilters)
    if (showFilters && filtersRef.current) {
      filtersRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Hero Section with Gradient Background */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-grid-white opacity-20"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-700/20 via-transparent to-transparent hero-animate"></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-900/70" />
        <div className="relative h-full flex flex-col justify-center items-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white tracking-tight">
              Research <span className="text-blue-200">Publications</span>
            </h1>
          </motion.div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
            <path fill="#f8fafc" fillOpacity="1" d="M0,256L48,240C96,224,192,192,288,192C384,192,480,224,576,229.3C672,235,768,213,864,202.7C960,192,1056,192,1152,192C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="py-12 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <p className="text-4xl font-bold text-blue-600">{studies.length}</p>
              <p className="text-gray-600 text-sm mt-1">Total Publications</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <p className="text-4xl font-bold text-indigo-600">{availableDomains.length}</p>
              <p className="text-gray-600 text-sm mt-1">Research Domains</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <p className="text-4xl font-bold text-purple-600">{availableYears.length > 0 ? Math.max(...availableYears) : new Date().getFullYear()}</p>
              <p className="text-gray-600 text-sm mt-1">Latest Research</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <p className="text-4xl font-bold text-teal-600">{studies.filter(study => study.featured).length}</p>
              <p className="text-gray-600 text-sm mt-1">Featured Studies</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Research Section */}
      <section id="all-research" className="py-16 bg-white" ref={filtersRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <Badge variant="outline" className="mb-2 border-indigo-200 text-indigo-700">
                Research Collection
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900">All Publications</h2>
            </div>
            <Button 
              onClick={toggleFilters}
              variant="outline" 
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>

          {/* Advanced Search & Filters */}
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <Card className="p-6 border-0 shadow-md bg-gradient-to-r from-blue-50 to-indigo-50">
                <ResearchFilters
                  onSearch={handleSearch}
                  onFilter={handleFilter}
                  availableDomains={availableDomains}
                  availableYears={availableYears}
                  clearFilters={clearFilters}
                  isFiltered={isFiltered}
                />
              </Card>
            </motion.div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
              <p>{error}</p>
            </div>
          )}
          
          {isFiltered && filteredStudies.length > 0 && (
            <div className="flex items-center justify-between mb-6 bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700">
                Showing {filteredStudies.length} {filteredStudies.length === 1 ? 'result' : 'results'}
              </p>
              <button 
                onClick={clearFilters}
                className="text-sm text-blue-700 hover:text-blue-900 flex items-center gap-1 font-medium"
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
              <Button 
                onClick={clearFilters}
                variant="outline"
                className="text-blue-600 hover:text-blue-800"
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudies.map((study, index) => (
                <motion.div
                  key={study.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ResearchCard study={study} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
} 