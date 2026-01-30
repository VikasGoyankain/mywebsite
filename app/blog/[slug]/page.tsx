import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogPostContent from './BlogPostContent';
import { getBlogBySlug, getBlogById, incrementBlogViews } from '@/lib/services/blogs-service';
import { generateBreadcrumbStructuredData, generateBlogPostStructuredData } from '../../metadata';
import { Blog } from '@/lib/types/Blog';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vikasgoyanka.in';

// Helper to fetch blog by slug using service functions
async function fetchBlog(slug: string): Promise<Blog | null> {
  try {
    let blog = await getBlogBySlug(slug);
    if (!blog) {
      blog = await getBlogById(slug);
    }
    return blog;
  } catch (e) {
    console.log('Blog service error:', e);
    return null;
  }
}

// Convert Blog to Post-compatible format for BlogPostContent
function blogToPostFormat(blog: Blog) {
  return {
    id: blog.id,
    title: blog.title,
    description: blog.summary,
    content: blog.content,
    author: 'Vikas Goyanka',
    timestamp: blog.date ? new Date(blog.date) : new Date(),
    created_at: blog.created_at || blog.date,
    updated_at: blog.updated_at || blog.last_updated,
    readTime: blog.reading_time,
    tags: blog.tags,
    media: [],
    // Extended fields
    linked_project: blog.linked_project,
    linked_publication: blog.linked_publication,
    linked_video: blog.linked_video,
    version: blog.version,
    summary: blog.summary,
  };
}

// Generate metadata for each blog post
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  if (!slug) {
    return {
      title: 'Post Not Found',
      description: 'The requested post could not be found.',
      robots: { index: false, follow: false },
    };
  }
  
  try {
    const post = await fetchBlog(slug);
    
    if (!post) {
      return {
        title: 'Post Not Found',
        description: 'The requested post could not be found.',
        robots: { index: false, follow: false },
      };
    }
    
    // Clean and truncate description for SEO - use summary for Blog type
    const rawDescription = post.summary
      || (post.content 
        ? post.content.replace(/<[^>]*>/g, '').substring(0, 160) 
        : 'Read this post on the blog');
    
    const description = rawDescription.length > 160 
      ? rawDescription.substring(0, 157) + '...' 
      : rawDescription;
    
    const title = post.title || 'Blog Post';
    const postUrl = `${baseUrl}/blog/${slug}`;
    const publishedTime = post.created_at 
      ? new Date(post.created_at).toISOString() 
      : (post.date ? new Date(post.date).toISOString() : undefined);
    const modifiedTime = post.updated_at 
      ? new Date(post.updated_at).toISOString() 
      : publishedTime;
    
    // Use default OG image for blogs
    const coverImage = `${baseUrl}/og-blog.png`;
    
    // Generate keywords from tags
    const keywords = [
      ...(post.tags || []),
      'Vikas Goyanka',
      'law blog',
      'legal article',
    ];
    
    return {
      title,
      description,
      authors: [{ name: 'Vikas Goyanka', url: baseUrl }],
      creator: 'Vikas Goyanka',
      publisher: 'Vikas Goyanka',
      keywords,
      openGraph: {
        title,
        description,
        url: postUrl,
        type: 'article',
        publishedTime,
        modifiedTime,
        authors: ['Vikas Goyanka'],
        siteName: 'Vikas Goyanka',
        locale: 'en_IN',
        section: 'Blog',
        tags: post.tags || [],
        images: [
          {
            url: coverImage,
            width: 1200,
            height: 630,
            alt: title,
            type: 'image/png',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        creator: '@vikasgoyanka_in',
        site: '@vikasgoyanka_in',
        images: [coverImage],
      },
      alternates: {
        canonical: postUrl,
      },
      robots: {
        index: true,
        follow: true,
        nocache: false,
        googleBot: {
          index: true,
          follow: true,
          noimageindex: false,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      other: {
        'article:author': 'Vikas Goyanka',
        'article:published_time': publishedTime || '',
        'article:modified_time': modifiedTime || '',
        'article:section': 'Blog',
        'article:tag': post.tags?.join(', ') || '',
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
    const post = await fetchBlog(slug);
    
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
    
    // Use the centralized structured data generator
    const structuredData = generateBlogPostStructuredData({
      title: post.title,
      description: post.summary,
      content: post.content,
      slug: slug,
      createdAt: post.created_at 
        ? new Date(post.created_at).toISOString() 
        : (post.date ? new Date(post.date).toISOString() : new Date().toISOString()),
      updatedAt: post.updated_at 
        ? new Date(post.updated_at).toISOString() 
        : undefined,
      tags: post.tags,
    });

    // Breadcrumb structured data
    const breadcrumbData = generateBreadcrumbStructuredData([
      { name: 'Home', url: baseUrl },
      { name: 'Blog', url: `${baseUrl}/blog` },
      { name: post.title, url: postUrl },
    ]);

    // Reading time structured data
    const readingTimeMinutes = Math.ceil((post.content?.split(/\s+/).length || 0) / 200);
    
    return (
      <>
        {/* Blog Post Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {/* Breadcrumb Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
        />
        {/* Reading Time Hidden Data for Search Engines */}
        <meta name="twitter:label1" content="Reading time" />
        <meta name="twitter:data1" content={`${readingTimeMinutes} min read`} />
        <meta name="twitter:label2" content="Written by" />
        <meta name="twitter:data2" content="Vikas Goyanka" />
        <BlogPostContent post={blogToPostFormat(post)} />
      </>
    );
  } catch (error) {
    console.error('Error fetching post:', error);
    notFound();
  }
}
