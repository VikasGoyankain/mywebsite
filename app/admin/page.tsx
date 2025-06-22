"use client"

import React, { useState, useEffect, Suspense } from "react"
import { ErrorBoundary } from 'react-error-boundary'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  User,
  Briefcase,
  GraduationCap,
  Star,
  Users,
  Award,
  LogOut,
  Settings,
  FileText,
  Link as LinkIcon,
  Mail,
  MessageSquare,
  PlusCircle,
  UserPlus,
  Home,
  Clock,
  Wrench
} from "lucide-react"
import { useDatabaseInit } from "@/hooks/use-database-init"
import Link from "next/link"
import { LogoutButton } from "@/components/admin/LogoutButton"
import { DashboardCard } from "@/components/admin/DashboardCard"

function ErrorFallback({error}: {error: Error}) {
  return (
    <div className="p-6 bg-red-50 text-red-800 rounded-lg">
      <h2 className="text-lg font-semibold mb-2">Something went wrong:</h2>
      <pre className="text-sm overflow-auto p-2 bg-white border border-red-200 rounded">
        {error.message}
      </pre>
      <div className="mt-4">
        <a href="/admin" className="text-blue-600 hover:underline">Try again</a>
      </div>
    </div>
  );
}

export default function AdminDashboardWrapper() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<div className="p-6">Loading admin dashboard...</div>}>
        <AdminDashboard />
      </Suspense>
    </ErrorBoundary>
  );
}

interface DashboardCardProps {
  title: string
  description: string
  icon: React.ReactNode
  linkHref: string
  linkText: string
}

function DashboardCard({ title, description, icon, linkHref, linkText }: DashboardCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <Button asChild variant="default" className="w-full">
          <Link href={linkHref}>
            {linkText}
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

// Add usage tracking interface
interface AdminSection {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  linkHref: string
  linkText: string
  category: 'frequent' | 'content' | 'management' | 'tools'
  priority: number
}

// Add the getIconComponent function
const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    'User': User,
    'Briefcase': Briefcase,
    'GraduationCap': GraduationCap,
    'Star': Star,
    'Users': Users,
    'Award': Award,
    'Settings': Settings,
    'FileText': FileText,
    'Link': LinkIcon,
    'Mail': Mail,
    'MessageSquare': MessageSquare,
    'PlusCircle': PlusCircle,
    'UserPlus': UserPlus,
    'Home': Home,
    'Clock': Clock,
    'Wrench': Wrench,
    'LogOut': LogOut
  }
  
  return iconMap[iconName] || Settings // Default to Settings if icon not found
}

