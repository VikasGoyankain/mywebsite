"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Award, BookOpen, Wrench, Filter, Star, Calendar, Download, ExternalLink, CheckCircle, Book } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useProfileStore } from '@/lib/profile-store'
import { useDatabaseInit } from '@/hooks/use-database-init'
import type { Skill, Certificate, ProfileData } from '@/lib/profile-store'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import Link from 'next/link'

interface SkillSector {
  id: string
  title: string
  description: string
  color: string
  icon: string
  skills: Skill[]
}

// Group skills by category
const groupSkillsByCategory = (skills: Skill[]): SkillSector[] => {
  const categories = {
    'legal': {
      id: 'legal',
      title: 'Legal Expertise',
      description: 'Comprehensive legal knowledge and practice areas',
      color: 'from-blue-500 to-blue-700',
      icon: '⚖️',
      skills: [] as Skill[]
    },
    'technical': {
      id: 'technical',
      title: 'Technical Skills',
      description: 'Modern technology stack and development expertise',
      color: 'from-green-500 to-green-700',
      icon: '💻',
      skills: [] as Skill[]
    },
    'social': {
      id: 'social',
      title: 'Social & Leadership',
      description: 'Interpersonal skills and team management capabilities',
      color: 'from-purple-500 to-purple-700',
      icon: '👥',
      skills: [] as Skill[]
    },
    'policy': {
      id: 'policy',
      title: 'Policy & Government',
      description: 'Policy development and governmental affairs experience',
      color: 'from-orange-500 to-orange-700',
      icon: '🏛️',
      skills: [] as Skill[]
    },
    'research': {
      id: 'research',
      title: 'Research & Analysis',
      description: 'Academic research and analytical capabilities',
      color: 'from-pink-500 to-pink-700', 
      icon: '🔬',
      skills: [] as Skill[]
    },
    'communication': {
      id: 'communication',
      title: 'Communication & Media',
      description: 'Media relations and public speaking abilities',
      color: 'from-indigo-500 to-indigo-700',
      icon: '🎙️',
      skills: [] as Skill[]
    }
  };
  
  // Filter out empty categories after grouping
  skills.forEach(skill => {
    const category = skill.category.toLowerCase();
    if (categories[category as keyof typeof categories]) {
      categories[category as keyof typeof categories].skills.push(skill);
    } else {
      // Default to technical if category doesn't match
      categories.technical.skills.push(skill);
    }
  });
  
  // Return only categories that have skills
  return Object.values(categories).filter(category => category.skills.length > 0);
};

