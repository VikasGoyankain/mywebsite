'use client'

import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import CaseFilters from './CaseFilters';

interface MobileFiltersProps {
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
  activeFiltersCount: number;
}

const MobileFilters: React.FC<MobileFiltersProps> = ({ 
  filters, 
  onFiltersChange,
  activeFiltersCount
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClearAll = () => {
    onFiltersChange({
      legalArea: '',
      year: '',
      court: '',
      stage: '',
      caseType: 'all',
      outcome: '',
      complexityRating: [1]
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden relative">
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[400px] overflow-y-auto">
        <SheetHeader className="space-y-0">
          <div className="flex items-center justify-between">
            <SheetTitle>Filter Cases</SheetTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearAll}
              className="text-xs h-8"
            >
              Clear All
            </Button>
          </div>
        </SheetHeader>
        <div className="mt-4">
          <CaseFilters 
            filters={filters}
            onFiltersChange={onFiltersChange}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileFilters; 