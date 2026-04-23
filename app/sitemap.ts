import { MetadataRoute } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vikasgoyanka.in';

// Fetch all cases from API
async function fetchAllCases() {
  try {
    const response = await fetch(`${baseUrl}/api/casevault`, {
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

// Fetch all blogs from API
async function fetchAllBlogs() {
  try {
    const response = await fetch(`${baseUrl}/api/blogs`, {
      next: { revalidate: 3600 } // Revalidate every hour
    });
    
    if (!response.ok) {
      console.error('Failed to fetch blogs for sitemap');
      return [];
    }
    
    const blogs = await response.json();
    // Only return published blogs
    return blogs.filter((blog: any) => blog.status === 'published');
  } catch (error) {
    console.error('Error generating sitemap for blogs:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date();
  
  // Get all dynamic content
  const [cases, blogs] = await Promise.all([
    fetchAllCases(),
    fetchAllBlogs(),
  ]);

  // Case URLs
  const caseUrls = cases.map((caseItem: any) => ({
    url: `${baseUrl}/casevault/${caseItem.id}`,
    lastModified: caseItem.updated_at ? new Date(caseItem.updated_at) : currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Blog URLs
  const blogUrls = blogs.map((blog: any) => ({
    url: `${baseUrl}/blog/${blog.slug || blog.id}`,
    lastModified: blog.updated_at ? new Date(blog.updated_at) : (blog.created_at ? new Date(blog.created_at) : currentDate),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Static routes with their priorities and change frequencies
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/casevault`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/research`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/skills`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Combine all URLs, removing duplicates
  const allUrls = [...staticRoutes, ...blogUrls, ...caseUrls];
  
  // Remove duplicates based on URL
  const uniqueUrls = allUrls.filter((item, index, self) =>
    index === self.findIndex((t) => t.url === item.url)
  );

  return uniqueUrls;
} 