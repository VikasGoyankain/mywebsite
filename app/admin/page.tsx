"use client"

import React, { useState, useEffect, Suspense } from "react"
import { ErrorBoundary } from 'react-error-boundary'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  FileText } from "lucide-react"
import { useDatabaseInit } from "@/hooks/use-database-init"
import Link from "next/link"
import { LogoutButton } from "@/components/admin/LogoutButton"

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

function AdminDashboard() {
  try {
    useDatabaseInit() // Initialize database connection
  } catch (error) {
    console.error("Error initializing database:", error);
  }

  const [username, setUsername] = useState("Admin")
  const [lastLogin, setLastLogin] = useState<string | null>(null)

  useEffect(() => {
    // Retrieve last login time from localStorage if available
    const storedLastLogin = localStorage.getItem('lastLoginTime')
    if (storedLastLogin) {
      setLastLogin(new Date(storedLastLogin).toLocaleString())
    }
    
    // Store current login time
    localStorage.setItem('lastLoginTime', new Date().toISOString())
  }, [])
  
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard
          title="Profile"
          description="Update your personal information and contact details"
          icon={<User className="h-5 w-5" />}
          linkHref="/admin/profile"
          linkText="Edit Profile"
        />
        <DashboardCard
          title="Skills & Expertise"
          description="Manage your professional skills and competencies"
          icon={<Star className="h-5 w-5" />}
          linkHref="/admin/skills"
          linkText="Manage Skills"
        />
        <DashboardCard
          title="Case Studies"
          description="Add and edit your professional case studies"
          icon={<Briefcase className="h-5 w-5" />}
          linkHref="/admin/cases"
          linkText="Manage Cases"
        />
        <DashboardCard
          title="Research Publications"
          description="Update your academic research and publications"
          icon={<GraduationCap className="h-5 w-5" />}
          linkHref="/admin/research"
          linkText="Manage Research"
        />
        <DashboardCard
          title="Certificates"
          description="Manage your professional certifications"
          icon={<Award className="h-5 w-5" />}
          linkHref="/admin/certificates"
          linkText="Manage Certificates"
        />
        <DashboardCard
          title="Subscribers"
          description="View and manage newsletter subscribers"
          icon={<Users className="h-5 w-5" />}
          linkHref="/admin/subscribers"
          linkText="Manage Subscribers"
        />
        <DashboardCard
          title="Settings"
          description="Configure your website settings and preferences"
          icon={<Settings className="h-5 w-5" />}
          linkHref="/admin/settings"
          linkText="Manage Settings"
        />
        <DashboardCard
          title="Posts"
          description="Manage your professional insights and articles"
          icon={<FileText className="h-5 w-5" />}
          linkHref="/admin/posts"
          linkText="Manage Posts"
        />
      </div>
    </div>
  )
}
