"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  FolderPlus,
  FileText,
  User,
  Settings,
  Star,
  Users,
  Award,
  Link as LinkIcon,
  Mail,
  MessageSquare,
  BookOpen,
  Layout,
  UserCircle,
  Wrench,
  Scale,
  Briefcase,
  GraduationCap,
  ChevronUp,
  ChevronDown,
  Pin,
  PinOff
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { AdminCategory } from "@/lib/admin-categories"
import type { AdminSection } from "@/lib/admin-sections"

interface CategoryWithSections extends AdminCategory {
  sections: AdminSection[]
}

// Available icons
const ICON_OPTIONS = [
  { value: 'FileText', label: 'File Text', icon: FileText },
  { value: 'User', label: 'User', icon: User },
  { value: 'Settings', label: 'Settings', icon: Settings },
  { value: 'Star', label: 'Star', icon: Star },
  { value: 'Users', label: 'Users', icon: Users },
  { value: 'Award', label: 'Award', icon: Award },
  { value: 'Link', label: 'Link', icon: LinkIcon },
  { value: 'Mail', label: 'Mail', icon: Mail },
  { value: 'MessageSquare', label: 'Message', icon: MessageSquare },
  { value: 'BookOpen', label: 'Book', icon: BookOpen },
  { value: 'Layout', label: 'Layout', icon: Layout },
  { value: 'UserCircle', label: 'User Circle', icon: UserCircle },
  { value: 'Wrench', label: 'Wrench', icon: Wrench },
  { value: 'Scale', label: 'Scale', icon: Scale },
  { value: 'Briefcase', label: 'Briefcase', icon: Briefcase },
  { value: 'GraduationCap', label: 'Graduation', icon: GraduationCap },
]

