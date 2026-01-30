import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogPostContent from './BlogPostContent';
import { getBlogBySlug, getBlogById, incrementBlogViews } from '@/lib/services/blogs-service';
import { getPostById } from '@/lib/services/posts-service';

// Helper to fetch blog/post by slug using service functions
async function fetchBlogOrPost(slug: string) {
  // Try blogs service first
  try {
    let blog = await getBlogBySlug(slug);
    if (!blog) {
      blog = await getBlogById(slug);
    }
    if (blog) {
      return blog;
    }
  } catch (e) {
    console.log('Blog service error, trying posts service:', e);
  }

  // Fallback to posts service (using ID since posts use ID as identifier)
  try {
    const post = await getPostById(slug);
    if (post) {
      return post;
    }
  } catch (e) {
    console.log('Posts service error:', e);
  }

  return null;
}

// Generate metadata for each blog post
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  if (!slug) {
    return {
      title: 'Post Not Found',
      description: 'The requested post could not be found.',
    };
  }
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vikasgoyanka.in';
    const post = await fetchBlogOrPost(slug);
    
    if (!post) {
      return {
        title: 'Post Not Found',
        description: 'The requested post could not be found.',
      };
    }
    
    // Clean description
    const description = post.description 
      || post.summary
      || (post.content 
        ? post.content.replace(/<[^>]*>/g, '').substring(0, 160) + (post.content.length > 160 ? '…' : '') 
        : 'Read this post on the blog');
    
    return {
      title: post.title || 'Blog Post',
      description,
      openGraph: {
        title: post.title || 'Blog Post',
        description,
        url: `${baseUrl}/blog/${slug}`,
        type: 'article',
        publishedTime: post.created_at ? new Date(post.created_at).toISOString() : undefined,
        modifiedTime: post.updated_at ? new Date(post.updated_at).toISOString() : undefined,
        siteName: 'Blog',
      },
      twitter: {
        card: 'summary',
        title: post.title || 'Blog Post',
        description,
      },
      alternates: {
        canonical: `${baseUrl}/blog/${slug}`,
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch (error) {
    console.error('Error fetching post metadata:', error);
    return {
      title: 'Blog Post',
      description: 'Read this post on the blog',
    };
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  if (!slug) {
    notFound();
  }
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vikasgoyanka.in';
    const post = await fetchBlogOrPost(slug);
    
    if (!post) {
      notFound();
    }

    // Increment view count
    try {
      await incrementBlogViews(slug);
    } catch (e) {
      // Ignore view count errors
    }
    
    const postUrl = `${baseUrl}/blog/${slug}`;
    
    // JSON-LD structured data
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description || post.content?.substring(0, 160),
      datePublished: post.created_at 
        ? new Date(post.created_at).toISOString() 
        : new Date(post.timestamp).toISOString(),
      dateModified: post.updated_at 
        ? new Date(post.updated_at).toISOString() 
        : (post.created_at ? new Date(post.created_at).toISOString() : new Date(post.timestamp).toISOString()),
      author: {
        '@type': 'Person',
        name: 'Vikas Goyanka',
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
      url: postUrl,
      keywords: post.tags?.join(', '),
      wordCount: post.content?.split(/\s+/).length || 0,
      articleBody: post.content?.replace(/<[^>]*>/g, '').substring(0, 500),
    };

    // Breadcrumb structured data
    const breadcrumbData = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: baseUrl
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Blog',
          item: `${baseUrl}/blog`
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: post.title,
          item: postUrl
        }
      ]
    };
    
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
        />
        <BlogPostContent post={post} />
      </>
    );
  } catch (error) {
    console.error('Error fetching post:', error);
    notFound();
  }
}
