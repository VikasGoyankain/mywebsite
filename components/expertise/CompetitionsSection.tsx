'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Competition } from '@/types/expertise';

interface CompetitionsSectionProps {
  competitions: Competition[];
}

const INITIAL_VISIBLE = 3;

export function CompetitionsSection({ competitions }: CompetitionsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (competitions.length === 0) return null;

  const sorted = [...competitions].sort((a, b) => a.order - b.order);
  const showExpandButton = sorted.length > INITIAL_VISIBLE;
  const visibleComps = isExpanded ? sorted : sorted.slice(0, INITIAL_VISIBLE);
  const hiddenCount = sorted.length - INITIAL_VISIBLE;

  return (
    <section className="py-12 border-t border-border">
      <div className="flex items-start justify-between mb-6">
        <h2 className="font-display text-2xl font-medium">Competitions</h2>
        <span className="text-sm text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
          {sorted.length}
        </span>
      </div>
      
      <div className="space-y-4">
        {visibleComps.map((comp, index) => (
          <article
            key={comp.id || `comp-${index}`}
            className="p-5 border border-border bg-card rounded-lg hover:border-foreground/20 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
              <div>
                <h3 className="font-display text-lg font-medium">{comp.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {comp.year} • {comp.role}
                  {comp.teamContext && ` • ${comp.teamContext}`}
                </p>
              </div>
              <span className="text-sm font-medium text-foreground/90 bg-secondary px-3 py-1 rounded-full self-start">
                {comp.outcome}
              </span>
            </div>
            <p className="text-sm text-foreground/80 italic line-clamp-2">{comp.keyLearning}</p>
          </article>
        ))}
      </div>

      {/* Expand/Collapse Button */}
      {showExpandButton && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show {hiddenCount} more competition{hiddenCount > 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      )}
    </section>
  );
}
