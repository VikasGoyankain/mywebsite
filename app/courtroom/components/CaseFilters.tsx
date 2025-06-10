'use client'

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { mockCases } from '../data/mockCases';
import { CaseItem } from './CaseCard';

interface FiltersProps {
  filters: {
    legalArea: string;
    year: string;
    court: string;
    stage: string;
    caseType: string;
    outcome: string;
    complexityRating: number[];
  };
  onFiltersChange: (filters: any) => void;
}

const CaseFilters: React.FC<FiltersProps> = ({ filters, onFiltersChange }) => {
  // Extract unique values for filter options
  const legalAreas = Array.from(new Set(mockCases.map((c: CaseItem) => c.legalArea))).sort();
  const years = Array.from(new Set(mockCases.map((c: CaseItem) => c.year))).sort((a: number, b: number) => b - a);
  const courts = Array.from(new Set(mockCases.map((c: CaseItem) => c.court))).sort();
  const stages = Array.from(new Set(mockCases.map((c: CaseItem) => c.stage).filter(Boolean))).sort();
  const outcomes = Array.from(new Set(mockCases.map((c: CaseItem) => c.outcome).filter(Boolean))).sort();

  const handleChange = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const getComplexityLabel = (value: number) => {
    const labels = ['Any', 'Moderate', 'Complex', 'Very Complex', 'Landmark'];
    return labels[value - 1] || 'Any';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Filter Cases</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Case Type Filter */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Case Type</h4>
          <Tabs 
            defaultValue={filters.caseType} 
            value={filters.caseType}
            onValueChange={(value) => handleChange('caseType', value)}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="own">Litigated</TabsTrigger>
              <TabsTrigger value="briefs">Academic</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Separator />

        {/* Legal Area Filter */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Legal Area</h4>
          <Select 
            value={filters.legalArea || "all"} 
            onValueChange={(value) => handleChange('legalArea', value === "all" ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Areas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Areas</SelectItem>
              {legalAreas.map((area: string) => (
                <SelectItem key={area} value={area}>{area}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Court Filter */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Court</h4>
          <Select 
            value={filters.court || "all"} 
            onValueChange={(value) => handleChange('court', value === "all" ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Courts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courts</SelectItem>
              {courts.map((court: string) => (
                <SelectItem key={court} value={court}>{court}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year Filter */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Year</h4>
          <Select 
            value={filters.year || "all"} 
            onValueChange={(value) => handleChange('year', value === "all" ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map((year: number) => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stage Filter */}
        {stages.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Stage</h4>
            <Select 
              value={filters.stage || "all"} 
              onValueChange={(value) => handleChange('stage', value === "all" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {stages.map((stage) => {
                  if (stage) {
                    return <SelectItem key={stage} value={stage}>{stage}</SelectItem>;
                  }
                  return null;
                })}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Outcome Filter */}
        {outcomes.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Outcome</h4>
            <Select 
              value={filters.outcome || "all"} 
              onValueChange={(value) => handleChange('outcome', value === "all" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Outcomes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Outcomes</SelectItem>
                {outcomes.map((outcome) => {
                  if (outcome) {
                    return <SelectItem key={outcome} value={outcome}>{outcome}</SelectItem>;
                  }
                  return null;
                })}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Complexity Filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Min. Complexity</h4>
            <span className="text-sm text-muted-foreground">
              {getComplexityLabel(filters.complexityRating[0])}
            </span>
          </div>
          <Slider
            defaultValue={[1]}
            value={filters.complexityRating}
            min={1}
            max={5}
            step={1}
            onValueChange={(value) => handleChange('complexityRating', value)}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Any</span>
            <span>Landmark</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CaseFilters; 