export function AdminConfigManager() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<CategoryWithSections[]>([])
  const [loading, setLoading] = useState(true)
  
  // Category dialog state
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null)
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: 'FileText',
    isActive: true
  })
  
  // Section dialog state
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<AdminSection | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [sectionForm, setSectionForm] = useState({
    title: '',
    description: '',
    icon: 'FileText',
    linkHref: '',
    linkText: '',
    categoryId: '',
    isActive: true
  })
  
  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'category' | 'section', id: string } | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [categoriesRes, sectionsRes] = await Promise.all([
        fetch('/api/admin/categories'),
        fetch('/api/admin/sections')
      ])

      if (categoriesRes.ok && sectionsRes.ok) {
        const categoriesData: AdminCategory[] = await categoriesRes.json()
        const sectionsData: AdminSection[] = await sectionsRes.json()
        
        const categoriesWithSections: CategoryWithSections[] = categoriesData.map(category => ({
          ...category,
          sections: sectionsData.filter(section => section.categoryId === category.id)
        }))
        
        setCategories(categoriesWithSections)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "Error",
        description: "Failed to load admin configuration",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Category handlers
  const openCategoryDialog = (category?: AdminCategory) => {
    if (category) {
      setEditingCategory(category)
      setCategoryForm({
        name: category.name,
        description: category.description,
        icon: category.icon,
        isActive: category.isActive
      })
    } else {
      setEditingCategory(null)
      setCategoryForm({
        name: '',
        description: '',
        icon: 'FileText',
        isActive: true
      })
    }
    setCategoryDialogOpen(true)
  }

  const handleSaveCategory = async () => {
    try {
      if (!categoryForm.name || !categoryForm.description) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        })
        return
      }

      const url = editingCategory 
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories'
      
      const method = editingCategory ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Category ${editingCategory ? 'updated' : 'created'} successfully`
        })
        setCategoryDialogOpen(false)
        loadData()
      } else {
        throw new Error('Failed to save category')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save category",
        variant: "destructive"
      })
    }
  }

  const handleDeleteCategory = async () => {
    if (!deleteTarget || deleteTarget.type !== 'category') return

    try {
      const response = await fetch(`/api/admin/categories/${deleteTarget.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Category deleted successfully"
        })
        loadData()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to delete category",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive"
      })
    } finally {
      setDeleteTarget(null)
    }
  }

  // Section handlers
  const openSectionDialog = (categoryId: string, section?: AdminSection) => {
    setSelectedCategoryId(categoryId)
    
    if (section) {
      setEditingSection(section)
      setSectionForm({
        title: section.title,
        description: section.description,
        icon: section.icon,
        linkHref: section.linkHref,
        linkText: section.linkText,
        categoryId: section.categoryId,
        isActive: section.isActive
      })
    } else {
      setEditingSection(null)
      setSectionForm({
        title: '',
        description: '',
        icon: 'FileText',
        linkHref: '',
        linkText: '',
        categoryId: categoryId,
        isActive: true
      })
    }
    setSectionDialogOpen(true)
  }

  const handleSaveSection = async () => {
    try {
      if (!sectionForm.title || !sectionForm.description || !sectionForm.linkHref || !sectionForm.linkText) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        })
        return
      }

      const url = editingSection 
        ? `/api/admin/sections/${editingSection.id}`
        : '/api/admin/sections'
      
      const method = editingSection ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sectionForm)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Section ${editingSection ? 'updated' : 'created'} successfully`
        })
        setSectionDialogOpen(false)
        loadData()
      } else {
        throw new Error('Failed to save section')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save section",
        variant: "destructive"
      })
    }
  }

  const handleDeleteSection = async () => {
    if (!deleteTarget || deleteTarget.type !== 'section') return

    try {
      const response = await fetch(`/api/admin/sections/${deleteTarget.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Section deleted successfully"
        })
        loadData()
      } else {
        toast({
          title: "Error",
          description: "Failed to delete section",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete section",
        variant: "destructive"
      })
    } finally {
      setDeleteTarget(null)
    }
  }

  const moveCategoryUp = async (category: AdminCategory, index: number) => {
    if (index === 0) return
    
    const newOrder = [...categories]
    ;[newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]]
    
    try {
      await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryIds: newOrder.map(c => c.id) })
      })
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reorder categories",
        variant: "destructive"
      })
    }
  }

  const moveCategoryDown = async (category: AdminCategory, index: number) => {
    if (index === categories.length - 1) return
    
    const newOrder = [...categories]
    ;[newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]]
    
    try {
      await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryIds: newOrder.map(c => c.id) })
      })
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reorder categories",
        variant: "destructive"
      })
    }
  }

  const handleTogglePin = async (section: AdminSection) => {
    try {
      const response = await fetch(`/api/admin/sections/${section.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !section.isPinned })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: section.isPinned ? "Section unpinned" : "Section pinned to top"
        })
        loadData()
      } else {
        throw new Error('Failed to update section')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle pin status",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return <div className="p-6">Loading admin configuration...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Admin Dashboard Configuration</h2>
          <p className="text-muted-foreground">Manage categories and sections for your admin dashboard</p>
        </div>
        <Button onClick={() => openCategoryDialog()}>
          <FolderPlus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Categories List */}
      <div className="space-y-4">
        {categories.map((category, categoryIndex) => (
          <Card key={category.id} className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveCategoryUp(category, categoryIndex)}
                      disabled={categoryIndex === 0}
                      className="h-4 p-0"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveCategoryDown(category, categoryIndex)}
                      disabled={categoryIndex === categories.length - 1}
                      className="h-4 p-0"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {category.name}
                      {!category.isActive && <Badge variant="secondary">Inactive</Badge>}
                    </CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openSectionDialog(category.id)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Section
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openCategoryDialog(category)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget({ type: 'category', id: category.id })}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {category.sections.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sections in this category</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {category.sections.map((section) => (
                    <div
                      key={section.id}
                      className="border rounded-lg p-3 flex items-start justify-between hover:bg-accent"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                          {section.title}
                          {section.isPinned && <Badge variant="default" className="text-xs bg-amber-500"><Pin className="h-2 w-2 mr-1" />Pinned</Badge>}
                          {!section.isActive && <Badge variant="secondary" className="text-xs">Hidden</Badge>}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">{section.description}</p>
                        <p className="text-xs text-blue-600 mt-1">{section.linkHref}</p>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTogglePin(section)}
                          className="h-7 w-7 p-0"
                          title={section.isPinned ? "Unpin" : "Pin to top"}
                        >
                          {section.isPinned ? <PinOff className="h-3 w-3 text-amber-600" /> : <Pin className="h-3 w-3" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openSectionDialog(category.id, section)}
                          className="h-7 w-7 p-0"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget({ type: 'section', id: section.id })}
                          className="h-7 w-7 p-0"
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {categories.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No categories configured yet</p>
              <Button onClick={() => openCategoryDialog()}>
                <FolderPlus className="mr-2 h-4 w-4" />
                Create First Category
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Create Category'}</DialogTitle>
            <DialogDescription>
              {editingCategory ? 'Update category details' : 'Add a new category to organize your admin sections'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cat-name">Name *</Label>
              <Input
                id="cat-name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="e.g., Content Management"
              />
            </div>
            <div>
              <Label htmlFor="cat-desc">Description *</Label>
              <Textarea
                id="cat-desc"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                placeholder="Brief description of this category"
              />
            </div>
            <div>
              <Label htmlFor="cat-icon">Icon</Label>
              <Select
                value={categoryForm.icon}
                onValueChange={(value) => setCategoryForm({ ...categoryForm, icon: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((option) => {
                    const IconComp = option.icon
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <IconComp className="h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="cat-active"
                checked={categoryForm.isActive}
                onCheckedChange={(checked) => setCategoryForm({ ...categoryForm, isActive: checked })}
              />
              <Label htmlFor="cat-active">Active (visible on dashboard)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveCategory}>Save Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Section Dialog */}
      <Dialog open={sectionDialogOpen} onOpenChange={setSectionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingSection ? 'Edit Section' : 'Create Section'}</DialogTitle>
            <DialogDescription>
              {editingSection ? 'Update section details' : 'Add a new section to this category'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sec-title">Title *</Label>
                <Input
                  id="sec-title"
                  value={sectionForm.title}
                  onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                  placeholder="e.g., Blog Posts"
                />
              </div>
              <div>
                <Label htmlFor="sec-icon">Icon</Label>
                <Select
                  value={sectionForm.icon}
                  onValueChange={(value) => setSectionForm({ ...sectionForm, icon: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((option) => {
                      const IconComp = option.icon
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <IconComp className="h-4 w-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="sec-desc">Description *</Label>
              <Textarea
                id="sec-desc"
                value={sectionForm.description}
                onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                placeholder="Brief description of this section"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sec-href">Link Path *</Label>
                <Input
                  id="sec-href"
                  value={sectionForm.linkHref}
                  onChange={(e) => setSectionForm({ ...sectionForm, linkHref: e.target.value })}
                  placeholder="/admin/..."
                />
              </div>
              <div>
                <Label htmlFor="sec-text">Button Text *</Label>
                <Input
                  id="sec-text"
                  value={sectionForm.linkText}
                  onChange={(e) => setSectionForm({ ...sectionForm, linkText: e.target.value })}
                  placeholder="e.g., Manage Posts"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="sec-category">Category *</Label>
              <Select
                value={sectionForm.categoryId}
                onValueChange={(value) => setSectionForm({ ...sectionForm, categoryId: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="sec-active"
                checked={sectionForm.isActive}
                onCheckedChange={(checked) => setSectionForm({ ...sectionForm, isActive: checked })}
              />
              <Label htmlFor="sec-active">Active (visible on dashboard)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSectionDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSection}>Save Section</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this {deleteTarget?.type}.
              {deleteTarget?.type === 'category' && ' All sections in this category must be deleted first.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteTarget?.type === 'category' ? handleDeleteCategory : handleDeleteSection}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
