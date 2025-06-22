"use client"

import React, { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  BarChart3,
  Settings,
  FileText,
  Users,
  Wrench,
  Star,
  Clock,
  TrendingUp,
  User,
  Award,
  Briefcase,
  Link as LinkIcon,
  Mail,
  MessageSquare,
  PlusCircle,
  UserPlus,
  Home,
  LogOut
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

interface AdminSection {
  id: string
  title: string
  description: string
  icon: string
  linkHref: string
  linkText: string
  category: 'frequent' | 'content' | 'management' | 'tools'
  priority: number
  isActive: boolean
  usageCount: number
  lastUsed?: string
  createdAt: string
  updatedAt: string
}

interface AdminSectionAnalytics {
  sectionId: string
  title: string
  totalUsage: number
  dailyUsage: number
  weeklyUsage: number
  monthlyUsage: number
  lastUsed: string
}

const iconOptions = [
  { value: "Settings", label: "Settings", Icon: Settings },
  { value: "FileText", label: "File Text", Icon: FileText },
  { value: "Users", label: "Users", Icon: Users },
  { value: "Wrench", label: "Wrench", Icon: Wrench },
  { value: "Star", label: "Star", Icon: Star },
  { value: "Clock", label: "Clock", Icon: Clock },
  { value: "BarChart3", label: "Analytics", Icon: BarChart3 },
  { value: "TrendingUp", label: "Trending", Icon: TrendingUp },
  { value: "User", label: "User", Icon: User },
  { value: "Award", label: "Award", Icon: Award },
  { value: "Briefcase", label: "Briefcase", Icon: Briefcase },
  { value: "Link", label: "Link", Icon: LinkIcon },
] as const

const categoryOptions = [
  { value: "frequent", label: "Frequently Used" },
  { value: "content", label: "Content Management" },
  { value: "management", label: "User & Settings" },
  { value: "tools", label: "Tools & Utilities" },
]

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
    'LogOut': LogOut,
    'BarChart3': BarChart3,
    'TrendingUp': TrendingUp
  }
  
  return iconMap[iconName] || Settings // Default to Settings if icon not found
}

export function AdminSectionManager() {
  const { toast } = useToast()
  const [sections, setSections] = useState<AdminSection[]>([])
  const [analytics, setAnalytics] = useState<AdminSectionAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [editingSection, setEditingSection] = useState<AdminSection | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("sections")

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    icon: "Settings",
    linkHref: "",
    linkText: "",
    category: "content" as const,
    priority: 0,
    isActive: true
  })

  // Load sections and analytics
  useEffect(() => {
    loadSections()
    loadAnalytics()
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
      toast({
        title: "Error",
        description: "Failed to load admin sections",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/sections/analytics')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingSection 
        ? `/api/admin/sections/${editingSection.id}`
        : '/api/admin/sections'
      
      const method = editingSection ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: editingSection 
            ? "Section updated successfully" 
            : "Section created successfully",
        })
        
        setIsDialogOpen(false)
        setEditingSection(null)
        resetForm()
        loadSections()
        loadAnalytics()
      } else {
        throw new Error('Failed to save section')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save section",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (section: AdminSection) => {
    setEditingSection(section)
    setFormData({
      title: section.title,
      description: section.description,
      icon: section.icon,
      linkHref: section.linkHref,
      linkText: section.linkText,
      category: section.category,
      priority: section.priority,
      isActive: section.isActive
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (sectionId: string) => {
    try {
      const response = await fetch(`/api/admin/sections/${sectionId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Section deleted successfully",
        })
        loadSections()
        loadAnalytics()
      } else {
        throw new Error('Failed to delete section')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete section",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      icon: "Settings",
      linkHref: "",
      linkText: "",
      category: "content",
      priority: 0,
      isActive: true
    })
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Admin Section Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingSection(null)
              resetForm()
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSection ? 'Edit Section' : 'Add New Section'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="icon">Icon</Label>
                  <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <option.Icon className="h-4 w-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="linkHref">URL Path</Label>
                  <Input
                    id="linkHref"
                    value={formData.linkHref}
                    onChange={(e) => setFormData({ ...formData, linkHref: e.target.value })}
                    placeholder="/admin/example"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="linkText">Button Text</Label>
                  <Input
                    id="linkText"
                    value={formData.linkText}
                    onChange={(e) => setFormData({ ...formData, linkText: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value: any) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingSection ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sections" className="space-y-4">
          <div className="grid gap-4">
            {sections.map((section) => (
              <Card key={section.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-primary/10 p-2">
                        {React.createElement(getIconComponent(section.icon), { className: "h-5 w-5" })}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{section.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={section.isActive ? "default" : "secondary"}>
                        {section.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">{section.category}</Badge>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(section)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Section</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{section.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(section.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">URL:</span> {section.linkHref}
                    </div>
                    <div>
                      <span className="font-medium">Button Text:</span> {section.linkText}
                    </div>
                    <div>
                      <span className="font-medium">Priority:</span> {section.priority}
                    </div>
                    <div>
                      <span className="font-medium">Usage Count:</span> {section.usageCount}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4">
            {analytics.map((item) => (
              <Card key={item.sectionId}>
                <CardHeader>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{item.totalUsage}</div>
                      <div className="text-sm text-muted-foreground">Total Usage</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{item.dailyUsage}</div>
                      <div className="text-sm text-muted-foreground">Today</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{item.weeklyUsage}</div>
                      <div className="text-sm text-muted-foreground">This Week</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{item.monthlyUsage}</div>
                      <div className="text-sm text-muted-foreground">This Month</div>
                    </div>
                  </div>
                  {item.lastUsed && (
                    <div className="mt-4 text-sm text-muted-foreground">
                      Last used: {new Date(item.lastUsed).toLocaleString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 
 