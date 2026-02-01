"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Database, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getData } from '@/lib/expertise-storage';
import { ExpertiseAreasForm } from '@/components/admin/ExpertiseAreasForm';
import { CertificationsForm } from '@/components/admin/CertificationsForm';
import { CompetitionsForm } from '@/components/admin/CompetitionsForm';
import { ReadingsForm } from '@/components/admin/ReadingsForm';
import type { ExpertiseData } from '@/types/expertise';

export default function AdminExpertisePage() {
  const [data, setData] = useState<ExpertiseData | null>(null);
  const [migrating, setMigrating] = useState(false);
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

  const handleMigrateAll = async () => {
    try {
      setMigrating(true);
      const localData = getData();
      
      console.log('LocalStorage data to migrate:', {
        expertiseAreas: localData.expertiseAreas?.length || 0,
        certifications: localData.certifications?.length || 0,
        competitions: localData.competitions?.length || 0,
      });
      
      const response = await fetch('/api/expertise/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expertiseAreas: localData.expertiseAreas,
          certifications: localData.certifications,
          competitions: localData.competitions,
        }),
      });

      const result = await response.json();
      console.log('Migration response:', result);

      if (response.ok) {
        const { results } = result;
        const details = [
          `Areas: ${results.expertiseAreas.migrated} migrated, ${results.expertiseAreas.skipped} skipped`,
          `Certifications: ${results.certifications.migrated} migrated, ${results.certifications.skipped} skipped`,
          `Competitions: ${results.competitions.migrated} migrated, ${results.competitions.skipped} skipped`,
        ].join(' | ');
        
        toast({
          title: 'Migration Complete',
          description: details,
        });
      } else {
        toast({
          title: 'Migration Failed',
          description: result.error || 'Unknown error',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Migration error:', error);
      toast({
        title: 'Error',
        description: 'Failed to migrate expertise data',
        variant: 'destructive',
      });
    } finally {
      setMigrating(false);
    }
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
        {/* Migration Banner */}
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-blue-600 dark:text-blue-400">Database Migration</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Your expertise data is currently stored in localStorage. Click below to migrate all data (Expertise Areas, Certifications, Competitions) to the Redis database for better performance and reliability.
              </p>
            </div>
            <Button
              onClick={handleMigrateAll}
              disabled={migrating}
              className="shrink-0"
            >
              {migrating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Migrating...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Migrate All Data
                </>
              )}
            </Button>
          </div>
        </div>

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

