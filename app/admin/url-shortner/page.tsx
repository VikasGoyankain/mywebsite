"use client";
import React, { useState } from 'react';
import { AdminAuthWrapper } from '@/components/admin/AdminAuthWrapper';
import UrlShortnerIndex from '@/components/admin/url-shortner/UrlShortnerIndex';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UrlEntry {
  shortCode: string;
  originalUrl: string;
  clicks: number;
  createdAt: string;
  lastAccessed: string;
  expiresAt?: string;
  isRevoked: boolean;
  title?: string;        // Optional: extracted from target page
  description?: string;  // Optional: extracted from target page
}

// Redis key patterns
const REDIS_KEYS = {
  URL_DATA: 'url:{shortcode}',           // Hash
  ORIGINAL_INDEX: 'original:{url_hash}', // String
  ALL_CODES: 'urls:all_codes',           // Set
  BY_CLICKS: 'urls:by_clicks',           // Sorted Set
  BY_DATE: 'urls:by_date',               // Sorted Set
  REVOKED: 'urls:revoked',               // Set
  EXPIRED: 'urls:expired'                // Set
} as const;

export default function UrlShortnerPage() {
  const [isMigrating, setIsMigrating] = useState(false);
  const router = useRouter();
  
  const runMigration = async () => {
    try {
      setIsMigrating(true);
      toast.info("Starting URL optimization...");
      
      const response = await fetch('/api/url-shortner?action=migrate-to-single-key', {
        method: 'PATCH',
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success(`URL optimization complete: ${data.message}`);
        
        // Use a simpler approach - just reload the page
        window.location.reload();
      } else {
        toast.error("URL optimization failed");
      }
    } catch (error) {
      console.error("Migration error:", error);
      toast.error("URL optimization failed");
    } finally {
      setIsMigrating(false);
    }
  };
  
  return (
    <AdminAuthWrapper>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/admin')}
              className="hover:bg-slate-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">URL Shortener</h1>
          </div>
          <Button 
            variant="outline" 
            onClick={runMigration}
            disabled={isMigrating}
            className="text-sm"
          >
            {isMigrating ? "Optimizing..." : "Fix Duplicate URLs"}
          </Button>
        </div>
        <UrlShortnerIndex />
      </div>
    </AdminAuthWrapper>
  );
}