function AdminDashboard() {
  try {
    useDatabaseInit() // Initialize database connection
  } catch (error) {
    console.error("Error initializing database:", error);
  }

  const [username, setUsername] = useState("Admin")
  const [lastLogin, setLastLogin] = useState<string | null>(null)

  // Usage tracking state
  const [sectionUsage, setSectionUsage] = useState<Record<string, number>>({})
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([])

  const [sections, setSections] = useState<AdminSection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Retrieve last login time from localStorage if available
    const storedLastLogin = localStorage.getItem('lastLoginTime')
    if (storedLastLogin) {
      setLastLogin(new Date(storedLastLogin).toLocaleString())
    }
    
    // Store current login time
    localStorage.setItem('lastLoginTime', new Date().toISOString())

    // Load usage data from localStorage
    const savedUsage = localStorage.getItem('adminSectionUsage')
    const savedRecent = localStorage.getItem('adminRecentlyUsed')
    
    if (savedUsage) {
      setSectionUsage(JSON.parse(savedUsage))
    }
    if (savedRecent) {
      setRecentlyUsed(JSON.parse(savedRecent))
    }

    loadSections()
  }, [])
  
  const loadSections = async () => {
    try {
      const response = await fetch('/api/admin/sections')
      if (response.ok) {
        const data = await response.json()
        setSections(data)
      }
    } catch (error) {
      console.error('Error loading sections:', error)
    } finally {
      setLoading(false)
    }
  }

  const trackSectionUsage = async (sectionId: string) => {
    // Update local state
    const newUsage = { ...sectionUsage }
    newUsage[sectionId] = (newUsage[sectionId] || 0) + 1
    setSectionUsage(newUsage)
    localStorage.setItem('adminSectionUsage', JSON.stringify(newUsage))
    
    // Update recently used
    const newRecent = [sectionId, ...recentlyUsed.filter(id => id !== sectionId)].slice(0, 5)
    setRecentlyUsed(newRecent)
    localStorage.setItem('adminRecentlyUsed', JSON.stringify(newRecent))

    // Record usage in Redis
    try {
      await fetch(`/api/admin/sections/${sectionId}/usage`, {
        method: 'POST'
      })
    } catch (error) {
      console.error('Error recording usage:', error)
    }
  }

  // Convert database sections to AdminSection format
  const allSections: AdminSection[] = sections.map(section => ({
    id: section.id,
    title: section.title,
    description: section.description,
    icon: React.createElement(getIconComponent(section.icon), { className: "h-5 w-5" }),
    linkHref: section.linkHref,
    linkText: section.linkText,
    category: section.category,
    priority: section.priority
  }))

  // Smart ordering function
  const getOrderedSections = () => {
    return allSections.sort((a, b) => {
      // First priority: Recently used (last 5)
      const aRecent = recentlyUsed.indexOf(a.id)
      const bRecent = recentlyUsed.indexOf(b.id)
      
      if (aRecent !== -1 && bRecent !== -1) {
        return aRecent - bRecent // Most recent first
      }
      if (aRecent !== -1) return -1
      if (bRecent !== -1) return 1
      
      // Second priority: Usage frequency
      const aUsage = sectionUsage[a.id] || 0
      const bUsage = sectionUsage[b.id] || 0
      
      if (aUsage !== bUsage) {
        return bUsage - aUsage // Most used first
      }
      
      // Third priority: Category and original priority
      return a.priority - b.priority
    })
  }

  const orderedSections = getOrderedSections()

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your website content and settings
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block mr-4">
            <p className="font-medium">{username}</p>
            {lastLogin && (
              <p className="text-xs text-muted-foreground">Last login: {lastLogin}</p>
            )}
          </div>
          <LogoutButton />
        </div>
      </header>

      {/* Recently Used Section */}
      {recentlyUsed.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recently Used
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {recentlyUsed.slice(0, 3).map(sectionId => {
              const section = allSections.find(s => s.id === sectionId)
              if (!section) return null
              
              return (
                <Card key={section.id} className="overflow-hidden transition-all hover:shadow-md border-primary/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium">{section.title}</CardTitle>
                    <div className="rounded-full bg-primary/10 p-2 text-primary">
                      {section.icon}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{section.description}</p>
                    <Button 
                      asChild 
                      variant="default" 
                      className="w-full"
                      onClick={() => trackSectionUsage(section.id)}
                    >
                      <Link href={section.linkHref}>
                        {section.linkText}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* All Sections with Categories */}
      <div className="space-y-8">
        {['frequent', 'content', 'management', 'tools'].map(category => {
          const categorySections = orderedSections.filter(s => s.category === category)
          if (categorySections.length === 0) return null
          
          const categoryLabels = {
            frequent: 'Frequently Used',
            content: 'Content Management',
            management: 'User & Settings',
            tools: 'Tools & Utilities'
          }
          
          return (
            <div key={category}>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                {category === 'frequent' && <Star className="h-5 w-5" />}
                {category === 'content' && <FileText className="h-5 w-5" />}
                {category === 'management' && <Settings className="h-5 w-5" />}
                {category === 'tools' && <Wrench className="h-5 w-5" />}
                {categoryLabels[category]}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categorySections.map(section => (
                  <Card key={section.id} className="overflow-hidden transition-all hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-lg font-medium">{section.title}</CardTitle>
                      <div className="rounded-full bg-primary/10 p-2 text-primary">
                        {section.icon}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{section.description}</p>
                      <Button 
                        asChild 
                        variant="default" 
                        className="w-full"
                        onClick={() => trackSectionUsage(section.id)}
                      >
                        <Link href={section.linkHref}>
                          {section.linkText}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
