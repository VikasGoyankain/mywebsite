'use client'

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bookmark, ExternalLink, FileText, Gavel, Scale, Tag, Clock, Calendar } from 'lucide-react';
import Link from 'next/link';

// Define the case type
export interface CaseItem {
  id: string;
  title: string;
  citation: string;
  court: string;
  judgmentDate: string;
  year: number;
  legalArea: string;
  tags: string[];
  isOwnCase: boolean;
  stage?: string;
  outcome?: string;
  complexityRating?: number;
}

interface CaseCardProps {
  case: CaseItem;
}

const CaseCard: React.FC<CaseCardProps> = ({ case: caseItem }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
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

  const getOutcomeColor = (outcome: string | undefined) => {
    if (!outcome) return '';
    
    const colors: { [key: string]: string } = {
      'Won': 'bg-green-100 text-green-800',
      'Lost': 'bg-red-100 text-red-800',
      'Settled': 'bg-purple-100 text-purple-800',
      'Pending': 'bg-blue-100 text-blue-800',
      'Dismissed': 'bg-orange-100 text-orange-800'
    };
    return colors[outcome] || 'bg-gray-100 text-gray-800';
  };

  const getComplexityLabel = (rating: number | undefined) => {
    if (!rating) return 'N/A';
    
    const labels = ['Simple', 'Moderate', 'Complex', 'Very Complex', 'Landmark'];
    return rating >= 1 && rating <= 5 ? labels[rating - 1] : 'N/A';
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-5 flex-grow">
        <div className="flex justify-between items-start mb-3">
          <Badge 
            variant={caseItem.isOwnCase ? "default" : "secondary"} 
            className={`mb-2 ${caseItem.isOwnCase ? 'bg-amber-600 text-white' : ''}`}
          >
            {caseItem.isOwnCase ? 'Litigated Case' : 'Academic Brief'}
          </Badge>
          
          {caseItem.outcome && (
            <Badge className={getOutcomeColor(caseItem.outcome)}>
              {caseItem.outcome}
            </Badge>
          )}
          
          {!caseItem.outcome && caseItem.stage && (
            <Badge variant="outline">
              {caseItem.stage}
            </Badge>
          )}
        </div>
        
        <h3 className="text-lg font-bold mb-2 line-clamp-2">
          {caseItem.title}
        </h3>
        
        <div className="text-sm text-muted-foreground mb-3 font-mono">
          {caseItem.citation}
        </div>
        
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge className={`${getLegalAreaColor(caseItem.legalArea)}`}>
            {caseItem.legalArea}
          </Badge>
          
          {caseItem.complexityRating && (
            <Badge variant="outline" className="border-amber-300">
              <Scale className="h-3 w-3 mr-1" />
              {getComplexityLabel(caseItem.complexityRating)}
            </Badge>
          )}
        </div>
        
        <div className="flex flex-col space-y-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Gavel className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
            <span className="truncate">{caseItem.court}</span>
          </div>
          
          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
            <span>{formatDate(caseItem.judgmentDate)}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-5 py-3 border-t bg-muted/50 flex justify-between">
        <div className="flex flex-wrap gap-1.5">
          {caseItem.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs bg-background">
              {tag}
            </Badge>
          ))}
          {caseItem.tags.length > 3 && (
            <Badge variant="outline" className="text-xs bg-background">
              +{caseItem.tags.length - 3}
            </Badge>
          )}
        </div>
        
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/courtroom/${caseItem.id}`}>
            <FileText className="h-4 w-4 mr-1" />
            Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CaseCard; 