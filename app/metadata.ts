import type { Metadata } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vikasgoyanka.in'

// Default site metadata
export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Vikas Goyanka - Law Student, Political Activist & Legal Researcher',
    template: '%s | Vikas Goyanka'
  },
  description: 'Vikas Goyanka is a law student and political activist specializing in Constitutional Law, Human Rights, and Cyber Laws. Engaged in policy research, legal analysis, and grassroots political work in Delhi, India.',
  keywords: [
    'Vikas Goyanka',
    'law student',
    'political activist',
    'constitutional law',
    'human rights lawyer',
    'legal research',
    'policy analysis',
    'social justice',
    'cyber laws',
    'Delhi lawyer',
    'India law',
    'National Law University Delhi',
    'legal blog',
    'law articles',
    'constitutional rights',
    'legal advocacy',
  ],
  authors: [{ name: 'Vikas Goyanka', url: siteUrl }],
  creator: 'Vikas Goyanka',
  publisher: 'Vikas Goyanka',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteUrl,
    siteName: 'Vikas Goyanka',
    title: 'Vikas Goyanka - Law Student, Political Activist & Legal Researcher',
    description: 'Passionate advocate for constitutional rights and social justice. Specializing in Constitutional Law, Human Rights & Cyber Laws.',
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Vikas Goyanka - Law Student & Political Activist',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vikas Goyanka - Law Student & Political Activist',
    description: 'Passionate advocate for constitutional rights and social justice.',
    creator: '@vikasgoyanka_in',
    site: '@vikasgoyanka_in',
    images: [`${siteUrl}/og-image.jpg`],
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
    google: process.env.GOOGLE_SITE_VERIFICATION || '',
    yandex: process.env.YANDEX_VERIFICATION || '',
    yahoo: process.env.YAHOO_VERIFICATION || '',
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      'en-IN': siteUrl,
      'en': siteUrl,
    },
  },
  category: 'portfolio',
  generator: 'Next.js',
  applicationName: 'Vikas Goyanka Portfolio',
  referrer: 'origin-when-cross-origin',
}

// Person structured data for the homepage
export const personStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${siteUrl}/#person`,
  name: 'Vikas Goyanka',
  givenName: 'Vikas',
  familyName: 'Goyanka',
  jobTitle: 'Law Student & Political Activist',
  description: 'Passionate advocate for constitutional rights and social justice. Law student specializing in Constitutional Law, Cyber Laws & Human Rights.',
  url: siteUrl,
  image: `${siteUrl}/og-image.jpg`,
  sameAs: [
    'https://www.instagram.com/vikasgoyanka.in/',
    'https://in.linkedin.com/in/vikas-goyanka-1a483a342',
    'https://x.com/vikasgoyanka_in',
    'https://t.me/Vikasgoyanka_in',
  ],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'New Delhi',
    addressRegion: 'Delhi',
    addressCountry: 'India',
  },
  email: 'contact@vikasgoyanka.in',
  telephone: '+917597441305',
  alumniOf: [
    {
      '@type': 'EducationalOrganization',
      name: 'National Law University Delhi',
    },
    {
      '@type': 'EducationalOrganization',
      name: 'University of Delhi',
    },
  ],
  knowsAbout: [
    'Constitutional Law',
    'Human Rights',
    'Cyber Laws',
    'Political Science',
    'Legal Research',
    'Policy Analysis',
    'Social Justice',
  ],
  hasOccupation: {
    '@type': 'Occupation',
    name: 'Law Student',
    occupationalCategory: 'Legal Professional',
  },
}

// Website structured data
export const websiteStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${siteUrl}/#website`,
  url: siteUrl,
  name: 'Vikas Goyanka',
  description: 'Personal website and portfolio of Vikas Goyanka - Law Student & Political Activist',
  publisher: {
    '@id': `${siteUrl}/#person`,
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteUrl}/blog?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
  inLanguage: 'en-IN',
}

// Organization structured data (optional, for professional presence)
export const organizationStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${siteUrl}/#organization`,
  name: 'Vikas Goyanka',
  url: siteUrl,
  logo: `${siteUrl}/og-image.jpg`,
  sameAs: [
    'https://www.instagram.com/vikasgoyanka.in/',
    'https://in.linkedin.com/in/vikas-goyanka-1a483a342',
    'https://x.com/vikasgoyanka_in',
    'https://t.me/Vikasgoyanka_in',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+917597441305',
    contactType: 'customer service',
    email: 'contact@vikasgoyanka.in',
    availableLanguage: ['English', 'Hindi'],
  },
}

// Blog collection structured data
export const blogStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  '@id': `${siteUrl}/blog/#blog`,
  mainEntityOfPage: `${siteUrl}/blog`,
  name: 'Vikas Goyanka Blog',
  description: 'Articles on law, technology, systems thinking, and personal reflections by Vikas Goyanka.',
  url: `${siteUrl}/blog`,
  author: {
    '@id': `${siteUrl}/#person`,
  },
  publisher: {
    '@id': `${siteUrl}/#person`,
  },
  inLanguage: 'en-IN',
}

// Breadcrumb generator
export function generateBreadcrumbStructuredData(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

// Blog post structured data generator
export function generateBlogPostStructuredData(post: {
  title: string
  description?: string
  content?: string
  slug: string
  createdAt: string
  updatedAt?: string
  tags?: string[]
  coverImage?: string
}) {
  const postUrl = `${siteUrl}/blog/${post.slug}`
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${postUrl}/#blogpost`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    headline: post.title,
    description: post.description || post.content?.replace(/<[^>]*>/g, '').substring(0, 160),
    image: post.coverImage || `${siteUrl}/og-blog.png`,
    datePublished: post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    author: {
      '@id': `${siteUrl}/#person`,
    },
    publisher: {
      '@id': `${siteUrl}/#person`,
    },
    url: postUrl,
    keywords: post.tags?.join(', '),
    wordCount: post.content?.split(/\s+/).length || 0,
    articleSection: 'Blog',
    inLanguage: 'en-IN',
    isPartOf: {
      '@id': `${siteUrl}/blog/#blog`,
    },
  }
}

// FAQ structured data generator
export function generateFAQStructuredData(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}
