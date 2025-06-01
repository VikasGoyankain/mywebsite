"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Twitter,
  Linkedin,
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
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useProfileStore } from "@/lib/profile-store"
import { useState } from "react"
import { useDatabaseInit } from "@/hooks/use-database-init"
import { SubscribeButton } from "@/components/subscribe-button"

// Icon mapping for dynamic icons
const iconMap = {
  Instagram,
  Twitter,
  Linkedin,
  Send,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  Users,
  Gavel,
  Globe,
  GraduationCap,
  Heart,
  Star,
  Award,
  Briefcase,
  BookOpen,
  Facebook: Users, // Using Users as fallback for Facebook
  Youtube: Users, // Using Users as fallback for Youtube
  Github: Users, // Using Users as fallback for Github
}

export default function ModernProfile() {
  useDatabaseInit() // Initialize database connection

  const { profileData, experience, education, skills, posts, navigationPages } = useProfileStore()

  // Get posts by section
  const recentWorkPosts = posts.filter((post) => post.section === "recent-work")
  const articlePosts = posts.filter((post) => post.section === "articles")
  const achievementPosts = posts.filter((post) => post.section === "achievements")

  // Current active tab (you can make this stateful if needed)
  const [activeTab, setActiveTab] = useState("recent-work")
  const currentPosts =
    activeTab === "recent-work" ? recentWorkPosts : activeTab === "articles" ? articlePosts : achievementPosts

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
          <div className="px-4 py-3 flex items-center justify-between">
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
              <div className="hidden sm:block">
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
                    className="w-3.5 h-3.5 relative z-10"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
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

            {/* Navigation Pages */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              {navigationPages.map((page) => {
                const IconComponent = iconMap[page.icon as keyof typeof iconMap]
                return (
                  <Link key={page.id} href={page.href} className="group">
                    <Card className="p-6 text-center hover:shadow-2xl transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-2 border-0 bg-white/90 backdrop-blur-sm overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative z-10">
                        <div
                          className={`w-14 h-14 ${page.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-125 transition-all duration-300 shadow-lg group-hover:shadow-xl`}
                        >
                          {IconComponent && <IconComponent className="w-7 h-7 text-white" />}
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-2 group-hover:text-gray-800">
                          {page.title}
                        </h3>
                        <p className="text-xs text-gray-600 group-hover:text-gray-700">{page.description}</p>
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
                <div className="space-y-6">
                  {experience.map((exp) => (
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
                <div className="space-y-6">
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

          {/* Multi-Disciplinary Expertise Section - Horizontal */}
          <div className="py-12 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl mb-16 shadow-sm">
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Multi-Disciplinary Expertise
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  From legal frameworks to cutting-edge technology, discover a comprehensive 
                  skill set designed for today's complex professional landscape.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Legal Expertise */}
                <div 
                  className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6">
                    <Gavel className="w-8 h-8 text-amber-600" />
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">Legal Expertise</h3>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-amber-600">95%</span>
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{width: '95%'}}></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Comprehensive legal knowledge including contract law, corporate governance, 
                    and regulatory compliance with 8+ years of practice.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {skills
                      .filter((skill) => skill.category === "Legal")
                      .map((skill, index) => (
                        <Badge key={skill.id} variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 transition-colors">
                          {skill.name}
                        </Badge>
                      ))}
                    {skills.filter((skill) => skill.category === "Legal").length === 0 && 
                      <>
                        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 transition-colors">
                          Contract Law
                        </Badge>
                        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 transition-colors">
                          Corporate Law
                        </Badge>
                        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 transition-colors">
                          Compliance
                        </Badge>
                      </>
                    }
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>8+ years professional experience</span>
                  </div>
                </div>

                {/* Technical Skills */}
                <div 
                  className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                    <Globe className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">Technical Skills</h3>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-blue-600">92%</span>
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{width: '92%'}}></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Modern technology stack expertise including web development, 
                    data analysis, and cloud architecture with proven results.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {skills
                      .filter((skill) => skill.category === "Technical" || skill.category === "Research")
                      .map((skill, index) => (
                        <Badge key={skill.id} variant="outline" className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100 transition-colors">
                          {skill.name}
                        </Badge>
                      ))}
                    {skills.filter((skill) => skill.category === "Technical" || skill.category === "Research").length === 0 && 
                      <>
                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100 transition-colors">
                          React
                        </Badge>
                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100 transition-colors">
                          Python
                        </Badge>
                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100 transition-colors">
                          AWS
                        </Badge>
                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100 transition-colors">
                          Data Science
                        </Badge>
                      </>
                    }
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>5+ years professional experience</span>
                  </div>
                </div>

                {/* Leadership */}
                <div 
                  className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">Leadership</h3>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-purple-600">94%</span>
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{width: '94%'}}></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Proven leadership capabilities with team management, strategic planning, 
                    and communication skills developed over 7+ years.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {skills
                      .filter((skill) => skill.category === "Communication" || skill.category === "Leadership")
                      .map((skill, index) => (
                        <Badge key={skill.id} variant="outline" className="bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100 transition-colors">
                          {skill.name}
                        </Badge>
                      ))}
                    {skills.filter((skill) => skill.category === "Communication" || skill.category === "Leadership").length === 0 && 
                      <>
                        <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100 transition-colors">
                          Team Management
                        </Badge>
                        <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100 transition-colors">
                          Strategy
                        </Badge>
                        <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100 transition-colors">
                          Communication
                        </Badge>
                      </>
                    }
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>7+ years professional experience</span>
                  </div>
                </div>
              </div>

              <div className="text-center mt-12">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" asChild>
                  <Link href="/skills">
                    <div className="flex items-center gap-2">
                      View Detailed Skills Analysis
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                        <path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                      </svg>
                    </div>
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Content Tabs */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex items-center justify-center gap-8 mb-8">
              <button
                onClick={() => setActiveTab("recent-work")}
                className={`flex items-center gap-2 pt-4 px-4 ${
                  activeTab === "recent-work"
                    ? "text-gray-900 border-t-2 border-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <div
                  className={`w-4 h-4 ${
                    activeTab === "recent-work" ? "border-2 border-gray-900" : "border-2 border-gray-400"
                  }`}
                ></div>
                <span className={activeTab === "recent-work" ? "font-semibold" : "font-medium"}>
                  RECENT WORK ({recentWorkPosts.length})
                </span>
              </button>
              <button
                onClick={() => setActiveTab("articles")}
                className={`flex items-center gap-2 pt-4 px-4 ${
                  activeTab === "articles"
                    ? "text-gray-900 border-t-2 border-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span className={activeTab === "articles" ? "font-semibold" : "font-medium"}>
                  ARTICLES ({articlePosts.length})
                </span>
              </button>
              <button
                onClick={() => setActiveTab("achievements")}
                className={`flex items-center gap-2 pt-4 px-4 ${
                  activeTab === "achievements"
                    ? "text-gray-900 border-t-2 border-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Award className="w-4 h-4" />
                <span className={activeTab === "achievements" ? "font-semibold" : "font-medium"}>
                  ACHIEVEMENTS ({achievementPosts.length})
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentPosts.map((post) => (
                <Card
                  key={post.id}
                  className="group cursor-pointer overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative aspect-square">
                    <Image
                      src={post.image || "/placeholder.svg"}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-white/90 text-gray-800 backdrop-blur-sm">{post.category}</Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{post.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{post.date}</p>
                    {post.description && <p className="text-xs text-gray-500">{post.description}</p>}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-gray-900 to-blue-900 text-white mt-16">
          <div className="px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={profileData.profileImage || "/placeholder.svg"} />
                    <AvatarFallback className="bg-blue-600 text-white font-bold">
                      {profileData.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold">{profileData.name}</h3>
                    <p className="text-gray-300">{profileData.title}</p>
                  </div>
                </div>
                <p className="text-gray-300 mb-4 max-w-md">
                  Committed to advancing constitutional rights, social justice, and democratic values through legal
                  advocacy and political engagement.
                </p>
                <div className="flex gap-4">
                  {profileData.socialLinks.map((social) => (
                    <Link
                      key={social.id}
                      href={social.href}
                      className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                    >
                      <img
                        src={social.icon}
                        alt={social.name}
                        className="w-5 h-5"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>
                    <Link href="/about" className="hover:text-white transition-colors">
                      About Me
                    </Link>
                  </li>
                  <li>
                    <Link href="/skills" className="hover:text-white transition-colors">
                      Skills & Expertise
                    </Link>
                  </li>
                  <li>
                    <Link href="/research" className="hover:text-white transition-colors">
                      Research
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog" className="hover:text-white transition-colors">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link href="/speaking" className="hover:text-white transition-colors">
                      Speaking
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>
                    <Link href="/privacy" className="hover:text-white transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="hover:text-white transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link href="/disclaimer" className="hover:text-white transition-colors">
                      Legal Disclaimer
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:text-white transition-colors">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
              <p>
                &copy; {new Date().getFullYear()} {profileData.name}. All rights reserved. | Building a just society
                through law and advocacy.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
