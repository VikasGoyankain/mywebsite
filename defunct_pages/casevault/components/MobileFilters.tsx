'use client'

import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import CaseFilters from './CaseFilters';
import { Case } from '../data/mockCases';

interface MobileFiltersProps {
  filters: {
    legalArea: string;
    year: string;
    court: string;
    stage: string;
    caseType: string;
    outcome: string;
  };
  onFiltersChange: (filters: any) => void;
  activeFiltersCount: number;
  cases: Case[];
}

const MobileFilters: React.FC<MobileFiltersProps> = ({ 
  filters, 
  onFiltersChange, 
  activeFiltersCount,
  cases
}) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[400px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filter Cases</SheetTitle>
          <SheetDescription>
            Narrow down your case search with these filters.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <CaseFilters 
            filters={filters}
            onFiltersChange={onFiltersChange}
            cases={cases}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileFilters; 