import { Metadata } from 'next'
import { generateBreadcrumbStructuredData } from '../metadata'

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vikasgoyanka.in'

export const metadata: Metadata = {
  title: {
    default: 'Skills & Expertise | Vikas Goyanka',
    template: '%s | Skills - Vikas Goyanka'
  },
  description: 'Explore the professional skills, expertise, and certifications of Vikas Goyanka. Specializing in Constitutional Law, Human Rights, Cyber Laws, Legal Research, and Policy Analysis.',
  keywords: [
    'Vikas Goyanka skills',
    'legal expertise',
    'constitutional law expert',
    'human rights specialist',
    'cyber law knowledge',
    'legal research skills',
    'policy analysis',
    'law student skills',
    'professional certifications',
    'legal drafting',
    'litigation skills',
    'legal technology',
  ],
  authors: [{ name: 'Vikas Goyanka', url: siteUrl }],
  creator: 'Vikas Goyanka',
  publisher: 'Vikas Goyanka',
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: 'Skills & Expertise | Vikas Goyanka',
    description: 'Professional skills, expertise, and certifications in Constitutional Law, Human Rights, Cyber Laws, and Legal Research.',
    type: 'profile',
    locale: 'en_IN',
    url: `${siteUrl}/skills`,
    siteName: 'Vikas Goyanka',
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Vikas Goyanka - Skills & Expertise',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Skills & Expertise | Vikas Goyanka',
    description: 'Professional skills and certifications in Constitutional Law, Human Rights, and Legal Research.',
    creator: '@vikasgoyanka_in',
    site: '@vikasgoyanka_in',
    images: [`${siteUrl}/og-image.jpg`],
  },
  alternates: {
    canonical: `${siteUrl}/skills`,
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
const skillsBreadcrumb = generateBreadcrumbStructuredData([
  { name: 'Home', url: siteUrl },
  { name: 'Skills', url: `${siteUrl}/skills` },
])

// Skills structured data
const skillsStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  '@id': `${siteUrl}/skills/#profile`,
  name: 'Skills & Expertise - Vikas Goyanka',
  description: 'Professional skills, expertise, and certifications of Vikas Goyanka.',
  url: `${siteUrl}/skills`,
  mainEntity: {
    '@type': 'Person',
    name: 'Vikas Goyanka',
    url: siteUrl,
    knowsAbout: [
      'Constitutional Law',
      'Human Rights Law',
      'Cyber Laws',
      'Legal Research',
      'Policy Analysis',
      'Legal Drafting',
      'Litigation',
      'Political Science',
    ],
    hasCredential: [
      {
        '@type': 'EducationalOccupationalCredential',
        name: 'Law Degree',
        credentialCategory: 'degree',
      },
    ],
  },
}

export default function SkillsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(skillsStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(skillsBreadcrumb) }}
      />
      {children}
    </>
  )
}
