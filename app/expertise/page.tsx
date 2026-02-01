"use client";

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ExpertiseCard } from '@/components/expertise/ExpertiseCard';
import { CertificationsSection } from '@/components/expertise/CertificationsSection';
import { CompetitionsSection } from '@/components/expertise/CompetitionsSection';
import { ReadingsSection } from '@/components/expertise/BooksSection';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/Footer';
import type { ExpertiseArea, Certification, Competition, ReadingItem } from '@/types/expertise';

const INITIAL_VISIBLE_AREAS = 3;

export default function ExpertisePage() {
  const [expertiseAreas, setExpertiseAreas] = useState<ExpertiseArea[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [readings, setReadings] = useState<ReadingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAreasExpanded, setIsAreasExpanded] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [areasRes, certsRes, compsRes, readingsRes] = await Promise.all([
          fetch('/api/expertise-areas'),
          fetch('/api/certifications'),
          fetch('/api/competitions'),
          fetch('/api/readings'),
        ]);

        if (areasRes.ok) {
          const areas = await areasRes.json();
          console.log('Fetched expertise areas:', areas);
          setExpertiseAreas(areas);
        } else {
          console.error('Failed to fetch expertise areas:', await areasRes.text());
        }
        
        if (certsRes.ok) {
          const certs = await certsRes.json();
          console.log('Fetched certifications:', certs);
          setCertifications(certs);
        } else {
          console.error('Failed to fetch certifications:', await certsRes.text());
        }
        
        if (compsRes.ok) {
          const comps = await compsRes.json();
          console.log('Fetched competitions:', comps);
          setCompetitions(comps);
        } else {
          console.error('Failed to fetch competitions:', await compsRes.text());
        }
        
        if (readingsRes.ok) {
          const reads = await readingsRes.json();
          console.log('Fetched readings:', reads);
          setReadings(reads);
        } else {
          console.error('Failed to fetch readings:', await readingsRes.text());
        }
      } catch (error) {
        console.error('Error fetching expertise data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const sortedAreas = [...expertiseAreas].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto px-6 py-12 w-full">
        {/* Opening Statement */}
        <section className="mb-12">
          <h1 className="font-display text-3xl font-bold mb-6">Expertise</h1>
          <p className="text-lg text-foreground/90 leading-relaxed max-w-2xl">
            This page presents what I can do and the evidence behind it. 
            Each area below expands to reveal the certifications, competitions, 
            and reading that validate that capability.
          </p>
        </section>

        {/* Expertise Areas */}
        <section className="mb-12">
          <div className="flex items-start justify-between mb-6">
            <h2 className="font-display text-2xl font-medium">Core Competencies</h2>
            <span className="text-sm text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
              {sortedAreas.length}
            </span>
          </div>
          {sortedAreas.length === 0 ? (
            <p className="text-muted-foreground">No expertise areas yet.</p>
          ) : (
            <>
              <div className="space-y-3">
                {(isAreasExpanded ? sortedAreas : sortedAreas.slice(0, INITIAL_VISIBLE_AREAS)).map((area, index) => (
                  <ExpertiseCard
                    key={area.id || `area-${index}`}
                    area={area}
                    certifications={certifications}
                    competitions={competitions}
                    books={[]}
                  />
                ))}
              </div>
              {sortedAreas.length > INITIAL_VISIBLE_AREAS && (
                <div className="mt-6 flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAreasExpanded(!isAreasExpanded)}
                    className="gap-2 text-muted-foreground hover:text-foreground"
                  >
                    {isAreasExpanded ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        Show {sortedAreas.length - INITIAL_VISIBLE_AREAS} more competenc{sortedAreas.length - INITIAL_VISIBLE_AREAS > 1 ? 'ies' : 'y'}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Additional Sections */}
        <CertificationsSection certifications={certifications} />
        <CompetitionsSection competitions={competitions} />
        
        {/* Readings Section - from Redis API */}
        <ReadingsSection readings={readings} />

        {/* Custom Footer */}
        <div className="pt-12 pb-8 border-t border-border mt-12">
          <p className="text-xs text-muted-foreground text-center">
            Evidence speaks louder than claims.
          </p>
        </div>
      </main>

      {/* Unified Footer */}
      <Footer />
    </div>
  );
}
