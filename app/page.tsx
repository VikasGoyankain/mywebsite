"use client"

import React, { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Footer } from "@/components/Footer"
import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Twitter,
  Linkedin,
  Facebook,
  Github,
  Youtube,
  Heart,
  GraduationCap,
  Award,
  Briefcase,
  BookOpen,
  Star,
  MessageSquare,
  FileText,
  Users,
  Gavel,
  Globe,
  Verified,
  Send,
  Clock,
  BookMarked,
  School,
  Mic,
  Landmark,
  Scale,
  Lightbulb,
  Users2,
  Megaphone,
  Vote,
  ScrollText,
  Building2,
  Sparkles,
  Brain,
  Target,
  Shield,
  Handshake,
  Scroll,
  BookOpenCheck,
  Presentation,
  Speech,
  Flag,
  Crown,
  ChevronDown,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { useProfileStore } from "@/lib/profile-store"
import { useDatabaseInit } from "@/hooks/use-database-init"
import { SubscribeButton } from "@/components/subscribe-button"
import { ExperienceCard } from "@/components/personal/ExperienceCard"
import { EducationCard } from "@/components/personal/EducationCard"
import { cn } from "@/lib/utils"

// Icon mapping for dynamic icons
const iconMap = {
  Award: Award,
  Star: Star,
  Heart: Heart,
  BookOpen: BookOpen,
  Briefcase: Briefcase,
  GraduationCap: GraduationCap,
  Gavel: Gavel,
  Globe: Globe,
  Users: Users,
  FileText: FileText,
  MessageSquare: MessageSquare,
  Send: Send,
  Verified: Verified,
  Clock: Clock,
  Mail: Mail,
  Phone: Phone,
  MapPin: MapPin,
  BookMarked: BookMarked,
  School: School,
  Mic: Mic,
  Landmark: Landmark,
  Scale: Scale,
  Lightbulb: Lightbulb,
  Users2: Users2,
  Megaphone: Megaphone,
  Vote: Vote,
  ScrollText: ScrollText,
  Building2: Building2,
  Sparkles: Sparkles,
  Brain: Brain,
  Target: Target,
  Shield: Shield,
  Handshake: Handshake,
  Scroll: Scroll,
  BookOpenCheck: BookOpenCheck,
  Presentation: Presentation,
  Speech: Speech,
  Flag: Flag,
  Crown: Crown,
  // Social Media Icons with proper casing
  LinkedIn: Linkedin,
  Twitter: Twitter,
  Instagram: Instagram,
  Facebook: Facebook,
  Youtube: Youtube,
  GitHub: Github,
  // Fallback icon
  Default: Users,
} as const;

// Social icon mapping
const socialIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LinkedIn: Linkedin,
  Twitter: Twitter,
  Instagram: Instagram,
  Facebook: Facebook,
  Youtube: Youtube,
  GitHub: Github,
  Mail: Mail,
}

