"use client";

import { useState, useEffect } from 'react';
import { getData } from '@/lib/expertise-storage';
import { ExpertiseCard } from '@/components/expertise/ExpertiseCard';
import { CertificationsSection } from '@/components/expertise/CertificationsSection';
import { CompetitionsSection } from '@/components/expertise/CompetitionsSection';
import { BooksSection } from '@/components/expertise/BooksSection';
import { Footer } from '@/components/Footer';
import type { ExpertiseData } from '@/types/expertise';

export default function ExpertisePage() {
  const [data, setData] = useState<ExpertiseData | null>(null);

  useEffect(() => {
    setData(getData());
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const sortedAreas = [...data.expertiseAreas].sort((a, b) => a.order - b.order);

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
          <h2 className="font-display text-2xl font-medium mb-6">Core Competencies</h2>
          <div className="space-y-3">
            {sortedAreas.map((area) => (
              <ExpertiseCard
                key={area.id}
                area={area}
                certifications={data.certifications}
                competitions={data.competitions}
                books={data.books}
              />
            ))}
          </div>
        </section>

        {/* Additional Sections */}
        <CertificationsSection certifications={data.certifications} />
        <CompetitionsSection competitions={data.competitions} />
        <BooksSection books={data.books} />

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
