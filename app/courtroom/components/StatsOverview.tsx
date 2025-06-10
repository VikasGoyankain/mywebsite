'use client'

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gavel, Scale, BookOpen, Award, TrendingUp } from 'lucide-react';
import { mockCases } from '../data/mockCases';
import { CaseItem } from './CaseCard';

const StatsOverview: React.FC = () => {
  // Calculate stats from mock data
  const totalCases = mockCases.length;
  const ownCases = mockCases.filter((c: CaseItem) => c.isOwnCase).length;
  const academicBriefs = mockCases.filter((c: CaseItem) => !c.isOwnCase).length;
  
  // Calculate success rate (assuming "Won" is the outcome for successful cases)
  const wonCases = mockCases.filter((c: CaseItem) => c.isOwnCase && c.outcome === 'Won').length;
  const successRate = ownCases > 0 ? Math.round((wonCases / ownCases) * 100) : 0;
  
  // Calculate complexity metrics
  const avgComplexity = mockCases
    .filter((c: CaseItem) => c.complexityRating)
    .reduce((sum: number, c: CaseItem) => sum + (c.complexityRating || 0), 0) / 
    mockCases.filter((c: CaseItem) => c.complexityRating).length;
  
  // Get unique courts count
  const uniqueCourts = new Set(mockCases.map((c: CaseItem) => c.court)).size;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
          <Gavel className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCases}</div>
          <p className="text-xs text-muted-foreground mt-1">
            From {uniqueCourts} different courts
          </p>
          <div className="mt-3 flex items-center">
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${(ownCases / totalCases) * 100}%` }}
              />
            </div>
          </div>
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>{ownCases} Litigated</span>
            <span>{academicBriefs} Academic</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{successRate}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            {wonCases} won out of {ownCases} litigated cases
          </p>
          <div className="mt-3 flex items-center">
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500" 
                style={{ width: `${successRate}%` }}
              />
            </div>
          </div>
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>Won</span>
            <span>Lost/Pending</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Case Complexity</CardTitle>
          <Scale className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {avgComplexity ? avgComplexity.toFixed(1) : 'N/A'}
            <span className="text-sm text-muted-foreground"> / 5</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Average complexity rating
          </p>
          <div className="mt-3 flex items-center">
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500" 
                style={{ width: `${(avgComplexity / 5) * 100}%` }}
              />
            </div>
          </div>
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>Simple</span>
            <span>Complex</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Legal Areas</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Set(mockCases.map((c: CaseItem) => c.legalArea)).size}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Distinct practice areas
          </p>
          <div className="mt-3 grid grid-cols-2 gap-1">
            {Array.from(new Set(mockCases.map((c: CaseItem) => c.legalArea)))
              .slice(0, 4)
              .map((area, i) => (
                <div key={i} className="text-xs flex items-center">
                  <div className="w-2 h-2 rounded-full bg-primary mr-1" />
                  {area as React.ReactNode}
                </div>
              ))}
            {new Set(mockCases.map((c: CaseItem) => c.legalArea)).size > 4 && (
              <div className="text-xs text-muted-foreground">
                + {new Set(mockCases.map((c: CaseItem) => c.legalArea)).size - 4} more
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsOverview; 