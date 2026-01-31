"use client";

import { useState } from 'react';
import { ChevronDown, Award, Trophy, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExpertiseArea, Certification, Competition, Book } from '@/types/expertise';

interface ExpertiseCardProps {
  area: ExpertiseArea;
  certifications: Certification[];
  competitions: Competition[];
  books: Book[];
}

export function ExpertiseCard({ area, certifications, competitions, books }: ExpertiseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const linkedCerts = certifications.filter((c) => area.linkedCertifications.includes(c.id));
  const linkedComps = competitions.filter((c) => area.linkedCompetitions.includes(c.id));
  const linkedBooks = books.filter((b) => area.linkedBooks.includes(b.id));
  const evidenceCount = linkedCerts.length + linkedComps.length + linkedBooks.length;

  return (
    <article
      className={cn(
        'border border-border bg-card transition-all duration-300 ease-out',
        isExpanded ? 'shadow-sm' : 'hover:border-foreground/20'
      )}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-5 text-left flex items-start justify-between gap-4"
      >
        <div className="flex-1">
          <h3 className="font-display text-xl font-medium text-foreground mb-1">
            {area.name}
          </h3>
          <p className="text-muted-foreground text-sm">{area.descriptor}</p>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="text-xs font-body uppercase tracking-wider">
            {evidenceCount} {evidenceCount === 1 ? 'item' : 'items'}
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform duration-200',
              isExpanded && 'rotate-180'
            )}
          />
        </div>
      </button>

      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-out',
          isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-6 pb-6 border-t border-border/50 pt-5 space-y-6">
          {/* Competency Note */}
          <div className="prose-scholarly">
            <p className="text-foreground/90 italic">{area.competencyNote}</p>
          </div>

          {/* Linked Evidence */}
          {linkedCerts.length > 0 && (
            <div>
              <h4 className="flex items-center gap-2 text-xs font-body uppercase tracking-wider text-muted-foreground mb-3">
                <Award className="h-3.5 w-3.5" />
                Certifications
              </h4>
              <ul className="space-y-2">
                {linkedCerts.map((cert) => (
                  <li key={cert.id} className="text-sm">
                    <span className="font-medium">{cert.name}</span>
                    <span className="text-muted-foreground"> — {cert.issuingBody}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {linkedComps.length > 0 && (
            <div>
              <h4 className="flex items-center gap-2 text-xs font-body uppercase tracking-wider text-muted-foreground mb-3">
                <Trophy className="h-3.5 w-3.5" />
                Competitions
              </h4>
              <ul className="space-y-2">
                {linkedComps.map((comp) => (
                  <li key={comp.id} className="text-sm">
                    <span className="font-medium">{comp.name}</span>
                    <span className="text-muted-foreground"> ({comp.year}) — {comp.outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {linkedBooks.length > 0 && (
            <div>
              <h4 className="flex items-center gap-2 text-xs font-body uppercase tracking-wider text-muted-foreground mb-3">
                <BookOpen className="h-3.5 w-3.5" />
                Formative Reading
              </h4>
              <ul className="space-y-2">
                {linkedBooks.map((book) => (
                  <li key={book.id} className="text-sm">
                    <span className="font-medium italic">{book.title}</span>
                    <span className="text-muted-foreground"> by {book.author}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
