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
  BookOpen,
  Layout,
  UserCircle,
  Wrench,
  Scale,
  Pin
} from "lucide-react"
import { useDatabaseInit } from "@/hooks/use-database-init"
import Link from "next/link"
import { LogoutButton } from "@/components/admin/LogoutButton"
import type { AdminCategory } from "@/lib/admin-categories"
import type { AdminSection } from "@/lib/admin-sections"

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
    <Card className="overflow-hidden transition-all hover:shadow-md border-2 hover:border-primary/50">
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

// Icon mapping function
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
    'BookOpen': BookOpen,
    'Layout': Layout,
    'UserCircle': UserCircle,
    'Wrench': Wrench,
    'Scale': Scale,
    'LogOut': LogOut
  }
  
  const IconComponent = iconMap[iconName] || Settings
  return <IconComponent className="h-5 w-5" />
}

interface CategoryWithSections extends AdminCategory {
  sections: AdminSection[]
}

function AdminDashboard() {
  try {
    useDatabaseInit()
  } catch (error) {
    console.error("Error initializing database:", error);
  }

  const [username, setUsername] = useState("Admin")
  const [lastLogin, setLastLogin] = useState<string | null>(null)
  const [categories, setCategories] = useState<CategoryWithSections[]>([])
  const [pinnedSections, setPinnedSections] = useState<AdminSection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Retrieve last login time
    const storedLastLogin = localStorage.getItem('lastLoginTime')
    if (storedLastLogin) {
      setLastLogin(new Date(storedLastLogin).toLocaleString())
    }
    
    localStorage.setItem('lastLoginTime', new Date().toISOString())
    loadDashboardData()
  }, [])
  
  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch categories and sections
      const [categoriesRes, sectionsRes] = await Promise.all([
        fetch('/api/admin/categories'),
        fetch('/api/admin/sections')
      ])

      if (categoriesRes.ok && sectionsRes.ok) {
        const categoriesData: AdminCategory[] = await categoriesRes.json()
        const sectionsData: AdminSection[] = await sectionsRes.json()
        
        // Get pinned sections
        const pinned = sectionsData.filter(section => section.isPinned)
        setPinnedSections(pinned)
        
        // Group sections by category
        const categoriesWithSections: CategoryWithSections[] = categoriesData.map(category => ({
          ...category,
          sections: sectionsData.filter(section => section.categoryId === category.id)
        }))
        
        setCategories(categoriesWithSections)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-muted-foreground">Loading dashboard...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {username}
              {lastLogin && <span className="text-xs ml-2">Last login: {lastLogin}</span>}
            </p>
          </div>
          <LogoutButton />
        </div>

        {/* Categories and Sections */}
        {categories.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No sections configured yet.</p>
              <Button asChild>
                <Link href="/admin/admin-settings">
                  Go to Settings to Configure
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Pinned Sections */}
            {pinnedSections.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b pb-2">
                  <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600">
                    <Pin className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">Pinned Sections</h2>
                    <p className="text-sm text-muted-foreground">Quick access to your favorite sections</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pinnedSections.map((section) => (
                    <DashboardCard
                      key={`pinned-${section.id}`}
                      title={section.title}
                      description={section.description}
                      icon={getIconComponent(section.icon)}
                      linkHref={section.linkHref}
                      linkText={section.linkText}
                    />
                  ))}
                </div>
              </div>
            )}
          
            {/* Regular Categories */}
            {categories.map((category) => (
            <div key={category.id} className="space-y-4">
              {/* Category Header */}
              <div className="flex items-center gap-3 border-b pb-2">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  {getIconComponent(category.icon)}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">{category.name}</h2>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
              </div>

              {/* Category Sections */}
              {category.sections.length === 0 ? (
                <p className="text-sm text-muted-foreground pl-4">No items in this category</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.sections.map((section) => (
                    <DashboardCard
                      key={section.id}
                      title={section.title}
                      description={section.description}
                      icon={getIconComponent(section.icon)}
                      linkHref={section.linkHref}
                      linkText={section.linkText}
                    />
                  ))}
                </div>
              )}
            </div>
          ))
          }
          </>
        )}

        {/* Quick Actions Footer */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Need Help?</h3>
                <p className="text-sm text-muted-foreground">
                  Configure categories and sections in settings
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href="/admin/admin-settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
