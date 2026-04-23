import React from "react"
import { loadProfileFromDatabase } from "@/lib/redis"
import { HomeNavbar } from "@/components/home/HomeNavbar"
import { HeroSection } from "@/components/home/HeroSection"
import { ExperienceSection } from "@/components/home/ExperienceSection"
import { EducationSection } from "@/components/home/EducationSection"
import { SignatureFooter } from "@/components/home/SignatureFooter"

export async function generateMetadata() {
  const data = await loadProfileFromDatabase()
  const profileData = data?.profileData || { name: "Vikas Goyanka", title: "The Obsidian Architect", bio: "", profileImage: "/placeholder.svg" }

  return {
    title: `${profileData.name} — ${profileData.title || "The Obsidian Architect"}`,
    description: profileData.bio || "Constitutional law, AI advocacy, and the next chapter — from NLU Delhi to Stanford. Strategic inquiries welcome.",
    openGraph: {
      title: `${profileData.name} — ${profileData.title || "The Obsidian Architect"}`,
      description: profileData.bio || "Constitutional law, AI advocacy, and the next chapter — from NLU Delhi to Stanford.",
      url: "https://vikasgoyanka.in",
      siteName: profileData.name,
      images: [{ url: profileData.profileImage || "/placeholder.svg", width: 1200, height: 630 }],
      locale: "en_US",
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `${profileData.name} — ${profileData.title || "The Obsidian Architect"}`,
      description: profileData.bio || "Constitutional law, AI advocacy, and the next chapter.",
      images: [profileData.profileImage || "/placeholder.svg"],
    },
  }
}

const FALLBACK = {
  profileData: {
    name: "Vikas Goyanka",
    title: "The Obsidian Architect",
    bio:
      "Law student at NLU Delhi · Founder, Gajraj Associates · Stanford aspirant. Building legal frameworks for the AI era — at the intersection of Indian jurisprudence and frontier technology.",
    profileImage: "/placeholder.svg",
    specializations: ["Constitutional Law", "AI Policy", "Cyber Law", "Public Advocacy"],
    contact: { email: "hello@vikasgoyanka.in", phone: "", location: "New Delhi · Palo Alto", availability: "Open to strategic engagements" },
    badges: [],
    socialLinks: [],
  },
  experience: [
    { id: "e1", title: "Founder", company: "Gajraj Associates", duration: "2024 — Present", location: "New Delhi", description: "Building a modern legal practice focused on constitutional litigation, AI policy advisory, and high-stakes strategy.", type: "Founder", image: "", order: 1 },
    { id: "e2", title: "Convenor", company: "Aawaaj Movement", duration: "2023 — Present", location: "India", description: "Civic-tech and rights advocacy — mobilising youth around constitutional values and digital rights.", type: "Movement", image: "", order: 2 },
    { id: "e3", title: "AI Advocate (Independent)", company: "Coin Code & Constitution", duration: "2024 — Present", location: "Global", description: "Writing and speaking on the legal architecture for AI, crypto regulation, and emerging tech in India.", type: "Author", image: "", order: 3 },
  ],
  education: [
    { id: "ed1", degree: "B.A. LL.B. (Hons.)", institution: "National Law University, Delhi", year: "2025 — 2030", grade: "", specialization: "Developing Legal Frameworks for AI", achievements: ["Cleared CLAT to enter India's top NLU"], order: 1 },
    { id: "ed2", degree: "LL.M. (Aspirant)", institution: "Stanford Law School", year: "Horizon", grade: "", specialization: "Law, Science & Technology", achievements: ["Long-term ambition: bridging Indian and Silicon Valley legal thought"], order: 2 },
  ],
  navigationButtons: [
    { id: "n1", text: "Expertise", href: "/expertise", icon: "Scale", description: "The Architect — frameworks, scholarship, advisory.", color: "" },
    { id: "n2", text: "Coin Code & Constitution", href: "/blog", icon: "Coins", description: "The Sovereign — essays on AI, crypto, and the rule of law.", color: "" },
    { id: "n3", text: "Ventures", href: "/research", icon: "Building2", description: "The Founder — Gajraj Associates and beyond.", color: "" },
    { id: "n4", text: "Inquire", href: "/contact", icon: "Sparkles", description: "Strategic engagements & speaking.", color: "" },
  ],
}

export default async function ModernProfile() {
  const fetched = await loadProfileFromDatabase()
  const data = fetched && fetched.profileData ? fetched : (FALLBACK as any)

  const { profileData, experience, education, navigationButtons } = data
  const socialLinks = profileData?.socialLinks || []

  return (
    <div className="min-h-screen bg-background text-foreground antialiased font-sans">
      {/* Structured data */}
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
            url: "https://vikasgoyanka.in",
            sameAs: socialLinks?.map((s: any) => s.href),
            address: { "@type": "PostalAddress", addressLocality: profileData.contact?.location || "", addressCountry: "India" },
            email: profileData.contact?.email,
            alumniOf: education?.map((e: any) => ({ "@type": "EducationalOrganization", name: e.institution })),
          }),
        }}
      />

      <HomeNavbar
        profileName={profileData.name}
        profileTitle={profileData.title}
        profileImage={profileData.profileImage}
        socialLinks={socialLinks}
      />

      <main className="px-4 sm:px-6 max-w-6xl mx-auto">
        <HeroSection profileData={profileData} navigationButtons={navigationButtons || []} />

        {/* Pedigree Timeline — Experience + Education side by side */}
        <section className="mt-4 sm:mt-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-[10px] tracking-[0.32em] uppercase text-gold font-sans">
                The Pedigree Timeline
              </span>
              <h2 className="font-serif-display text-3xl sm:text-4xl mt-2 text-foreground/95">
                Education &amp; Ventures · in parallel
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            <ExperienceSection experience={experience || []} />
            <EducationSection education={education || []} />
          </div>
        </section>
      </main>

      <SignatureFooter profileName={profileData.name} socialLinks={socialLinks} />
    </div>
  )
}
