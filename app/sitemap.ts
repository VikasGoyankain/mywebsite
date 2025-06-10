import { MetadataRoute } from 'next'

async function fetchAllCases() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://vikasgoyanka.in'}/api/casevault`, {
      next: { revalidate: 3600 } // Revalidate every hour
    });
    
    if (!response.ok) {
      console.error('Failed to fetch cases for sitemap');
      return [];
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error generating sitemap for cases:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vikasgoyanka.in';
  
  // Get all cases for dynamic routes
  const cases = await fetchAllCases();
  const caseUrls = cases.map((caseItem: any) => ({
    url: `${baseUrl}/casevault/${caseItem.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Static routes with their priorities
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/skills`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/research`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/casevault`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/posts`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  
   
  ];

  return [...routes, ...caseUrls];
} 