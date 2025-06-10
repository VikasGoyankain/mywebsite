'use client'

import React, { useState } from 'react';
import { Search, Filter, Calendar, MapPin, Tag, User, Download, BookOpen, Scale, Gavel } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { mockCases } from '@/app/courtroom/data/mockCases';

// Import the components we need from casevault
import CaseCard from '@/app/courtroom/components/CaseCard';
import CaseFilters from '@/app/courtroom/components/CaseFilters';
import AdvancedSearch from '@/app/courtroom/components/AdvancedSearch';
import StatsOverview from '@/app/courtroom/components/StatsOverview';
import MobileFilters from '@/app/courtroom/components/MobileFilters';

export default function CourtroomPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    legalArea: '',
    year: '',
    court: '',
    stage: '',
    caseType: 'all',
    outcome: '',
    complexityRating: [1]
  });
  const [showFilters, setShowFilters] = useState(false);

  // Generate search suggestions from existing data
  const searchSuggestions = React.useMemo(() => {
    const suggestions = new Set<string>();
    
    mockCases.forEach(caseItem => {
      // Add case titles
      suggestions.add(caseItem.title);
      // Add citations
      suggestions.add(caseItem.citation);
      // Add tags
      caseItem.tags.forEach(tag => suggestions.add(tag));
      // Add courts
      suggestions.add(caseItem.court);
      // Add legal areas
      suggestions.add(caseItem.legalArea);
    });
    
    return Array.from(suggestions).sort();
  }, []);

  const filteredCases = mockCases.filter(caseItem => {
    const matchesSearch = searchQuery === '' || 
      caseItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.citation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      caseItem.court.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.legalArea.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilters = 
      (selectedFilters.legalArea === '' || caseItem.legalArea === selectedFilters.legalArea) &&
      (selectedFilters.year === '' || caseItem.year.toString() === selectedFilters.year) &&
      (selectedFilters.court === '' || caseItem.court === selectedFilters.court) &&
      (selectedFilters.stage === '' || caseItem.stage === selectedFilters.stage) &&
      (selectedFilters.outcome === '' || caseItem.outcome === selectedFilters.outcome) &&
      (selectedFilters.complexityRating[0] === 1 || (caseItem.complexityRating && caseItem.complexityRating >= selectedFilters.complexityRating[0]));

    const matchesCaseType = 
      selectedFilters.caseType === 'all' ||
      (selectedFilters.caseType === 'own' && caseItem.isOwnCase) ||
      (selectedFilters.caseType === 'briefs' && !caseItem.isOwnCase);

    return matchesSearch && matchesFilters && matchesCaseType;
  });

  const getResultsDescription = () => {
    if (selectedFilters.caseType === 'own') {
      return 'my litigated cases';
    } else if (selectedFilters.caseType === 'briefs') {
      return 'academic case briefs';
    } else {
      return searchQuery || 'all cases';
    }
  };

  const getActiveFiltersCount = () => {
    return Object.entries(selectedFilters).filter(([key, value]) => {
      if (key === 'caseType') return value !== 'all';
      if (key === 'complexityRating') return value[0] > 1;
      return value !== '';
    }).length;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Scale className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">CaseVault</h1>
                  <p className="text-sm text-muted-foreground">Legal Research & Litigation Manager</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/research">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Research
                </Link>
              </Button>
              {/* Admin link hidden - access via direct route only */}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="legal-gradient text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Case Law Explorer</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Comprehensive legal research database with detailed case summaries and litigation records
          </p>
          
          {/* Advanced Search Bar */}
          <AdvancedSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            suggestions={searchSuggestions}
            onSuggestionSelect={setSearchQuery}
          />
        </div>
      </section>

      {/* Statistics Overview */}
      <div className="container mx-auto px-4 py-8">
        <StatsOverview />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="lg:w-80 hidden lg:block">
            <div className="lg:sticky lg:top-32">
              <CaseFilters 
                filters={selectedFilters}
                onFiltersChange={setSelectedFilters}
              />
            </div>
          </div>

          {/* Cases Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1">
                <h3 className="text-xl font-semibold">
                  {filteredCases.length} Cases Found
                </h3>
                <p className="text-muted-foreground">
                  Showing results for "{getResultsDescription()}"
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Mobile Filters */}
                <MobileFilters
                  filters={selectedFilters}
                  onFiltersChange={setSelectedFilters}
                  activeFiltersCount={getActiveFiltersCount()}
                />
                
                <Select defaultValue="latest">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">Latest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="relevance">Most Relevant</SelectItem>
                    <SelectItem value="complexity">By Complexity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCases.map((caseItem) => (
                <CaseCard key={caseItem.id} case={caseItem} />
              ))}
            </div>

            {filteredCases.length === 0 && (
              <div className="text-center py-12">
                <Gavel className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No cases found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or filters
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 