'use client'

import React from 'react';
import { Calendar, MapPin, Tag, ChevronRight, Download, Star, Trophy, User } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Case } from '../data/mockCases';

interface CaseCardProps {
  case: Case;
}

const CaseCard: React.FC<CaseCardProps> = ({ case: caseItem }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getLegalAreaColor = (area: string) => {
    const colors: { [key: string]: string } = {
      'Criminal': 'bg-red-100 text-red-800',
      'Civil': 'bg-blue-100 text-blue-800',
      'Family': 'bg-purple-100 text-purple-800',
      'Constitutional': 'bg-green-100 text-green-800',
      'Commercial': 'bg-orange-100 text-orange-800',
      'Labor': 'bg-yellow-100 text-yellow-800'
    };
    return colors[area] || 'bg-gray-100 text-gray-800';
  };

  const getOutcomeColor = (outcome: string) => {
    const colors: { [key: string]: string } = {
      'Won': 'bg-green-100 text-green-800',
      'Settled': 'bg-blue-100 text-blue-800',
      'Dismissed': 'bg-red-100 text-red-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Appeal': 'bg-purple-100 text-purple-800'
    };
    return colors[outcome] || 'bg-gray-100 text-gray-800';
  };

  if (caseItem.isOwnCase) {
    return (
      <Link href={`/casevault/${caseItem.id}`} className="block h-full">
        <Card className="h-full bg-gradient-to-br from-slate-900 to-slate-800 text-white border-amber-500/30 hover:border-amber-400/50 transition-all duration-200 relative overflow-hidden hover:shadow-md cursor-pointer">
          {/* High Impact Star */}
          {caseItem.isHighImpact && (
            <div className="absolute top-3 left-3 z-10">
              <Star className="h-5 w-5 text-amber-400 fill-current" />
            </div>
          )}

          <CardHeader className="pb-3 pt-6">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="font-semibold text-white line-clamp-2 mb-2">
                  {caseItem.title}
                </h3>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="space-y-3">
              {/* Court and Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center text-gray-300 mr-2">
                  <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="truncate">{caseItem.court}</span>
                </div>
                
                <Badge className="bg-amber-600 text-white text-xs">
                  <User className="h-3 w-3 mr-1" />
                  Litigated by Me
                </Badge>
                
                {caseItem.outcome && (
                  <Badge className={`${getOutcomeColor(caseItem.outcome)} text-xs`}>
                    <Trophy className="h-3 w-3 mr-1" />
                    {caseItem.outcome}
                  </Badge>
                )}
                
                <Badge className={`${getLegalAreaColor(caseItem.legalArea)} text-xs`}>
                  {caseItem.legalArea}
                </Badge>
              </div>

              {/* Summary */}
              <p className="text-sm text-gray-200 line-clamp-3">
                {caseItem.shortSummary}
              </p>

              {/* My Role */}
              {caseItem.myRole && (
                <div className="bg-slate-800/50 rounded-lg p-2">
                  <p className="text-xs text-amber-200 font-medium">My Role:</p>
                  <p className="text-xs text-gray-300 line-clamp-2 max-w-full">{caseItem.myRole}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Regular case brief card (existing design)
  return (
    <Link href={`/casevault/${caseItem.id}`} className="block h-full">
      <Card className="legal-card h-full hover:border-primary/30 transition-all duration-200 hover:shadow-md cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-semibold text-foreground line-clamp-2 mb-2">
                {caseItem.title}
              </h3>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Court and Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center text-muted-foreground mr-2">
                <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                <span className="truncate">{caseItem.court}</span>
              </div>
              
              <Badge className={`${getLegalAreaColor(caseItem.legalArea)} text-xs`}>
                {caseItem.legalArea}
              </Badge>
              
              <Badge variant="outline" className="text-xs">
                {caseItem.stage}
              </Badge>
            </div>

            {/* Summary - Increased line-clamp to fill more space */}
            <p className="text-sm text-foreground line-clamp-5 min-h-[5.5rem]">
              {caseItem.shortSummary}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {caseItem.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {caseItem.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{caseItem.tags.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CaseCard; 