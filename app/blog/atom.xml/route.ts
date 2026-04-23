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
    console.error('Error fetching blogs for Atom:', error);
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
  const now = new Date().toISOString();
  
  const atomEntries = blogs.map((blog: any) => {
    const publishedDate = blog.created_at 
      ? new Date(blog.created_at).toISOString() 
      : now;
    
    const updatedDate = blog.updated_at 
      ? new Date(blog.updated_at).toISOString() 
      : publishedDate;
    
    const summary = blog.summary 
      || blog.description 
      || stripHtml(blog.content || '').substring(0, 300);
    
    const postUrl = `${siteUrl}/blog/${blog.slug || blog.id}`;
    
    return `
  <entry>
    <title>${escapeXml(blog.title)}</title>
    <link href="${postUrl}" rel="alternate" type="text/html"/>
    <id>${postUrl}</id>
    <published>${publishedDate}</published>
    <updated>${updatedDate}</updated>
    <author>
      <name>Vikas Goyanka</name>
      <email>contact@vikasgoyanka.in</email>
      <uri>${siteUrl}</uri>
    </author>
    <summary type="text">${escapeXml(summary)}</summary>
    ${blog.tags?.map((tag: string) => `<category term="${escapeXml(tag)}"/>`).join('\n    ') || ''}
  </entry>`;
  }).join('');

  const atom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en-IN">
  <title>Vikas Goyanka Blog</title>
  <subtitle>Articles on Constitutional Law, Human Rights, Cyber Laws, technology, and personal reflections.</subtitle>
  <link href="${siteUrl}/blog/atom.xml" rel="self" type="application/atom+xml"/>
  <link href="${siteUrl}/blog" rel="alternate" type="text/html"/>
  <id>${siteUrl}/blog</id>
  <updated>${now}</updated>
  <author>
    <name>Vikas Goyanka</name>
    <email>contact@vikasgoyanka.in</email>
    <uri>${siteUrl}</uri>
  </author>
  <rights>Copyright ${new Date().getFullYear()} Vikas Goyanka. All rights reserved.</rights>
  <icon>${siteUrl}/favicon.ico</icon>
  <logo>${siteUrl}/og-blog.png</logo>
  <generator>Next.js</generator>
  ${atomEntries}
</feed>`;

  return new NextResponse(atom, {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
