import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ReadingDetailContent from './ReadingDetailContent';
import { getReadingBySlug, getReadingById } from '@/lib/services/readings-service';
import { ReadingItem } from '@/types/expertise';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vikasgoyanka.in';

// Helper to fetch reading by slug
async function fetchReading(slug: string): Promise<ReadingItem | null> {
  try {
    let reading = await getReadingBySlug(slug);
    if (!reading) {
      reading = await getReadingById(slug);
    }
    return reading;
  } catch (e) {
    console.log('Reading service error:', e);
    return null;
  }
}

// Generate metadata for each reading
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  if (!slug) {
    return {
      title: 'Reading Not Found',
      description: 'The requested reading could not be found.',
      robots: { index: false, follow: false },
    };
  }
  
  try {
    const reading = await fetchReading(slug);
    
    if (!reading) {
      return {
        title: 'Reading Not Found',
        description: 'The requested reading could not be found.',
        robots: { index: false, follow: false },
      };
    }
    
    const title = `${reading.title} by ${reading.author} - Notes & Learnings`;
    const description = reading.impactOnThinking.substring(0, 160);
    const readingUrl = `${baseUrl}/expertise/readings/${slug}`;
    
    return {
      title,
      description,
      keywords: [
        reading.title,
        reading.author,
        reading.type === 'course' ? 'course notes' : 'book notes',
        'learnings',
        'Vikas Goyanka',
      ],
      authors: [{ name: 'Vikas Goyanka' }],
      openGraph: {
        title,
        description,
        url: readingUrl,
        type: 'article',
        images: reading.imageUrl ? [{ url: reading.imageUrl, alt: reading.title }] : undefined,
        siteName: 'Vikas Goyanka',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: reading.imageUrl ? [reading.imageUrl] : undefined,
      },
      alternates: {
        canonical: readingUrl,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Reading',
      description: 'Book and course notes',
    };
  }
}

// Main page component
export default async function ReadingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  if (!slug) {
    notFound();
  }
  
  const reading = await fetchReading(slug);
  
  if (!reading) {
    notFound();
  }
  
  return <ReadingDetailContent reading={reading} />;
}
