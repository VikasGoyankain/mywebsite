'use client'

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Filter, RotateCcw } from 'lucide-react';
import { Case } from '../data/mockCases';

interface CaseFiltersProps {
  filters: {
    legalArea: string;
    year: string;
    court: string;
    stage: string;
    caseType: string;
    outcome: string;
  };
  onFiltersChange: (filters: any) => void;
  cases: Case[];
}

const CaseFilters: React.FC<CaseFiltersProps> = ({ filters, onFiltersChange, cases }) => {
  // Extract unique values from the actual data for filter options
  const [legalAreas, setLegalAreas] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [courts, setCourts] = useState<string[]>([]);
  const [stages, setStages] = useState<string[]>([]);
  const [outcomes, setOutcomes] = useState<string[]>([]);
  
  // Update filter options whenever cases data changes
  useEffect(() => {
    if (cases && cases.length > 0) {
      setLegalAreas(Array.from(new Set(cases.map(c => c.legalArea))).sort());
      setYears(Array.from(new Set(cases.map(c => c.year.toString()))).sort((a, b) => b.localeCompare(a)));
      setCourts(Array.from(new Set(cases.map(c => c.court))).sort());
      setStages(Array.from(new Set(cases.map(c => c.stage).filter(Boolean) as string[])).sort());
      // Only include defined outcomes
      setOutcomes(Array.from(new Set(cases.filter(c => c.outcome).map(c => c.outcome as string))).sort());
    }
  }, [cases]);

  const handleReset = () => {
    onFiltersChange({
      legalArea: 'all',
      year: 'all',
      court: 'all',
      stage: 'all',
      caseType: 'all',
      outcome: 'all'
    });
  };

  return (
    <Card className="sticky top-20">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          Filter Cases
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleReset}
          className="h-8 w-8 p-0"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Case Type */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Case Type</Label>
          <RadioGroup
            value={filters.caseType}
            onValueChange={(value) => onFiltersChange({ ...filters, caseType: value })}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all" className="cursor-pointer">All Cases</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="own" id="own" />
              <Label htmlFor="own" className="cursor-pointer">My Litigated Cases</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="briefs" id="briefs" />
              <Label htmlFor="briefs" className="cursor-pointer">Academic Briefs</Label>
            </div>
          </RadioGroup>
        </div>

        <Separator />

        {/* Legal Area */}
        {legalAreas.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="legal-area" className="text-sm font-medium">Legal Area</Label>
            <Select
              value={filters.legalArea}
              onValueChange={(value) => onFiltersChange({ ...filters, legalArea: value })}
            >
              <SelectTrigger id="legal-area">
                <SelectValue placeholder="All Areas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Areas</SelectItem>
                {legalAreas.map((area) => (
                  <SelectItem key={area} value={area}>{area}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Year */}
        {years.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="year" className="text-sm font-medium">Year</Label>
            <Select
              value={filters.year}
              onValueChange={(value) => onFiltersChange({ ...filters, year: value })}
            >
              <SelectTrigger id="year">
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Court */}
        {courts.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="court" className="text-sm font-medium">Court</Label>
            <Select
              value={filters.court}
              onValueChange={(value) => onFiltersChange({ ...filters, court: value })}
            >
              <SelectTrigger id="court">
                <SelectValue placeholder="All Courts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courts</SelectItem>
                {courts.map((court) => (
                  <SelectItem key={court} value={court}>{court}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Stage */}
        {stages.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="stage" className="text-sm font-medium">Stage</Label>
            <Select
              value={filters.stage}
              onValueChange={(value) => onFiltersChange({ ...filters, stage: value })}
            >
              <SelectTrigger id="stage">
                <SelectValue placeholder="All Stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {stages.map((stage) => (
                  <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Outcome (only for own cases) */}
        {filters.caseType === 'own' && outcomes.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="outcome" className="text-sm font-medium">Outcome</Label>
            <Select
              value={filters.outcome}
              onValueChange={(value) => onFiltersChange({ ...filters, outcome: value })}
            >
              <SelectTrigger id="outcome">
                <SelectValue placeholder="All Outcomes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Outcomes</SelectItem>
                {outcomes.map((outcome) => (
                  <SelectItem key={outcome} value={outcome}>{outcome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CaseFilters; 