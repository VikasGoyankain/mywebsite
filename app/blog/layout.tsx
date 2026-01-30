import { Metadata } from 'next';
import { blogStructuredData, generateBreadcrumbStructuredData } from '../metadata';

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vikasgoyanka.in';

export const metadata: Metadata = {
  title: {
    default: 'Blog — Thoughts & Reflections on Law, Technology & Society',
    template: '%s | Vikas Goyanka Blog'
  },
  description: 'Explore insightful articles on Constitutional Law, Human Rights, Cyber Laws, technology, systems thinking, and personal reflections by Vikas Goyanka. Legal analysis, policy research, and documented thinking.',
  keywords: [
    'Vikas Goyanka',
    'legal blog',
    'law articles',
    'constitutional law blog',
    'human rights articles',
    'cyber law',
    'legal insights',
    'law and technology',
    'systems thinking',
    'legal practice',
    'digital transformation',
    'personal reflections',
    'legal articles India',
    'thought leadership',
    'professional insights',
    'Delhi lawyer blog',
    'Indian law blog',
  ],
  authors: [{ name: 'Vikas Goyanka', url: siteUrl }],
  creator: 'Vikas Goyanka',
  publisher: 'Vikas Goyanka',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: 'Blog — Thoughts & Reflections on Law, Technology & Society | Vikas Goyanka',
    description: 'Explore insightful articles on Constitutional Law, Human Rights, Cyber Laws, technology, and personal reflections. Legal analysis and documented thinking.',
    type: 'website',
    locale: 'en_IN',
    url: `${siteUrl}/blog`,
    siteName: 'Vikas Goyanka',
    images: [
      {
        url: `${siteUrl}/og-blog.png`,
        width: 1200,
        height: 630,
        alt: 'Vikas Goyanka Blog - Law, Technology & Society',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog — Law, Technology & Society | Vikas Goyanka',
    description: 'Explore articles on Constitutional Law, Human Rights, Cyber Laws, and personal reflections.',
    creator: '@vikasgoyanka_in',
    site: '@vikasgoyanka_in',
    images: [`${siteUrl}/og-blog.png`],
  },
  alternates: {
    canonical: `${siteUrl}/blog`,
    types: {
      'application/rss+xml': `${siteUrl}/blog/feed.xml`,
      'application/atom+xml': `${siteUrl}/blog/atom.xml`,
    },
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
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  category: 'blog',
};

// Breadcrumb for blog listing page
const blogBreadcrumb = generateBreadcrumbStructuredData([
  { name: 'Home', url: siteUrl },
  { name: 'Blog', url: `${siteUrl}/blog` },
]);

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Blog Collection Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogStructuredData) }}
      />
      {/* Breadcrumb Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogBreadcrumb) }}
      />
      {children}
    </>
  );
}
