'use client'

import React from 'react';
import { BookOpen, Scale, Star, Trophy, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Case } from '../data/mockCases';

interface StatsOverviewProps {
  cases: Case[];
  loading: boolean;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ cases, loading }) => {
  const totalCases = cases.length;
  const litigatedCases = cases.filter(c => c.isOwnCase).length;
  const academicCases = cases.filter(c => !c.isOwnCase).length;
  const wonCases = cases.filter(c => c.isOwnCase && c.outcome === 'Won').length;
  
  const currentYear = new Date().getFullYear();
  const thisYearCases = cases.filter(c => c.year === currentYear).length;

  const stats = [
    {
      title: 'Total Case Briefs',
      value: academicCases.toString(),
      icon: BookOpen,
      description: 'Academic research cases',
      color: 'text-blue-600'
    },
    {
      title: 'Cases Litigated',
      value: litigatedCases.toString(),
      icon: Scale,
      description: 'Personal litigation experience',
      color: 'text-amber-600'
    },
    {
      title: 'Success Rate',
      value: litigatedCases > 0 ? `${Math.round((wonCases / litigatedCases) * 100)}%` : '0%',
      icon: Trophy,
      description: 'Won cases percentage',
      color: 'text-green-600'
    },
    {
      title: 'This Year',
      value: thisYearCases.toString(),
      icon: Calendar,
      description: 'Cases from current year',
      color: 'text-purple-600'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6 mb-8">
        {/* Loading skeleton for stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((_, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Loading skeleton for professional summary */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <Skeleton className="h-6 w-64 mb-2" />
                <div className="flex flex-wrap gap-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-8 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Professional Summary */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Professional Legal Experience
              </h3>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {thisYearCases} cases this year
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  Growing expertise
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Legal Researcher
              </Badge>
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                Law Student
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsOverview; 