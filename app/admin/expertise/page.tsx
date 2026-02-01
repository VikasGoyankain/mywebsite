"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ExpertiseAreasForm } from '@/components/admin/ExpertiseAreasForm';
import { CertificationsForm } from '@/components/admin/CertificationsForm';
import { CompetitionsForm } from '@/components/admin/CompetitionsForm';
import { ReadingsForm } from '@/components/admin/ReadingsForm';
import type { ExpertiseData } from '@/types/expertise';

export default function AdminExpertisePage() {
  const [data, setData] = useState<ExpertiseData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [areasRes, certsRes, compsRes] = await Promise.all([
        fetch('/api/expertise-areas'),
        fetch('/api/certifications'),
        fetch('/api/competitions'),
      ]);

      const expertiseAreas = areasRes.ok ? await areasRes.json() : [];
      const certifications = certsRes.ok ? await certsRes.json() : [];
      const competitions = compsRes.ok ? await compsRes.json() : [];

      setData({
        expertiseAreas,
        certifications,
        competitions,
        books: [], // Not used anymore
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchData();
  };

  if (!data || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="font-display text-xl font-medium">Admin Panel - Expertise</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <Tabs defaultValue="expertise" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="expertise">Expertise</TabsTrigger>
            <TabsTrigger value="certifications">Certifications</TabsTrigger>
            <TabsTrigger value="competitions">Competitions</TabsTrigger>
            <TabsTrigger value="readings">Readings</TabsTrigger>
          </TabsList>

          <TabsContent value="expertise">
            <ExpertiseAreasForm data={data} onDataChange={refreshData} />
          </TabsContent>

          <TabsContent value="certifications">
            <CertificationsForm data={data} onDataChange={refreshData} />
          </TabsContent>

          <TabsContent value="competitions">
            <CompetitionsForm data={data} onDataChange={refreshData} />
          </TabsContent>

          <TabsContent value="readings">
            <ReadingsForm onDataChange={refreshData} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

