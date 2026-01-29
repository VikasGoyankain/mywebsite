"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Analytics } from "@vercel/analytics/next"
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
  Menu,
  X,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useProfileStore } from "@/lib/profile-store"
import { useDatabaseInit } from "@/hooks/use-database-init"
import { SubscribeButton } from "@/components/subscribe-button"

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

export default function ModernProfile() {
  useDatabaseInit() // Initialize database connection

  const { profileData, experience, education, skills, posts, navigationButtons } = useProfileStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
        {/* Header */}
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 ring-2 ring-blue-500/20">
                  <AvatarImage src={profileData.profileImage || "/placeholder.svg"} alt={profileData.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold">
                    {profileData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{profileData.name}</span>
                    <Verified className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="text-sm text-gray-600">{profileData.title}</span>
                </div>
              </div>

              {/* Desktop Social Links */}
              <div className="hidden md:flex items-center gap-2">
                {profileData.socialLinks.map((social) => (
                  <Link
                    key={social.id}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 rounded-full transition-all duration-200 hover:scale-105 relative group`}
                    aria-label={`Visit ${social.name} profile`}
                  >
                    <div className={`absolute inset-0 rounded-full ${social.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                    <img
                      src={social.icon}
                      alt={social.name}
                      className="w-4 h-4 relative z-10"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                  </Link>
                ))}
              </div>

              {/* Mobile Menu Button - using state to control menu visibility */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Mobile Social Links Menu */}
            {mobileMenuOpen && (
              <div className="md:hidden mt-3 py-3 border-t border-gray-100">
                <div className="flex items-center justify-center gap-4">
                  {profileData.socialLinks.map((social) => (
                    <Link
                      key={social.id}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2 rounded-full transition-all duration-200 hover:scale-105 relative group`}
                      aria-label={`Visit ${social.name} profile`}
                    >
                      <div className={`absolute inset-0 rounded-full ${social.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                      <img
                        src={social.icon}
                        alt={social.name}
                        className="w-4 h-4 relative z-10"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 py-8">
          {/* Profile Section */}
          <div className="mb-12">
            <div className="flex flex-col lg:flex-row gap-8 mb-10">
              {/* Profile Picture & Contact */}
              <div className="flex flex-col items-center lg:items-start">
                <div className="relative mb-8">
                  <div className="w-40 h-40 lg:w-48 lg:h-48 rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-50 to-purple-50 p-1">
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

                {/* Contact Info Card */}
                <Card className="p-5 w-full max-w-sm bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    Contact Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    <a
                      href={`mailto:${profileData.contact.email}`}
                      className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors group"
                    >
                      <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>{profileData.contact.email}</span>
                    </a>
                    <a
                      href={`tel:${profileData.contact.phone}`}
                      className="flex items-center gap-3 text-gray-700 hover:text-green-600 transition-colors group"
                    >
                      <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>{profileData.contact.phone}</span>
                    </a>
                    <div className="flex items-center gap-3 text-gray-700">
                      <MapPin className="w-4 h-4" />
                      <span>{profileData.contact.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Globe className="w-4 h-4" />
                      <span>{profileData.contact.availability}</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
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
                  {/* Subscribe Button */}
                  <div className="mt-8">
                    <SubscribeButton
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              {navigationButtons.map((button) => {
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
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                  Professional Experience
                </h2>
                <div className="space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                  {/* Sort experience by order field */}
                  {[...experience].sort((a, b) => (a.order || 0) - (b.order || 0)).map((exp) => (
                    <div key={exp.id} className="relative">
                      <div className="flex gap-4 p-5 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-purple-50 transition-all duration-300 border border-gray-100">
                        <Avatar className="w-14 h-14 ring-2 ring-white shadow-md">
                          <AvatarImage src={exp.image || "/placeholder.svg"} />
                          <AvatarFallback className="bg-blue-600 text-white font-bold">
                            {exp.company
                              .split(" ")
                              .map((word) => word[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-bold text-gray-900 text-lg">{exp.title}</h3>
                              <p className="text-blue-600 font-semibold">{exp.company}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {exp.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {exp.duration}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {exp.location}
                            </div>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{exp.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Education & Skills */}
            <div className="space-y-6">
              {/* Education */}
              <Card className="p-6 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-purple-600" />
                  Education
                </h2>
                <div className="space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                  {education.map((edu) => (
                    <div key={edu.id} className="relative">
                      <div className="border-l-4 border-purple-500 pl-6 pb-6">
                        <div className="absolute -left-2 top-0 w-4 h-4 bg-purple-500 rounded-full"></div>
                        <h3 className="font-bold text-gray-900 mb-1">{edu.degree}</h3>
                        <p className="text-purple-600 font-semibold mb-1">{edu.institution}</p>
                        <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                          <span>{edu.year}</span>
                          <span className="font-medium text-green-600">{edu.grade}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">{edu.specialization}</p>
                        <div className="space-y-1">
                          {edu.achievements.map((achievement, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <Award className="w-3 h-3 text-yellow-500" />
                              <span className="text-xs text-gray-600">{achievement}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}
