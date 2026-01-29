'use client'

import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, MapPin, Tag, User, Download, BookOpen, Scale, Gavel, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import CaseCard from './components/CaseCard';
import CaseFilters from './components/CaseFilters';
import AdvancedSearch from './components/AdvancedSearch';
import StatsOverview from './components/StatsOverview';
import MobileFilters from './components/MobileFilters';
import { Case } from './data/mockCases';
import { Skeleton } from '@/components/ui/skeleton';
import { Footer } from '@/app/components/Footer';
import Head from 'next/head';
import Script from 'next/script';

export default function CaseVault() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    legalArea: 'all',
    year: 'all',
    court: 'all',
    stage: 'all',
    caseType: 'all',
    outcome: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState('latest');

  // Fetch cases from the API
  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/casevault');
        
        if (!response.ok) {
          throw new Error('Failed to fetch cases');
        }
        
        const data = await response.json();
        setCases(data);
      } catch (err) {
        console.error('Error fetching cases:', err);
        setError('Failed to load cases. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCases();
  }, []);

  // Generate search suggestions from existing data
  const searchSuggestions = React.useMemo(() => {
    const suggestions = new Set<string>();
    
    cases.forEach(caseItem => {
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
  }, [cases]);

  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = searchQuery === '' || 
      caseItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.citation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      caseItem.court.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.legalArea.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilters = 
      (selectedFilters.legalArea === 'all' || caseItem.legalArea === selectedFilters.legalArea) &&
      (selectedFilters.year === 'all' || caseItem.year.toString() === selectedFilters.year) &&
      (selectedFilters.court === 'all' || caseItem.court === selectedFilters.court) &&
      (selectedFilters.stage === 'all' || caseItem.stage === selectedFilters.stage) &&
      (selectedFilters.outcome === 'all' || caseItem.outcome === selectedFilters.outcome);

    const matchesCaseType = 
      selectedFilters.caseType === 'all' ||
      (selectedFilters.caseType === 'own' && caseItem.isOwnCase) ||
      (selectedFilters.caseType === 'briefs' && !caseItem.isOwnCase);

    return matchesSearch && matchesFilters && matchesCaseType;
  });

  // Sort the filtered cases based on the selected sort option
  const sortedCases = [...filteredCases].sort((a, b) => {
    switch (sortOption) {
      case 'latest':
        return new Date(b.judgmentDate).getTime() - new Date(a.judgmentDate).getTime();
      case 'oldest':
        return new Date(a.judgmentDate).getTime() - new Date(b.judgmentDate).getTime();
      case 'relevance':
        // Simple relevance sorting - prioritize title matches
        if (searchQuery) {
          const aTitle = a.title.toLowerCase();
          const bTitle = b.title.toLowerCase();
          const query = searchQuery.toLowerCase();
          if (aTitle.includes(query) && !bTitle.includes(query)) return -1;
          if (!aTitle.includes(query) && bTitle.includes(query)) return 1;
        }
        return 0;
      default:
        return 0;
    }
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
      return value !== 'all';
    }).length;
  };

  // Generate structured data for the case collection
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "CaseVault - Legal Research & Litigation Manager",
    "description": "Comprehensive legal research database with detailed case summaries and litigation records",
    "url": "https://vikasgoyanka.in/casevault",
    "author": {
      "@type": "Person",
      "name": "Vikas Goyanka",
      "url": "https://vikasgoyanka.in"
    },
    "about": {
      "@type": "Thing",
      "name": "Legal Case Database"
    },
    "keywords": "legal research, case law, litigation, legal database, court cases, law student resources"
  };

  return (
    <>
      <Head>
        <title>CaseVault | Legal Research & Litigation Manager | Vikas Goyanka</title>
        <meta name="description" content="Comprehensive legal research database with detailed case summaries and litigation records. Search and explore case law for legal research." />
        <meta name="keywords" content="legal research, case law, litigation, legal database, court cases, law student resources, Vikas Goyanka" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="CaseVault | Legal Research & Litigation Manager" />
        <meta property="og:description" content="Comprehensive legal research database with detailed case summaries and litigation records" />
        <meta property="og:url" content="https://vikasgoyanka.in/casevault" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="CaseVault | Legal Research & Litigation Manager" />
        <meta property="twitter:description" content="Comprehensive legal research database with detailed case summaries and litigation records" />
      </Head>

      <Script id="casevault-structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>

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
                <Link href="https://vikasgoyanka.in" target="_blank" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center">
                  <span className="hidden md:inline">A project by</span>
                  <span className="font-semibold ml-1">Vikas Goyanka</span>
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Link>
                <div className="h-4 w-px bg-border mx-1 hidden md:block"></div>
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

        {/* Title Section with Dark Background */}
        <section className="legal-gradient text-white py-8">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-2">Case Law Explorer</h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Comprehensive legal research database with detailed case summaries and litigation records
            </p>
          </div>
        </section>

        {/* Professional Legal Experience */}
        <div className="container mx-auto px-4 py-6">
          <StatsOverview cases={cases} loading={loading} />
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 pb-8">
          {/* Search and Filters Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="w-full md:w-auto flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search cases, citations, tags..."
                  className="pl-8 pr-4"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <MobileFilters
                filters={selectedFilters}
                onFiltersChange={setSelectedFilters}
                activeFiltersCount={getActiveFiltersCount()}
                cases={cases}
              />
              
              <Select 
                value={sortOption}
                onValueChange={setSortOption}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="relevance">Most Relevant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Info */}
          <div className="mb-6">
            {loading ? (
              <Skeleton className="h-6 w-48 mb-2" />
            ) : (
              <h3 className="text-xl font-semibold">
                {filteredCases.length} Cases Found
              </h3>
            )}
            {loading ? (
              <Skeleton className="h-4 w-64" />
            ) : (
              <p className="text-muted-foreground">
                Showing results for "{getResultsDescription()}"
              </p>
            )}
          </div>

          {/* Cases Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="h-64">
                  <div className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-1/2 mb-6" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-6" />
                    <div className="flex justify-between">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <Gavel className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error loading cases</h3>
              <p className="text-muted-foreground mb-4">
                {error}
              </p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedCases.map((caseItem) => (
                <CaseCard key={caseItem.id} case={caseItem} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
} 