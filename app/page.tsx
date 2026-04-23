import React from "react"
import { loadProfileFromDatabase } from "@/lib/redis"
import { HomeNavbar } from "@/components/home/HomeNavbar"
import { HeroSection } from "@/components/home/HeroSection"
import { ExperienceSection } from "@/components/home/ExperienceSection"
import { EducationSection } from "@/components/home/EducationSection"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export async function generateMetadata() {
  const data = await loadProfileFromDatabase()
  const profileData = data?.profileData || { name: "Profile", title: "", bio: "", profileImage: "/placeholder.svg" }
  
  return {
    title: `${profileData.name} - ${profileData.title || "Profile"}`,
    description: profileData.bio || "Passionate advocate for constitutional rights and social justice.",
    openGraph: {
      title: `${profileData.name} - ${profileData.title || "Profile"}`,
      description: profileData.bio || "Passionate advocate for constitutional rights and social justice.",
      url: 'https://mywebsite.com',
      siteName: profileData.name,
      images: [
        {
          url: profileData.profileImage || "/placeholder.svg",
          width: 800,
          height: 600,
        },
      ],
      locale: 'en_US',
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${profileData.name} - ${profileData.title || "Profile"}`,
      description: profileData.bio || "Passionate advocate for constitutional rights and social justice.",
      images: [profileData.profileImage || "/placeholder.svg"],
    },
    icons: {
      icon: profileData.profileImage || "/placeholder.svg",
    },
  }
}

export default async function ModernProfile() {
  const data = await loadProfileFromDatabase()
  
  if (!data) {
     return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Failed to load profile data. Please ensure database is configured correctly.</div>
  }

  const { profileData, experience, education, navigationButtons } = data
  const socialLinks = profileData?.socialLinks || []

  return (
    <div className="min-h-screen bg-[#fafafc] selection:bg-blue-100 selection:text-blue-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: profileData.name,
            image: profileData.profileImage || "/placeholder.svg",
            jobTitle: profileData.title,
            description: profileData.bio,
            url: "https://mywebsite.com",
            sameAs: socialLinks?.map((s: any) => s.href),
            address: {
              "@type": "PostalAddress",
              addressLocality: profileData.contact?.location || '',
              addressCountry: "India"
            },
            email: profileData.contact?.email,
            alumniOf: education?.map((e: any) => ({ "@type": "EducationalOrganization", name: e.institution }))
          })
        }}
      />
      
      <div className="max-w-6xl mx-auto">
        <HomeNavbar 
          profileName={profileData.name}
          profileTitle={profileData.title}
          profileImage={profileData.profileImage}
          socialLinks={socialLinks}
        />

        <div className="px-4 py-8 lg:py-12">
          <HeroSection 
            profileData={profileData}
            navigationButtons={navigationButtons || []}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8 gap-y-8 mb-8 items-stretch">
            <ExperienceSection experience={experience || []} />
            <EducationSection education={education || []} />
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-950 text-gray-300 mt-20 relative overflow-hidden">
          <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
          <div className="px-6 py-16 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8">
              <div className="md:col-span-2">
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="w-14 h-14 ring-2 ring-gray-800">
                    <AvatarImage src={profileData.profileImage || "/placeholder.svg"} className="object-cover" />
                    <AvatarFallback className="bg-blue-600 text-white font-bold">
                      {profileData.name
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("") || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{profileData.name}</h3>
                    <p className="text-gray-400 font-medium">{profileData.title}</p>
                  </div>
                </div>
                <p className="text-gray-400 mb-8 max-w-md leading-relaxed">
                  Committed to advancing constitutional rights, social justice, and democratic values through legal
                  advocacy and political engagement.
                </p>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((social: any) => (
                    <Link
                      key={social.id}
                      href={social.href}
                      className="p-2.5 bg-gray-900 border border-gray-800 rounded-full hover:bg-gray-800 hover:border-gray-700 transition-all duration-300 group"
                    >
                      <img
                        src={social.icon || "/placeholder.svg"}
                        alt={social.name}
                        className="w-5 h-5 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all"
                      />
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-6 tracking-wide uppercase text-sm">Quick Links</h4>
                <ul className="space-y-3">
                  {['About Me', 'Skills & Expertise', 'Research', 'Blog', 'Speaking'].map((link) => (
                    <li key={link}>
                      <Link href={`/${link.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-700 group-hover:bg-blue-500 transition-colors"></span>
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-6 tracking-wide uppercase text-sm">Legal</h4>
                <ul className="space-y-3">
                  {['Privacy Policy', 'Terms of Service', 'Legal Disclaimer', 'Contact'].map((link) => (
                    <li key={link}>
                      <Link href={`/${link.toLowerCase().replace(/ /g, '-')}`} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-700 group-hover:bg-blue-500 transition-colors"></span>
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800/60 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
              <p>
                &copy; {new Date().getFullYear()} {profileData.name}. All rights reserved.
              </p>
              <p className="flex items-center gap-2">
                Building a just society through law and advocacy.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
