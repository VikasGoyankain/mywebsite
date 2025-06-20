import React from 'react';
import { AdminAuthWrapper } from '@/components/admin/AdminAuthWrapper';
import UrlShortnerIndex from '@/components/admin/url-shortner/UrlShortnerIndex';

export default function UrlShortnerPage() {
  return (
    <AdminAuthWrapper>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">URL Shortener</h1>
        <UrlShortnerIndex />
      </div>
    </AdminAuthWrapper>
  );
}
