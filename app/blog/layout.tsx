import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Blog — Thoughts & Reflections',
    template: '%s — Blog'
  },
  description: 'Personal reflections, insights on projects and systems, and documented thinking. A quiet space for ideas worth sharing.',
  keywords: ['blog', 'thoughts', 'reflections', 'insights', 'projects', 'personal knowledge'],
  openGraph: {
    title: 'Blog — Thoughts & Reflections',
    description: 'Personal reflections, insights on projects and systems, and documented thinking.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: 'Blog — Thoughts & Reflections',
    description: 'Personal reflections, insights on projects and systems, and documented thinking.',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://vikasgoyanka.in'}/blog`,
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
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
