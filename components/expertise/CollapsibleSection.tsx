'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  itemCount: number;
  initialVisibleCount?: number;
  maxHeight?: string;
  className?: string;
}

export function CollapsibleSection({
  title,
  subtitle,
  children,
  itemCount,
  initialVisibleCount = 4,
  maxHeight = '400px',
  className,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const showExpandButton = itemCount > initialVisibleCount;
  const hiddenCount = itemCount - initialVisibleCount;

  return (
    <section className={cn('py-12 border-t border-border', className)}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-medium">{title}</h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        {itemCount > 0 && (
          <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
        )}
      </div>

      <div
        className={cn(
          'relative transition-all duration-300 ease-in-out',
          !isExpanded && showExpandButton && 'overflow-hidden'
        )}
        style={{
          maxHeight: !isExpanded && showExpandButton ? maxHeight : 'none',
        }}
      >
        {children}
        
        {/* Gradient fade overlay when collapsed */}
        {!isExpanded && showExpandButton && (
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        )}
      </div>

      {/* Expand/Collapse Button */}
      {showExpandButton && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="gap-2"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show {hiddenCount} more
              </>
            )}
          </Button>
        </div>
      )}
    </section>
  );
}
