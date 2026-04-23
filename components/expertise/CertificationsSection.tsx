'use client';

import { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Certification } from '@/types/expertise';

interface CertificationsSectionProps {
  certifications: Certification[];
}

const INITIAL_VISIBLE = 4;

export function CertificationsSection({ certifications }: CertificationsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (certifications.length === 0) return null;

  const sorted = [...certifications].sort((a, b) => a.order - b.order);
  const showExpandButton = sorted.length > INITIAL_VISIBLE;
  const visibleCerts = isExpanded ? sorted : sorted.slice(0, INITIAL_VISIBLE);
  const hiddenCount = sorted.length - INITIAL_VISIBLE;

  return (
    <section className="py-12 border-t border-border">
      <div className="flex items-start justify-between mb-6">
        <h2 className="font-display text-2xl font-medium">Certifications & Awards</h2>
        <span className="text-sm text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
          {sorted.length}
        </span>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2">
        {visibleCerts.map((cert, index) => (
          <article
            key={cert.id || `cert-${index}`}
            className="p-5 border border-border bg-card hover:border-foreground/20 transition-colors rounded-lg"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="font-display text-lg font-medium mb-1">{cert.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {cert.issuingBody} • {cert.dateEarned}
                </p>
                <p className="text-sm text-foreground/80 line-clamp-2">{cert.relevanceNote}</p>
              </div>
              {cert.verificationLink && (
                <a
                  href={cert.verificationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  aria-label="Verify certification"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
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
                Show {hiddenCount} more certification{hiddenCount > 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      )}
    </section>
  );
}
