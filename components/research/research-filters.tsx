'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from '@/components/ui/button'
import { Search, X, Filter, SlidersHorizontal, Calendar, BookOpen } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ResearchDomain } from '@/lib/models/research'

interface ResearchFiltersProps {
  onSearch: (query: string) => void
  onFilter: (domain: string, year: number | null) => void
  availableDomains: string[]
  availableYears: number[]
  clearFilters: () => void
  isFiltered: boolean
}

export function ResearchFilters({
  onSearch,
  onFilter,
  availableDomains,
  availableYears,
  clearFilters,
  isFiltered
}: ResearchFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDomain, setSelectedDomain] = useState<string>('all')
  const [selectedYear, setSelectedYear] = useState<string>('all')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery)
  }

  const handleDomainChange = (value: string) => {
    setSelectedDomain(value)
    onFilter(value === 'all' ? '' : value, selectedYear && selectedYear !== 'all' ? parseInt(selectedYear, 10) : null)
  }

  const handleYearChange = (value: string) => {
    setSelectedYear(value)
    onFilter(selectedDomain === 'all' ? '' : selectedDomain, value && value !== 'all' ? parseInt(value, 10) : null)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedDomain('all')
    setSelectedYear('all')
    clearFilters()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <SlidersHorizontal className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-lg">Advanced Search</h3>
      </div>
      
      <form onSubmit={handleSearch} className="flex w-full max-w-3xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by title, abstract, or keywords..."
            className="pl-10 h-12 text-base bg-white border-blue-100 focus:border-blue-300 focus:ring-blue-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button 
          type="submit" 
          className="ml-2 h-12 px-6 bg-blue-600 hover:bg-blue-700"
        >
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
      </form>

      <Separator className="my-4 bg-blue-100" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="domain" className="flex items-center text-sm font-medium text-gray-700">
            <BookOpen className="h-4 w-4 mr-2 text-blue-600" />
            Research Domain
          </Label>
          <Select value={selectedDomain} onValueChange={handleDomainChange}>
            <SelectTrigger id="domain" className="h-11 bg-white border-blue-100 focus:ring-blue-200">
              <SelectValue placeholder="All domains" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All domains</SelectItem>
              {availableDomains.map((domain) => (
                <SelectItem key={domain} value={domain}>
                  {domain}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedDomain !== 'all' && (
            <Badge className="mt-1 bg-blue-100 text-blue-800 hover:bg-blue-200 border-0">
              {selectedDomain}
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="year" className="flex items-center text-sm font-medium text-gray-700">
            <Calendar className="h-4 w-4 mr-2 text-blue-600" />
            Publication Year
          </Label>
          <Select value={selectedYear} onValueChange={handleYearChange}>
            <SelectTrigger id="year" className="h-11 bg-white border-blue-100 focus:ring-blue-200">
              <SelectValue placeholder="All years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedYear !== 'all' && (
            <Badge className="mt-1 bg-blue-100 text-blue-800 hover:bg-blue-200 border-0">
              {selectedYear}
            </Badge>
          )}
        </div>

        <div className="flex items-end">
          <Button 
            variant="outline" 
            onClick={handleClearFilters} 
            className="h-11 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 w-full"
          >
            <X className="mr-2 h-4 w-4" />
            Reset All Filters
          </Button>
        </div>
      </div>

      {isFiltered && (
        <div className="mt-4 pt-4 border-t border-blue-100">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Filter className="h-4 w-4" />
            <span>Filters applied. Showing filtered results.</span>
          </div>
        </div>
      )}
    </div>
  )
} 