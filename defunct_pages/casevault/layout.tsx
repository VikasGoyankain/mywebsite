import { Metadata } from 'next'
import { generateBreadcrumbStructuredData } from '../metadata'

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vikasgoyanka.in'

export const metadata: Metadata = {
  title: {
    default: 'CaseVault - Legal Research & Case Database | Vikas Goyanka',
    template: '%s | CaseVault - Vikas Goyanka'
  },
  description: 'Comprehensive legal research database featuring detailed case summaries, landmark judgments, and litigation records. Explore Constitutional Law, Human Rights, and Cyber Law cases analyzed by Vikas Goyanka.',
  keywords: [
    'legal research',
    'case database',
    'litigation manager',
    'landmark judgments',
    'constitutional law cases',
    'human rights cases',
    'cyber law cases',
    'Indian case law',
    'Supreme Court judgments',
    'High Court cases',
    'legal case summaries',
    'Vikas Goyanka',
  ],
  authors: [{ name: 'Vikas Goyanka', url: siteUrl }],
  creator: 'Vikas Goyanka',
  publisher: 'Vikas Goyanka',
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: 'CaseVault - Legal Research & Case Database | Vikas Goyanka',
    description: 'Comprehensive legal research database with detailed case summaries, landmark judgments, and litigation records.',
    type: 'website',
    locale: 'en_IN',
    url: `${siteUrl}/casevault`,
    siteName: 'Vikas Goyanka',
    images: [
      {
        url: `${siteUrl}/og-casevault.png`,
        width: 1200,
        height: 630,
        alt: 'CaseVault - Legal Research Database',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CaseVault - Legal Research & Case Database',
    description: 'Comprehensive legal research database with detailed case summaries and landmark judgments.',
    creator: '@vikasgoyanka_in',
    site: '@vikasgoyanka_in',
    images: [`${siteUrl}/og-casevault.png`],
  },
  alternates: {
    canonical: `${siteUrl}/casevault`,
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
const casevaultBreadcrumb = generateBreadcrumbStructuredData([
  { name: 'Home', url: siteUrl },
  { name: 'CaseVault', url: `${siteUrl}/casevault` },
])

// CaseVault collection structured data
const casevaultStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': `${siteUrl}/casevault/#collection`,
  name: 'CaseVault - Legal Research Database',
  description: 'Comprehensive legal research database with detailed case summaries and litigation records.',
  url: `${siteUrl}/casevault`,
  mainEntity: {
    '@type': 'ItemList',
    name: 'Legal Cases Collection',
    description: 'Collection of legal case summaries and analyses',
  },
  author: {
    '@type': 'Person',
    name: 'Vikas Goyanka',
    url: siteUrl,
  },
}

export default function CaseVaultLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(casevaultStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(casevaultBreadcrumb) }}
      />
      <div>
        {children}
      </div>
    </>
  )
} 