export default function ModernProfile() {
  useDatabaseInit() // Initialize database connection

  const { profileData, experience, education, skills, posts, navigationButtons } = useProfileStore()
  const [showAllExperience, setShowAllExperience] = useState(false)
  const [showAllEducation, setShowAllEducation] = useState(false)

  const INITIAL_ITEMS_COUNT = 3

  // Sort items by order
  const sortedExperience = [...experience].sort((a, b) => (a.order || 0) - (b.order || 0))
  const sortedEducation = [...education].sort((a, b) => (a.order || 0) - (b.order || 0))

  const displayedExperience = showAllExperience ? sortedExperience : sortedExperience.slice(0, INITIAL_ITEMS_COUNT)
  const displayedEducation = showAllEducation ? sortedEducation : sortedEducation.slice(0, INITIAL_ITEMS_COUNT)

  // --- SEO & Favicon logic ---
  useEffect(() => {
    if (!profileData?.name) return;
    // Title & Description
    document.title = `${profileData.name} - ${profileData.title || "Profile"}`;
    const description = profileData.bio || "Passionate advocate for constitutional rights and social justice.";
    const image = profileData.profileImage || "/placeholder.svg";
    // Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);
    // Open Graph
    const setOG = (property: string, content: string) => {
      let el = document.querySelector(`meta[property='${property}']`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };
    setOG('og:title', document.title);
    setOG('og:description', description);
    setOG('og:image', image);
    setOG('og:type', 'profile');
    setOG('og:url', window.location.href);
    // Twitter
    const setTwitter = (name: string, content: string) => {
      let el = document.querySelector(`meta[name='${name}']`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };
    setTwitter('twitter:card', 'summary_large_image');
    setTwitter('twitter:title', document.title);
    setTwitter('twitter:description', description);
    setTwitter('twitter:image', image);
    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.href);
    // Favicon
    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.setAttribute('rel', 'icon');
      document.head.appendChild(favicon);
    }
    favicon.setAttribute('href', image);
    // JSON-LD Structured Data
    const scriptId = 'profile-jsonld';
    let jsonld = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (jsonld) jsonld.remove();
    jsonld = document.createElement('script');
    (jsonld as HTMLScriptElement).type = 'application/ld+json';
    jsonld.id = scriptId;
    jsonld.innerHTML = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Person",
      name: profileData.name,
      image,
      jobTitle: profileData.title,
      description,
      url: window.location.href,
      sameAs: profileData.socialLinks?.map((s: any) => s.href),
      address: {
        "@type": "PostalAddress",
        addressLocality: profileData.contact?.location || '',
        addressCountry: "India"
      },
      email: profileData.contact?.email,
      alumniOf: education?.map((e: any) => ({ "@type": "EducationalOrganization", name: e.institution }))
    });
    document.head.appendChild(jsonld);
  }, [profileData, education]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto">
        <div className="px-4 py-8">
          {/* Profile Section */}
          <div className="mb-12">
            {/* Profile Header - LinkedIn Style */}
            <Card className="p-8 mb-10 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Profile Picture - Left Side */}
                <div className="flex-shrink-0">
                  <div className="w-40 h-40 md:w-48 md:h-48 rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-50 to-purple-50 p-1">
                    <Avatar className="w-full h-full rounded-xl">
                      <AvatarImage
                        src={profileData.profileImage || "/placeholder.svg"}
                        alt={`${profileData.name} - ${profileData.title}`}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-xl">
                        {profileData.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>

                {/* Profile Info - Right Side */}
                <div className="flex-1 min-w-0">
                <div className="mb-6">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 flex items-center gap-3">
                    {profileData.name}
                    <Verified className="w-7 h-7 text-blue-500" />
                  </h1>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {profileData.badges.map((badge) => {
                      const IconComponent = iconMap[badge.icon as keyof typeof iconMap]
                      return (
                        <Badge key={badge.id} className={`${badge.color} px-3 py-1`}>
                          {IconComponent && <IconComponent className="w-4 h-4 mr-1" />}
                          {badge.text}
                        </Badge>
                      )
                    })}
                  </div>
                </div>

                <div className="prose prose-lg text-gray-700 mb-8">
                  <p className="text-lg leading-relaxed">{profileData.bio}</p>
                  <div className="text-base text-gray-600 mt-4">
                    {profileData.specializations.map((spec, index) => (
                      <div key={index}>{spec}</div>
                    ))}
                  </div>
                </div>
                </div>
              </div>
            </Card>

            {/* Navigation Buttons */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {navigationButtons.filter(button => button.isVisible !== false).map((button) => {
                const IconComponent = iconMap[button.icon as keyof typeof iconMap]
                return (
                  <Link key={button.id} href={button.href} className="group">
                    <Card className="p-6 text-center hover:shadow-2xl transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-2 border-0 bg-white/90 backdrop-blur-sm overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative z-10">
                        <div
                          className={`w-14 h-14 ${button.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-125 transition-all duration-300 shadow-lg group-hover:shadow-xl`}
                        >
                          {IconComponent && <IconComponent className="w-7 h-7 text-white" />}
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-2 group-hover:text-gray-800">
                          {button.text}
                        </h3>
                        {button.description && (
                          <p className="text-xs text-gray-600 group-hover:text-gray-700">{button.description}</p>
                        )}
                      </div>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Professional Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Experience */}
            <div className="lg:col-span-2">
              <Card className="p-6 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                    Professional Experience
                  </h2>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {experience.length} {experience.length === 1 ? 'position' : 'positions'}
                  </span>
                </div>
                <div className="space-y-3">
                  {displayedExperience.map((exp, index) => (
                    <ExperienceCard 
                      key={exp.id} 
                      experience={exp}
                      defaultExpanded={index === 0}
                    />
                  ))}
                  
                  {/* Show More Button */}
                  {sortedExperience.length > INITIAL_ITEMS_COUNT && (
                    <button
                      onClick={() => setShowAllExperience(!showAllExperience)}
                      className="w-full py-3 text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2 transition-colors border-t border-gray-100 mt-4"
                    >
                      {showAllExperience ? (
                        <>Show less</>
                      ) : (
                        <>Show {sortedExperience.length - INITIAL_ITEMS_COUNT} more</>
                      )}
                      <ChevronDown className={cn(
                        "w-4 h-4 transition-transform",
                        showAllExperience && "rotate-180"
                      )} />
                    </button>
                  )}
                </div>
              </Card>
            </div>

            {/* Education */}
            <div className="space-y-6">
              <Card className="p-6 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <GraduationCap className="w-6 h-6 text-purple-600" />
                    Education
                  </h2>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {education.length} {education.length === 1 ? 'degree' : 'degrees'}
                  </span>
                </div>
                <div className="space-y-3">
                  {displayedEducation.map((edu, index) => (
                    <EducationCard 
                      key={edu.id} 
                      education={edu}
                      defaultExpanded={index === 0}
                    />
                  ))}
                  
                  {/* Show More Button */}
                  {sortedEducation.length > INITIAL_ITEMS_COUNT && (
                    <button
                      onClick={() => setShowAllEducation(!showAllEducation)}
                      className="w-full py-3 text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center justify-center gap-2 transition-colors border-t border-gray-100 mt-4"
                    >
                      {showAllEducation ? (
                        <>Show less</>
                      ) : (
                        <>Show {sortedEducation.length - INITIAL_ITEMS_COUNT} more</>
                      )}
                      <ChevronDown className={cn(
                        "w-4 h-4 transition-transform",
                        showAllEducation && "rotate-180"
                      )} />
                    </button>
                  )}
                </div>
              </Card>
            </div>
          </div>

        </div>

        <Footer />
      </div>
    </div>
  )
}

