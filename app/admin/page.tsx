"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Users,
  Award,
  Star,
  Link as LinkIcon,
  Activity,
  PlusCircle
} from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    posts: 0,
    subscribers: 0,
    works: 0
  })

  // Basic mock fetch for stats - you can connect this to actual APIs later
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [postsRes, subsRes, worksRes] = await Promise.all([
          fetch('/api/posts').catch(() => null),
          fetch('/api/subscribers').catch(() => null),
          fetch('/api/works').catch(() => null)
        ])
        
        setStats({
          posts: postsRes?.ok ? (await postsRes.json()).length || 0 : 0,
          subscribers: subsRes?.ok ? (await subsRes.json()).length || 0 : 0,
          works: worksRes?.ok ? (await worksRes.json()).length || 0 : 0
        })
      } catch (e) {
        console.error("Failed to fetch stats", e)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full p-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, Admin</h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Here's what's happening with your website today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/posts?new=true">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Post
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-t-4 border-t-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.posts || '--'}</div>
            <p className="text-xs text-muted-foreground mt-1">Published articles</p>
          </CardContent>
        </Card>
        
        <Card className="border-t-4 border-t-emerald-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.subscribers || '--'}</div>
            <p className="text-xs text-muted-foreground mt-1">Active newsletter readers</p>
          </CardContent>
        </Card>
        
        <Card className="border-t-4 border-t-purple-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Works</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.works || '--'}</div>
            <p className="text-xs text-muted-foreground mt-1">Showcased projects</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions / Shortcuts */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Quick Actions
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/admin/posts" className="group">
            <Card className="h-full hover:border-primary/50 hover:bg-muted/50 transition-colors">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center gap-2">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="font-medium">Write a Post</div>
                <div className="text-xs text-muted-foreground">Manage your blog</div>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/admin/url-shortner" className="group">
            <Card className="h-full hover:border-primary/50 hover:bg-muted/50 transition-colors">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center gap-2">
                <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                  <LinkIcon className="h-6 w-6" />
                </div>
                <div className="font-medium">Shorten URL</div>
                <div className="text-xs text-muted-foreground">Create custom links</div>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/admin/subscribers" className="group">
            <Card className="h-full hover:border-primary/50 hover:bg-muted/50 transition-colors">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center gap-2">
                <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6" />
                </div>
                <div className="font-medium">Email List</div>
                <div className="text-xs text-muted-foreground">Manage subscribers</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/expertise" className="group">
            <Card className="h-full hover:border-primary/50 hover:bg-muted/50 transition-colors">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center gap-2">
                <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                  <Star className="h-6 w-6" />
                </div>
                <div className="font-medium">Update Skills</div>
                <div className="text-xs text-muted-foreground">Manage expertise</div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
