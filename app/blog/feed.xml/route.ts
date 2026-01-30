import { NextResponse } from 'next/server';

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vikasgoyanka.in';

async function fetchPublishedBlogs() {
  try {
    const response = await fetch(`${siteUrl}/api/blogs`, {
      next: { revalidate: 3600 }
    });
    
    if (!response.ok) {
      return [];
    }
    
    const blogs = await response.json();
    return blogs.filter((blog: any) => blog.status === 'published');
  } catch (error) {
    console.error('Error fetching blogs for RSS:', error);
    return [];
  }
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

export async function GET() {
  const blogs = await fetchPublishedBlogs();
  
  const rssItems = blogs.map((blog: any) => {
    const pubDate = blog.created_at 
      ? new Date(blog.created_at).toUTCString() 
      : new Date().toUTCString();
    
    const description = blog.summary 
      || blog.description 
      || stripHtml(blog.content || '').substring(0, 300);
    
    const postUrl = `${siteUrl}/blog/${blog.slug || blog.id}`;
    
    return `
    <item>
      <title>${escapeXml(blog.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description>${escapeXml(description)}</description>
      <pubDate>${pubDate}</pubDate>
      <author>contact@vikasgoyanka.in (Vikas Goyanka)</author>
      ${blog.tags?.map((tag: string) => `<category>${escapeXml(tag)}</category>`).join('\n      ') || ''}
    </item>`;
  }).join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Vikas Goyanka Blog</title>
    <link>${siteUrl}/blog</link>
    <description>Articles on Constitutional Law, Human Rights, Cyber Laws, technology, systems thinking, and personal reflections by Vikas Goyanka.</description>
    <language>en-IN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/blog/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${siteUrl}/og-blog.png</url>
      <title>Vikas Goyanka Blog</title>
      <link>${siteUrl}/blog</link>
    </image>
    <copyright>Copyright ${new Date().getFullYear()} Vikas Goyanka. All rights reserved.</copyright>
    <managingEditor>contact@vikasgoyanka.in (Vikas Goyanka)</managingEditor>
    <webMaster>contact@vikasgoyanka.in (Vikas Goyanka)</webMaster>
    <category>Law</category>
    <category>Technology</category>
    <category>Legal Research</category>
    <category>Human Rights</category>
    ${rssItems}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
