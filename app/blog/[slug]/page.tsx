import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import BlogArticle from './BlogArticle'

// Generate metadata for each blog post
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = await params
  
  if (!slug) {
    return {
      title: 'Post Not Found',
      description: 'The requested post could not be found.',
    }
  }
  
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'https://vikasgoyanka.in'}/api/posts/${encodeURIComponent(slug)}`,
      { next: { revalidate: 3600 } }
    )
    
    if (!response.ok) {
      return {
        title: 'Post Not Found',
        description: 'The requested post could not be found.',
      }
    }
    
    const post = await response.json()
    
    const description = post.description || (post.content 
      ? post.content.substring(0, 160) + (post.content.length > 160 ? '...' : '') 
      : 'Read this blog entry')
    
    return {
      title: `${post.title || 'Blog'} | Vikas Goyanka`,
      description: description,
      authors: [{ name: post.author || 'Vikas Goyanka' }],
      openGraph: {
        title: post.title || 'Blog',
        description: description,
        url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://vikasgoyanka.in'}/blog/${slug}`,
        type: 'article',
        publishedTime: post.createdAt ? new Date(post.createdAt).toISOString() : undefined,
        modifiedTime: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
        authors: [post.author || 'Vikas Goyanka'],
      },
      twitter: {
        card: 'summary',
        title: post.title || 'Blog',
        description: description,
      },
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://vikasgoyanka.in'}/blog/${slug}`,
      }
    }
  } catch {
    return {
      title: 'Blog',
      description: 'Read this blog entry',
    }
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const { slug } = await params
  
  if (!slug) {
    notFound()
  }
  
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'https://vikasgoyanka.in'}/api/posts/${encodeURIComponent(slug)}`,
      { next: { revalidate: 3600 } }
    )
    
    if (!response.ok) {
      notFound()
    }
    
    const post = await response.json()
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vikasgoyanka.in'
    const postUrl = `${baseUrl}/blog/${slug}`
    
    // Structured data for the blog post
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description || post.content?.substring(0, 160),
      datePublished: post.createdAt ? new Date(post.createdAt).toISOString() : new Date(post.timestamp).toISOString(),
      dateModified: post.updatedAt ? new Date(post.updatedAt).toISOString() : new Date(post.timestamp).toISOString(),
      author: {
        '@type': 'Person',
        name: post.author || 'Vikas Goyanka',
        url: baseUrl
      },
      publisher: {
        '@type': 'Person',
        name: 'Vikas Goyanka',
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': postUrl
      },
      url: postUrl
    }
    
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <BlogArticle post={post} />
      </>
    )
  } catch {
    notFound()
  }
}
