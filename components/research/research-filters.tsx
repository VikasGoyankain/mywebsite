'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex w-full max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search research studies..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button type="submit" className="ml-2">
          Search
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-4">
        <div className="space-y-1 min-w-[180px]">
          <Label htmlFor="domain">Domain</Label>
          <Select value={selectedDomain} onValueChange={handleDomainChange}>
            <SelectTrigger id="domain">
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
        </div>

        <div className="space-y-1 min-w-[120px]">
          <Label htmlFor="year">Year</Label>
          <Select value={selectedYear} onValueChange={handleYearChange}>
            <SelectTrigger id="year">
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
        </div>

        {isFiltered && (
          <Button 
            variant="ghost" 
            onClick={handleClearFilters} 
            className="h-9 px-2 lg:px-3 mt-6"
          >
            <X className="mr-2 h-4 w-4" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  )
} 