export default function SkillsPage() {
  const [expandedSector, setExpandedSector] = useState<string | null>(null)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [topSkills, setTopSkills] = useState<Skill[]>([])
  const [skillSectors, setSkillSectors] = useState<SkillSector[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [experienceYears, setExperienceYears] = useState<number>(0)
  const [certificateCount, setCertificateCount] = useState<number>(0)

  // Initialize database connection
  useDatabaseInit()

  // Get skills and certificates from profile store
  const { skills, certificates = [], profileData, isLoading: storeLoading, error: storeError } = useProfileStore()

  useEffect(() => {
    if (!storeLoading) {
      if (storeError) {
        setError(storeError)
      } else if (skills) {
        // Group skills by category
        const groupedSkills = groupSkillsByCategory(skills as Skill[]);
        setSkillSectors(groupedSkills);
        
        // Set top skills (for now, just use the first 6 skills as top skills)
        setTopSkills(skills.slice(0, 6) as Skill[]);

        // Calculate experience years from March 1, 2023
        const startDate = new Date('2023-03-01');
        const currentDate = new Date();
        const diffInYears = (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        setExperienceYears(Math.floor(diffInYears));

        // Set certificate count
        setCertificateCount(certificates.length);
      }
      setLoading(false)
    }
  }, [skills, certificates, storeLoading, storeError])

  // Filter certificates based on selected filter
  const filteredCertificates = selectedFilter === 'all' 
    ? certificates 
    : certificates.filter(cert => cert.category?.toLowerCase().includes(selectedFilter.toLowerCase()));

  // Get unique certificate categories for tabs
  const uniqueCategories = Array.from(new Set(certificates.map(cert => cert.category)))
    .filter(Boolean)
    .sort();

  const toggleSector = (sectorId: string) => {
    setExpandedSector(expandedSector === sectorId ? null : sectorId)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-lg text-gray-600">Loading skills and expertise data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center max-w-md px-6">
          <div className="text-red-500 text-5xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Banner */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 text-white"
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Skills & Expertise
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              A comprehensive showcase of professional capabilities spanning legal expertise, 
              technical innovation, and leadership excellence.
            </p>
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-8 flex flex-wrap justify-center gap-4"
            >
              <Badge variant="secondary" className="text-lg px-4 py-2">{experienceYears}+ Years Experience</Badge>
              <Badge variant="secondary" className="text-lg px-4 py-2">{certificateCount}+ Certifications</Badge>
              <Badge variant="secondary" className="text-lg px-4 py-2">Multi-Disciplinary</Badge>
            </motion.div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-50 to-transparent"></div>
      </motion.section>

      {/* Top Skills Carousel */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Top Skills</h2>
            <p className="text-xl text-slate-600">My most proficient and experienced capabilities</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topSkills.slice(0, 6).map((skill, index) => (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-gradient-to-br from-white to-slate-50 rounded-xl p-6 shadow-lg border border-slate-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl">{skill.icon}</div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-semibold text-slate-700">{skill.proficiency}%</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{skill.name}</h3>
                <p className="text-slate-600 text-sm mb-3">{skill.experience}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {skill.subSkills?.slice(0, 3).map((subSkill, i) => (
                    <Badge key={i} variant="outline" className="bg-slate-50">
                      {subSkill}
                    </Badge>
                  ))}
                  {skill.subSkills && skill.subSkills.length > 3 && (
                    <Badge variant="outline" className="bg-slate-50">
                      +{skill.subSkills.length - 3} more
                    </Badge>
                  )}
                </div>
                {skill.tools && skill.tools.length > 0 && (
                  <p className="text-xs text-slate-500">
                    <span className="font-semibold">Tools: </span>
                    {skill.tools.slice(0, 3).join(", ")}
                    {skill.tools.length > 3 && ` +${skill.tools.length - 3} more`}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Skill Sectors */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Expertise Categories</h2>
            <p className="text-xl text-slate-600">Explore detailed breakdowns of my professional skill sectors</p>
          </motion.div>
          
          <div className="space-y-6">
            {skillSectors.map((sector, index) => (
              <motion.div
                key={sector.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200"
              >
                <button
                  onClick={() => toggleSector(sector.id)}
                  className="w-full p-6 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${sector.color} flex items-center justify-center text-white text-2xl shadow-lg`}>
                      {sector.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{sector.title}</h3>
                      <p className="text-slate-600">{sector.description}</p>
                    </div>
                  </div>
                  <ChevronDown className={`transition-transform duration-300 ${expandedSector === sector.id ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {expandedSector === sector.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 space-y-6">
                        {sector.skills.map((skill, skillIndex) => (
                          <motion.div
                            key={skill.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: skillIndex * 0.1, duration: 0.4 }}
                            className="bg-slate-50 rounded-lg p-6"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="text-2xl">{skill.icon}</div>
                                <div>
                                  <h4 className="text-xl font-semibold text-slate-900">{skill.name}</h4>
                                  <p className="text-slate-600">{skill.experience} • Level {skill.proficiency}%</p>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                              <div>
                                <h5 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                                  <Wrench className="w-4 h-4" /> Sub-skills
                                </h5>
                                <div className="flex flex-wrap gap-2">
                                  {skill.subSkills?.map((subSkill, i) => (
                                    <Badge key={i} variant="outline">{subSkill}</Badge>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <h5 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                                  <Award className="w-4 h-4" /> Achievements
                                </h5>
                                {skill.achievements && skill.achievements.length > 0 && (
                                  <div className="mt-4">
                                    <ul className="space-y-2">
                                      {skill.achievements.map((achievement, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                          <span>{achievement}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <div>
                                <h5 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                                  <BookOpen className="w-4 h-4" /> Reference Materials
                                </h5>
                                {skill.books && skill.books.length > 0 && (
                                  <div className="mt-4">
                                    <ul className="space-y-2">
                                      {skill.books.map((book, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                          <Book className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                          <span>{book}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                              
                              <div>
                                <h5 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                                  <Wrench className="w-4 h-4" /> Tools & Technologies
                                </h5>
                                <div className="flex flex-wrap gap-2">
                                  {skill.tools?.map((tool, i) => (
                                    <Badge key={i} variant="secondary" className="bg-slate-200">{tool}</Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Certifications & Credentials</h2>
            <p className="text-xl text-slate-600">Professional certifications and formal qualifications</p>
          </motion.div>
          
          <div className="mb-8">
            <Tabs defaultValue="all">
              <div className="flex justify-between items-center mb-6">
                <TabsList className="overflow-x-auto flex-wrap">
                  <TabsTrigger value="all" onClick={() => setSelectedFilter('all')}>All</TabsTrigger>
                  {uniqueCategories.map(category => (
                    <TabsTrigger 
                      key={category} 
                      value={category?.toLowerCase() || ''} 
                      onClick={() => setSelectedFilter(category?.toLowerCase() || '')}
                    >
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-500" />
                  <select 
                    className="text-sm border-none bg-transparent focus:ring-0 text-slate-700 font-medium"
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    value={selectedFilter}
                  >
                    <option value="all">All Certifications</option>
                    {uniqueCategories.map(category => (
                      <option key={category} value={category?.toLowerCase() || ''}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <TabsContent value="all" className="mt-0">
                {certificates.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-lg">
                    <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-700">No certificates added yet</h3>
                    <p className="text-slate-500 mt-2">Add certificates from the admin panel to display them here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredCertificates.map((cert, index) => (
                      <motion.div
                        key={cert.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.6 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200"
                      >
                        <div className="aspect-[4/3] relative bg-slate-100">
                          {cert.imageUrl ? (
                            <img 
                              src={cert.imageUrl} 
                              alt={cert.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=Certificate';
                              }}
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                              <Award className="w-16 h-16" />
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4">
                          <h3 className="font-semibold text-slate-900">{cert.name}</h3>
                          <div className="flex justify-between items-center mt-1 mb-2">
                            <p className="text-sm text-slate-700">{cert.issuer}</p>
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <Calendar className="w-3 h-3" />
                              {cert.date ? new Date(cert.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'No date'}
                            </div>
                          </div>
                          
                          {cert.category && (
                            <Badge variant="secondary" className="text-xs bg-slate-100 mb-2">
                              {cert.category}
                            </Badge>
                          )}
                          
                          {cert.credentialUrl && (
                            <a 
                              href={cert.credentialUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs flex items-center gap-1 text-blue-600 hover:underline mt-2"
                            >
                              <ExternalLink className="w-3 h-3" /> Verify Certificate
                            </a>
                          )}

                          {cert.expiry && (
                            <p className="text-xs text-slate-500 mt-2">
                              Expires: {new Date(cert.expiry).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              {/* Dynamic tabs for each category */}
              {uniqueCategories.map(category => (
                <TabsContent key={category} value={category?.toLowerCase() || ''} className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {certificates
                      .filter(cert => cert.category?.toLowerCase() === category?.toLowerCase())
                      .map((cert, index) => (
                        <motion.div
                          key={cert.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.6 }}
                          whileHover={{ y: -5, scale: 1.02 }}
                          className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200"
                        >
                          <div className="aspect-[4/3] relative bg-slate-100">
                            {cert.imageUrl ? (
                              <img 
                                src={cert.imageUrl} 
                                alt={cert.name} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=Certificate';
                                }}
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                                <Award className="w-16 h-16" />
                              </div>
                            )}
                          </div>
                          
                          <div className="p-4">
                            <h3 className="font-semibold text-slate-900">{cert.name}</h3>
                            <div className="flex justify-between items-center mt-1 mb-2">
                              <p className="text-sm text-slate-700">{cert.issuer}</p>
                              <div className="flex items-center gap-1 text-xs text-slate-500">
                                <Calendar className="w-3 h-3" />
                                {cert.date ? new Date(cert.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'No date'}
                              </div>
                            </div>
                            
                            {cert.category && (
                              <Badge variant="secondary" className="text-xs bg-slate-100 mb-2">
                                {cert.category}
                              </Badge>
                            )}
                            
                            {cert.credentialUrl && (
                              <a 
                                href={cert.credentialUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs flex items-center gap-1 text-blue-600 hover:underline mt-2"
                              >
                                <ExternalLink className="w-3 h-3" /> Verify Certificate
                              </a>
                            )}
                            
                            {cert.expiry && (
                              <p className="text-xs text-slate-500 mt-2">
                                Expires: {new Date(cert.expiry).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-blue-900 text-white mt-16">
        <div className="px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={profileData?.profileImage || "/placeholder.svg"} />
                  <AvatarFallback className="bg-blue-600 text-white font-bold">
                    {profileData?.name
                      ? profileData.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                      : ""}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{profileData?.name || ""}</h3>
                  <p className="text-gray-300">{profileData?.title || ""}</p>
                </div>
              </div>
              <p className="text-gray-300 mb-4 max-w-md">
                Committed to advancing constitutional rights, social justice, and democratic values through legal
                advocacy and political engagement.
              </p>
              <div className="flex gap-4">
                {profileData?.socialLinks?.map((social) => (
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
              &copy; {new Date().getFullYear()} {profileData?.name || ""}. All rights reserved. | Building a just society
              through law and advocacy.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
} 