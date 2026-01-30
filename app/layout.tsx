import type React from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ServiceWorkerRegistration } from "@/components/blog/ServiceWorkerRegistration"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3B82F6",
  colorScheme: "light",
}

export const metadata: Metadata = {
  title: "Vikas Goyanka",
  description:
    "Passionate for constitutional rights and social justice. Law student specializing in Constitutional Law, Cyber Laws & Human Rights, actively engaged in policy research and grassroots political work.",
  keywords:
    "Vikas Goyanka, law student, political activist, constitutional law, human rights, legal research, policy analysis, social justice, Delhi, India",
  authors: [{ name: "Vikas Goyanka" }],
  creator: "Vikas Goyanka",
  publisher: "Vikas Goyanka",
  robots: "index, follow",
  metadataBase: new URL("https://vikasgoyanka.in"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://vikasgoyanka.in",
    title: "Vikas Goyanka - Law Student & Political Activist",
    description:
      "Passionate advocate for constitutional rights and social justice. Specializing in Constitutional Law & Human Rights.",
    siteName: "Vikas Goyanka",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Vikas Goyanka - Law Student & Political Activist",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vikas Goyanka - Law Student & Political Activist",
    description: "Passionate advocate for constitutional rights and social justice.",
    creator: "@vikasgoyanka_in",
    images: ["/og-image.jpg"],
  },
  generator: "Next.js",
  applicationName: "Vikas Goyanka Portfolio",
  referrer: "origin-when-cross-origin",
  category: "portfolio",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://vikasgoyanka.in" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="google-site-verification" content="your-google-verification-code" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Vikas Goyanka",
              jobTitle: "Law Student & Political Activist",
              description: "Passionate advocate for constitutional rights and social justice",
              url: "https://vikasgoyanka.in",
              sameAs: [
                "https://www.instagram.com/vikasgoyanka.in/",
                "https://in.linkedin.com/in/vikas-goyanka-1a483a342",
                "https://x.com/vikasgoyanka_in",
                "https://t.me/Vikasgoyanka_in",
              ],
              address: {
                "@type": "PostalAddress",
                addressLocality: "New Delhi",
                addressCountry: "India",
              },
              email: "contact@vikasgoyanka.in",
              telephone: "+917597441305",
              alumniOf: [
                {
                  "@type": "EducationalOrganization",
                  name: "National Law University Delhi",
                },
                {
                  "@type": "EducationalOrganization",
                  name: "University of Delhi",
                },
              ],
              knowsAbout: [
                "Constitutional Law",
                "Human Rights",
                "Political Science",
                "Legal Research",
                "Policy Analysis",
              ],
            }),
          }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <ServiceWorkerRegistration />
        {children}
        <Toaster />
      </body>
    </html>
  )
}
