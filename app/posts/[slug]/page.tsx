import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PostClientContent from './PostClientContent';
import Script from 'next/script';

// This function generates metadata for each post
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // In Next.js 15, params needs to be awaited
  const { slug } = await params;
  
  if (!slug) {
    return {
      title: 'Post Not Found',
      description: 'The requested post could not be found.',
    };
  }
  
  // Fetch post data
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://vikasgoyanka.in'}/api/posts/${encodeURIComponent(slug)}`, {
      next: { revalidate: 3600 } // Revalidate every hour
    });
    
    if (!response.ok) {
      return {
        title: 'Post Not Found',
        description: 'The requested post could not be found.',
      };
    }
    
    const post = await response.json();
    
    // Find the first image in the post media, if any
    const featuredImage = post.media && post.media.length > 0 
      ? post.media[0].url 
      : '/placeholder.jpg';
    
    // Create a description from the content if no description is provided
    const description = post.description || (post.content 
      ? post.content.substring(0, 160) + (post.content.length > 160 ? '...' : '') 
      : 'Read this post on Vikas Goyanka\'s website');
    
    return {
      title: post.title || 'Blog Post',
      description: description,
      authors: [{ name: post.author || 'Vikas Goyanka' }],
      openGraph: {
        title: post.title || 'Blog Post',
        description: description,
        url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://vikasgoyanka.in'}/posts/${slug}`,
        type: 'article',
        publishedTime: post.createdAt ? new Date(post.createdAt).toISOString() : undefined,
        modifiedTime: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
        authors: [post.author || 'Vikas Goyanka'],
        images: [
          {
            url: featuredImage,
            width: 1200,
            height: 630,
            alt: post.title || 'Blog post image',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title || 'Blog Post',
        description: description,
        images: [featuredImage],
      },
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://vikasgoyanka.in'}/posts/${slug}`,
      }
    };
  } catch (error) {
    console.error('Error fetching post metadata:', error);
    return {
      title: 'Post',
      description: 'View this post on Vikas Goyanka\'s website',
    };
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  // In Next.js 15, params needs to be awaited
  const { slug } = await params;
  
  if (!slug) {
    notFound();
  }
  
  // This is a server component, so we can fetch the data server-side
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://vikasgoyanka.in'}/api/posts/${encodeURIComponent(slug)}`, {
      next: { revalidate: 3600 } // Revalidate every hour
    });
    
    if (!response.ok) {
      notFound();
    }
    
    const post = await response.json();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vikasgoyanka.in';
    const postUrl = `${baseUrl}/posts/${slug}`;
    const featuredImage = post.media && post.media.length > 0 ? post.media[0].url : '/placeholder.jpg';
    
    // Generate structured data for the post
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description || post.content.substring(0, 160),
      image: featuredImage,
      datePublished: post.createdAt ? new Date(post.createdAt).toISOString() : new Date(post.timestamp).toISOString(),
      dateModified: post.updatedAt ? new Date(post.updatedAt).toISOString() : new Date(post.timestamp).toISOString(),
      author: {
        '@type': 'Person',
        name: post.author || 'Vikas Goyanka',
        url: baseUrl
      },
      publisher: {
        '@type': 'Organization',
        name: 'Vikas Goyanka',
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/placeholder-logo.svg`
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': postUrl
      },
      url: postUrl
    };
    
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <PostClientContent post={post} />
      </>
    );
  } catch (error) {
    console.error('Error fetching post:', error);
    notFound();
  }
}
