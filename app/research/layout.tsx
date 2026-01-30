import { Metadata } from 'next'
import { generateBreadcrumbStructuredData } from '../metadata'

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vikasgoyanka.in'

export const metadata: Metadata = {
  title: {
    default: 'Research & Publications | Vikas Goyanka',
    template: '%s | Research - Vikas Goyanka'
  },
  description: 'Explore academic research, publications, and scholarly work by Vikas Goyanka. Covering Constitutional Law, Human Rights, Cyber Laws, Political Science, and Policy Analysis.',
  keywords: [
    'Vikas Goyanka research',
    'legal research',
    'academic publications',
    'constitutional law research',
    'human rights research',
    'cyber law studies',
    'policy analysis',
    'legal scholarship',
    'law research papers',
    'Indian legal research',
    'law student publications',
    'scholarly articles',
  ],
  authors: [{ name: 'Vikas Goyanka', url: siteUrl }],
  creator: 'Vikas Goyanka',
  publisher: 'Vikas Goyanka',
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: 'Research & Publications | Vikas Goyanka',
    description: 'Explore academic research, publications, and scholarly work on Constitutional Law, Human Rights, Cyber Laws, and Policy Analysis.',
    type: 'website',
    locale: 'en_IN',
    url: `${siteUrl}/research`,
    siteName: 'Vikas Goyanka',
    images: [
      {
        url: `${siteUrl}/og-research.png`,
        width: 1200,
        height: 630,
        alt: 'Vikas Goyanka - Research & Publications',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Research & Publications | Vikas Goyanka',
    description: 'Explore academic research and scholarly work on Constitutional Law, Human Rights, and Policy Analysis.',
    creator: '@vikasgoyanka_in',
    site: '@vikasgoyanka_in',
    images: [`${siteUrl}/og-research.png`],
  },
  alternates: {
    canonical: `${siteUrl}/research`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

// Breadcrumb structured data
const researchBreadcrumb = generateBreadcrumbStructuredData([
  { name: 'Home', url: siteUrl },
  { name: 'Research', url: `${siteUrl}/research` },
])

// Research collection structured data
const researchStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': `${siteUrl}/research/#collection`,
  name: 'Research & Publications',
  description: 'Academic research, publications, and scholarly work by Vikas Goyanka.',
  url: `${siteUrl}/research`,
  about: [
    {
      '@type': 'Thing',
      name: 'Constitutional Law',
    },
    {
      '@type': 'Thing',
      name: 'Human Rights',
    },
    {
      '@type': 'Thing',
      name: 'Cyber Laws',
    },
    {
      '@type': 'Thing',
      name: 'Policy Analysis',
    },
  ],
  author: {
    '@type': 'Person',
    name: 'Vikas Goyanka',
    url: siteUrl,
  },
  publisher: {
    '@type': 'Person',
    name: 'Vikas Goyanka',
  },
}

// Scholar profile structured data
const scholarStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'ScholarlyArticle',
  author: {
    '@type': 'Person',
    name: 'Vikas Goyanka',
    url: siteUrl,
    affiliation: {
      '@type': 'EducationalOrganization',
      name: 'National Law University Delhi',
    },
  },
}

export default function ResearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(researchStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(researchBreadcrumb) }}
      />
      {children}
    </>
  )
}
