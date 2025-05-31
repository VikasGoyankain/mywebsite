"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import {
  Save,
  Plus,
  Trash2,
  Edit,
  Settings,
  User,
  Briefcase,
  GraduationCap,
  Star,
  ImageIcon,
  LinkIcon,
  Upload,
  Camera,
  Download,
  RotateCcw,
} from "lucide-react"
import { useProfileStore } from "@/lib/profile-store"
import { useDatabaseInit } from "@/hooks/use-database-init"

export default function AdminDashboard() {
  useDatabaseInit() // Initialize database connection

  const { toast } = useToast()
  const {
    profileData,
    experience,
    education,
    skills,
    posts,
    navigationPages,
    updateProfileData,
    updateContact,
    addSocialLink,
    updateSocialLink,
    deleteSocialLink,
    addBadge,
    updateBadge,
    deleteBadge,
    addExperience,
    updateExperience,
    deleteExperience,
    addEducation,
    updateEducation,
    deleteEducation,
    addSkill,
    updateSkill,
    deleteSkill,
    addPost,
    updatePost,
    deletePost,
    addNavigationPage,
    updateNavigationPage,
    deleteNavigationPage,
    resetToDefaults,
    exportData,
    importData,
    isLoading,
    isSaving,
    lastSaved,
    syncStatus,
    hasUnsavedChanges,
    saveToDatabase,
    createBackup,
  } = useProfileStore()

  // Dialog states
  const [isExperienceDialogOpen, setIsExperienceDialogOpen] = useState(false)
  const [isEducationDialogOpen, setIsEducationDialogOpen] = useState(false)
  const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false)
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false)
  const [isNavigationDialogOpen, setIsNavigationDialogOpen] = useState(false)
  const [isSocialDialogOpen, setIsSocialDialogOpen] = useState(false)
  const [isBadgeDialogOpen, setIsBadgeDialogOpen] = useState(false)

  // Editing states
  const [editingExperience, setEditingExperience] = useState<number | null>(null)
  const [editingEducation, setEditingEducation] = useState<number | null>(null)
  const [editingSkill, setEditingSkill] = useState<number | null>(null)
  const [editingPost, setEditingPost] = useState<number | null>(null)
  const [editingNavigation, setEditingNavigation] = useState<number | null>(null)
  const [editingSocial, setEditingSocial] = useState<number | null>(null)
  const [editingBadge, setEditingBadge] = useState<number | null>(null)

  // Content filter state
  const [contentFilter, setContentFilter] = useState("all")

  const handleSaveChanges = async () => {
    const result = await saveToDatabase()
    if (result.success) {
      toast({
        title: "Changes Saved",
        description: "All your changes have been saved to the database successfully!",
      })
    } else {
      toast({
        title: "Save Failed",
        description: "Failed to save changes to database. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleExport = () => {
    const data = exportData()
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `profile-data-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast({
      title: "Data Exported",
      description: "Your profile data has been exported successfully!",
    })
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = e.target?.result as string
          importData(data)
          toast({
            title: "Data Imported",
            description: "Your profile data has been imported successfully!",
          })
        } catch (error) {
          toast({
            title: "Import Failed",
            description: "Failed to import data. Please check the file format.",
            variant: "destructive",
          })
        }
      }
      reader.readAsText(file)
    }
  }

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all data to defaults? This cannot be undone.")) {
      resetToDefaults()
      toast({
        title: "Data Reset",
        description: "All data has been reset to default values.",
      })
    }
  }

  const handleCreateBackup = async () => {
    const backupName = prompt("Enter backup name:")
    if (backupName) {
      const result = await createBackup(backupName)
      if (result.success) {
        toast({
          title: "Backup Created",
          description: `Backup "${backupName}" created successfully!`,
        })
      } else {
        toast({
          title: "Backup Failed",
          description: "Failed to create backup.",
          variant: "destructive",
        })
      }
    }
  }

  // Filter posts by section
  const getFilteredPosts = () => {
    if (contentFilter === "all") return posts
    return posts.filter((post) => post.section === contentFilter)
  }

  // Get post counts by section
  const getPostCounts = () => {
    return {
      all: posts.length,
      "recent-work": posts.filter((p) => p.section === "recent-work").length,
      articles: posts.filter((p) => p.section === "articles").length,
      achievements: posts.filter((p) => p.section === "achievements").length,
    }
  }

  const postCounts = getPostCounts()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Profile Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Manage your profile content</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Status Indicator */}
              <div className="flex items-center gap-2 text-sm">
                <div
                  className={`w-2 h-2 rounded-full ${
                    syncStatus === "success"
                      ? "bg-green-500"
                      : syncStatus === "syncing"
                        ? "bg-yellow-500 animate-pulse"
                        : syncStatus === "error"
                          ? "bg-red-500"
                          : "bg-gray-400"
                  }`}
                ></div>
                <span className="text-gray-600">
                  {hasUnsavedChanges
                    ? "Unsaved changes"
                    : lastSaved
                      ? `Saved ${new Date(lastSaved).toLocaleTimeString()}`
                      : "No changes"}
                </span>
              </div>

              {/* Main Save Button */}
              <Button
                onClick={handleSaveChanges}
                className={`gap-2 ${hasUnsavedChanges ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}`}
                disabled={isSaving}
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Saving..." : hasUnsavedChanges ? "Save Changes" : "All Saved"}
              </Button>

              {/* Export Button */}
              <Button onClick={handleExport} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>

              {/* Import Button */}
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Import
                </Button>
              </div>

              {/* Backup Button */}
              <Button onClick={handleCreateBackup} variant="outline" className="gap-2">
                <Save className="w-4 h-4" />
                Backup
              </Button>

              {/* Reset Button */}
              <Button onClick={handleReset} variant="outline" className="gap-2 text-red-600 hover:text-red-700">
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="profile" className="gap-2">
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="experience" className="gap-2">
                <Briefcase className="w-4 h-4" />
                Experience
              </TabsTrigger>
              <TabsTrigger value="education" className="gap-2">
                <GraduationCap className="w-4 h-4" />
                Education
              </TabsTrigger>
              <TabsTrigger value="skills" className="gap-2">
                <Star className="w-4 h-4" />
                Skills
              </TabsTrigger>
              <TabsTrigger value="content" className="gap-2">
                <ImageIcon className="w-4 h-4" />
                Content
              </TabsTrigger>
              <TabsTrigger value="navigation" className="gap-2">
                <LinkIcon className="w-4 h-4" />
                Navigation
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              {/* Profile Image Section */}
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">Profile Image</h2>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-32 h-32 ring-4 ring-blue-500 ring-offset-4">
                      <AvatarImage src={profileData.profileImage || "/placeholder.svg"} alt={profileData.name} />
                      <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                        {profileData.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 bg-blue-600 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <Label htmlFor="profileImage">Profile Image URL</Label>
                      <Input
                        id="profileImage"
                        value={profileData.profileImage}
                        onChange={(e) => updateProfileData({ profileImage: e.target.value })}
                        placeholder="https://example.com/image.jpg or /placeholder.svg?height=192&width=192"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Use a publicly accessible image URL (e.g., from Unsplash, your website, or cloud storage).
                        Recommended size: 400x400px
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateProfileData({ profileImage: "/placeholder.svg?height=192&width=192" })}
                      >
                        Use Default
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateProfileData({
                            profileImage:
                              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
                          })
                        }
                      >
                        Sample Image
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Basic Information */}
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => updateProfileData({ name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="title">Professional Title</Label>
                      <Input
                        id="title"
                        value={profileData.title}
                        onChange={(e) => updateProfileData({ title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        rows={4}
                        value={profileData.bio}
                        onChange={(e) => updateProfileData({ bio: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.contact.email}
                        onChange={(e) => updateContact({ email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={profileData.contact.phone}
                        onChange={(e) => updateContact({ phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={profileData.contact.location}
                        onChange={(e) => updateContact({ location: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="availability">Availability Status</Label>
                      <Input
                        id="availability"
                        value={profileData.contact.availability}
                        onChange={(e) => updateContact({ availability: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Social Links */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Social Media Links</h2>
                  <Dialog open={isSocialDialogOpen} onOpenChange={setIsSocialDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Social Link
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingSocial !== null ? "Edit Social Link" : "Add New Social Link"}</DialogTitle>
                      </DialogHeader>
                      <SocialLinkForm
                        socialLink={
                          editingSocial !== null ? profileData.socialLinks.find((s) => s.id === editingSocial) : null
                        }
                        onSave={(link) => {
                          if (editingSocial !== null) {
                            updateSocialLink(editingSocial, link)
                          } else {
                            addSocialLink(link)
                          }
                          setIsSocialDialogOpen(false)
                          setEditingSocial(null)
                        }}
                        onCancel={() => {
                          setIsSocialDialogOpen(false)
                          setEditingSocial(null)
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="space-y-4">
                  {profileData.socialLinks.map((link) => (
                    <Card key={link.id} className="p-4 border-l-4 border-blue-500">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full bg-gray-100 ${link.color}`}>
                            <div className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{link.name}</h3>
                            <p className="text-sm text-gray-600 truncate max-w-xs">{link.href}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingSocial(link.id)
                              setIsSocialDialogOpen(true)
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => deleteSocialLink(link.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>

              {/* Profile Badges */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Profile Badges</h2>
                  <Dialog open={isBadgeDialogOpen} onOpenChange={setIsBadgeDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Badge
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingBadge !== null ? "Edit Badge" : "Add New Badge"}</DialogTitle>
                      </DialogHeader>
                      <BadgeForm
                        badge={editingBadge !== null ? profileData.badges.find((b) => b.id === editingBadge) : null}
                        onSave={(badge) => {
                          if (editingBadge !== null) {
                            updateBadge(editingBadge, badge)
                          } else {
                            addBadge(badge)
                          }
                          setIsBadgeDialogOpen(false)
                          setEditingBadge(null)
                        }}
                        onCancel={() => {
                          setIsBadgeDialogOpen(false)
                          setEditingBadge(null)
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profileData.badges.map((badge) => (
                    <Card key={badge.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className={badge.color}>{badge.text}</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingBadge(badge.id)
                              setIsBadgeDialogOpen(true)
                            }}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => deleteBadge(badge.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Experience Tab */}
            <TabsContent value="experience" className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Professional Experience</h2>
                  <Dialog open={isExperienceDialogOpen} onOpenChange={setIsExperienceDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Experience
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          {editingExperience !== null ? "Edit Experience" : "Add New Experience"}
                        </DialogTitle>
                      </DialogHeader>
                      <ExperienceForm
                        experience={
                          editingExperience !== null ? experience.find((e) => e.id === editingExperience) : null
                        }
                        onSave={(exp) => {
                          if (editingExperience !== null) {
                            updateExperience(editingExperience, exp)
                          } else {
                            addExperience(exp)
                          }
                          setIsExperienceDialogOpen(false)
                          setEditingExperience(null)
                        }}
                        onCancel={() => {
                          setIsExperienceDialogOpen(false)
                          setEditingExperience(null)
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="space-y-4">
                  {experience.map((exp) => (
                    <Card key={exp.id} className="p-4 border-l-4 border-blue-500">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4 flex-1">
                          <Avatar className="w-12 h-12 ring-2 ring-white shadow-md">
                            <AvatarImage src={exp.image || "/placeholder.svg"} />
                            <AvatarFallback className="bg-blue-600 text-white font-bold text-sm">
                              {exp.company
                                .split(" ")
                                .map((word) => word[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg">{exp.title}</h3>
                            <p className="text-blue-600 font-semibold">{exp.company}</p>
                            <p className="text-sm text-gray-600">
                              {exp.duration} • {exp.location}
                            </p>
                            <p className="text-gray-700 mt-2">{exp.description}</p>
                            <Badge variant="outline" className="mt-2">
                              {exp.type}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingExperience(exp.id)
                              setIsExperienceDialogOpen(true)
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => deleteExperience(exp.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Education Tab */}
            <TabsContent value="education" className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Education</h2>
                  <Dialog open={isEducationDialogOpen} onOpenChange={setIsEducationDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Education
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{editingEducation !== null ? "Edit Education" : "Add New Education"}</DialogTitle>
                      </DialogHeader>
                      <EducationForm
                        education={editingEducation !== null ? education.find((e) => e.id === editingEducation) : null}
                        onSave={(edu) => {
                          if (editingEducation !== null) {
                            updateEducation(editingEducation, edu)
                          } else {
                            addEducation(edu)
                          }
                          setIsEducationDialogOpen(false)
                          setEditingEducation(null)
                        }}
                        onCancel={() => {
                          setIsEducationDialogOpen(false)
                          setEditingEducation(null)
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="space-y-4">
                  {education.map((edu) => (
                    <Card key={edu.id} className="p-4 border-l-4 border-purple-500">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{edu.degree}</h3>
                          <p className="text-purple-600 font-semibold">{edu.institution}</p>
                          <p className="text-sm text-gray-600">
                            {edu.year} • {edu.grade}
                          </p>
                          <p className="text-gray-700 mt-2">{edu.specialization}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {edu.achievements.map((achievement, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {achievement}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingEducation(edu.id)
                              setIsEducationDialogOpen(true)
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => deleteEducation(edu.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Skills Tab */}
            <TabsContent value="skills" className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Skills</h2>
                  <Dialog open={isSkillDialogOpen} onOpenChange={setIsSkillDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Skill
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingSkill !== null ? "Edit Skill" : "Add New Skill"}</DialogTitle>
                      </DialogHeader>
                      <SkillForm
                        skill={editingSkill !== null ? skills.find((s) => s.id === editingSkill) : null}
                        onSave={(skill) => {
                          if (editingSkill !== null) {
                            updateSkill(editingSkill, skill)
                          } else {
                            addSkill(skill)
                          }
                          setIsSkillDialogOpen(false)
                          setEditingSkill(null)
                        }}
                        onCancel={() => {
                          setIsSkillDialogOpen(false)
                          setEditingSkill(null)
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skills.map((skill) => (
                    <Card key={skill.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{skill.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {skill.category}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingSkill(skill.id)
                              setIsSkillDialogOpen(true)
                            }}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => deleteSkill(skill.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                          style={{ width: `${skill.level}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{skill.level}%</span>
                    </Card>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Content Management</h2>
                  <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Content
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{editingPost !== null ? "Edit Content" : "Add New Content"}</DialogTitle>
                      </DialogHeader>
                      <PostForm
                        post={editingPost !== null ? posts.find((p) => p.id === editingPost) : null}
                        onSave={(post) => {
                          if (editingPost !== null) {
                            updatePost(editingPost, post)
                          } else {
                            addPost(post)
                          }
                          setIsPostDialogOpen(false)
                          setEditingPost(null)
                        }}
                        onCancel={() => {
                          setIsPostDialogOpen(false)
                          setEditingPost(null)
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Content Filter Tabs */}
                <div className="flex items-center gap-4 mb-6 border-b border-gray-200">
                  <button
                    onClick={() => setContentFilter("all")}
                    className={`pb-2 px-1 border-b-2 transition-colors ${
                      contentFilter === "all"
                        ? "border-blue-500 text-blue-600 font-semibold"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    All Content ({postCounts.all})
                  </button>
                  <button
                    onClick={() => setContentFilter("recent-work")}
                    className={`pb-2 px-1 border-b-2 transition-colors ${
                      contentFilter === "recent-work"
                        ? "border-blue-500 text-blue-600 font-semibold"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Recent Work ({postCounts["recent-work"]})
                  </button>
                  <button
                    onClick={() => setContentFilter("articles")}
                    className={`pb-2 px-1 border-b-2 transition-colors ${
                      contentFilter === "articles"
                        ? "border-blue-500 text-blue-600 font-semibold"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Articles ({postCounts.articles})
                  </button>
                  <button
                    onClick={() => setContentFilter("achievements")}
                    className={`pb-2 px-1 border-b-2 transition-colors ${
                      contentFilter === "achievements"
                        ? "border-blue-500 text-blue-600 font-semibold"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Achievements ({postCounts.achievements})
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getFilteredPosts().map((post) => (
                    <Card key={post.id} className="overflow-hidden">
                      <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
                        <ImageIcon className="w-12 h-12 text-gray-400" />
                        <div className="absolute top-3 left-3">
                          <Badge
                            className={`${
                              post.section === "recent-work"
                                ? "bg-blue-100 text-blue-800"
                                : post.section === "articles"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {post.section === "recent-work"
                              ? "Recent Work"
                              : post.section === "articles"
                                ? "Article"
                                : "Achievement"}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold">{post.title}</h3>
                            <p className="text-sm text-gray-600">{post.date}</p>
                            <Badge variant="secondary" className="text-xs mt-1">
                              {post.category}
                            </Badge>
                            {post.description && (
                              <p className="text-xs text-gray-500 mt-2 line-clamp-2">{post.description}</p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingPost(post.id)
                                setIsPostDialogOpen(true)
                              }}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => deletePost(post.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Navigation Tab */}
            <TabsContent value="navigation" className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Navigation Pages</h2>
                  <Dialog open={isNavigationDialogOpen} onOpenChange={setIsNavigationDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Page
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingNavigation !== null ? "Edit Navigation Page" : "Add New Navigation Page"}
                        </DialogTitle>
                      </DialogHeader>
                      <NavigationForm
                        navigation={
                          editingNavigation !== null ? navigationPages.find((p) => p.id === editingNavigation) : null
                        }
                        onSave={(nav) => {
                          if (editingNavigation !== null) {
                            updateNavigationPage(editingNavigation, nav)
                          } else {
                            addNavigationPage(nav)
                          }
                          setIsNavigationDialogOpen(false)
                          setEditingNavigation(null)
                        }}
                        onCancel={() => {
                          setIsNavigationDialogOpen(false)
                          setEditingNavigation(null)
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {navigationPages.map((page) => (
                    <Card key={page.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold">{page.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{page.description}</p>
                          <div className="flex items-center gap-2">
                            <Badge className={page.color + " text-white"}>{page.icon}</Badge>
                            <span className="text-xs text-gray-500">{page.href}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingNavigation(page.id)
                              setIsNavigationDialogOpen(true)
                            }}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => deleteNavigationPage(page.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

// Form Components
function ExperienceForm({ experience, onSave, onCancel }: any) {
  const [formData, setFormData] = useState(
    experience || {
      title: "",
      company: "",
      duration: "",
      location: "",
      description: "",
      type: "Internship",
      image: "/placeholder.svg?height=48&width=48",
    },
  )

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Job Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="duration">Duration</Label>
          <Input
            id="duration"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            placeholder="Jan 2024 - Present"
          />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="type">Type</Label>
        <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Internship">Internship</SelectItem>
            <SelectItem value="Full-time">Full-time</SelectItem>
            <SelectItem value="Part-time">Part-time</SelectItem>
            <SelectItem value="Leadership">Leadership</SelectItem>
            <SelectItem value="Volunteer">Volunteer</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="image">Company/Organization Logo URL</Label>
        <Input
          id="image"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          placeholder="https://example.com/logo.png or /placeholder.svg?height=48&width=48"
        />
        <p className="text-xs text-gray-500 mt-1">Use a publicly accessible image URL for the company logo</p>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(formData)}>Save</Button>
      </DialogFooter>
    </div>
  )
}

function EducationForm({ education, onSave, onCancel }: any) {
  const [formData, setFormData] = useState(
    education || {
      degree: "",
      institution: "",
      year: "",
      grade: "",
      specialization: "",
      achievements: [],
    },
  )

  const [achievementInput, setAchievementInput] = useState("")

  const addAchievement = () => {
    if (achievementInput.trim()) {
      setFormData({
        ...formData,
        achievements: [...formData.achievements, achievementInput.trim()],
      })
      setAchievementInput("")
    }
  }

  const removeAchievement = (index: number) => {
    setFormData({
      ...formData,
      achievements: formData.achievements.filter((_: any, i: number) => i !== index),
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="degree">Degree</Label>
        <Input
          id="degree"
          value={formData.degree}
          onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="institution">Institution</Label>
        <Input
          id="institution"
          value={formData.institution}
          onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            placeholder="2021 - 2024"
          />
        </div>
        <div>
          <Label htmlFor="grade">Grade</Label>
          <Input
            id="grade"
            value={formData.grade}
            onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
            placeholder="CGPA: 8.7/10"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="specialization">Specialization</Label>
        <Input
          id="specialization"
          value={formData.specialization}
          onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
        />
      </div>
      <div>
        <Label>Achievements</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={achievementInput}
            onChange={(e) => setAchievementInput(e.target.value)}
            placeholder="Add achievement"
            onKeyPress={(e) => e.key === "Enter" && addAchievement()}
          />
          <Button type="button" onClick={addAchievement}>
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.achievements.map((achievement: string, index: number) => (
            <Badge key={index} variant="secondary" className="gap-1">
              {achievement}
              <button onClick={() => removeAchievement(index)}>×</button>
            </Badge>
          ))}
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(formData)}>Save</Button>
      </DialogFooter>
    </div>
  )
}

function SkillForm({ skill, onSave, onCancel }: any) {
  const [formData, setFormData] = useState(
    skill || {
      name: "",
      level: 50,
      category: "Legal",
    },
  )

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="skillName">Skill Name</Label>
        <Input
          id="skillName"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Legal">Legal</SelectItem>
            <SelectItem value="Policy">Policy</SelectItem>
            <SelectItem value="Research">Research</SelectItem>
            <SelectItem value="Communication">Communication</SelectItem>
            <SelectItem value="Political">Political</SelectItem>
            <SelectItem value="Social">Social</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="level">Skill Level: {formData.level}%</Label>
        <input
          type="range"
          id="level"
          min="0"
          max="100"
          value={formData.level}
          onChange={(e) => setFormData({ ...formData, level: Number.parseInt(e.target.value) })}
          className="w-full"
        />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(formData)}>Save</Button>
      </DialogFooter>
    </div>
  )
}

function PostForm({ post, onSave, onCancel }: any) {
  const [formData, setFormData] = useState(
    post || {
      title: "",
      date: "",
      category: "Social Work",
      section: "recent-work",
      image: "/placeholder.svg?height=400&width=400",
      description: "",
    },
  )

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="postTitle">Title</Label>
        <Input
          id="postTitle"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            placeholder="2 days ago"
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Social Work">Social Work</SelectItem>
              <SelectItem value="Politics">Politics</SelectItem>
              <SelectItem value="Education">Education</SelectItem>
              <SelectItem value="Research">Research</SelectItem>
              <SelectItem value="Legal">Legal</SelectItem>
              <SelectItem value="Legal Research">Legal Research</SelectItem>
              <SelectItem value="Policy Research">Policy Research</SelectItem>
              <SelectItem value="Academic">Academic</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="section">Display Section</Label>
        <Select value={formData.section} onValueChange={(value) => setFormData({ ...formData, section: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent-work">Recent Work</SelectItem>
            <SelectItem value="articles">Articles</SelectItem>
            <SelectItem value="achievements">Achievements</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 mt-1">Choose which section this content will appear in on your profile</p>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={2}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of this content..."
        />
      </div>
      <div>
        <Label htmlFor="image">Image URL</Label>
        <Input
          id="image"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          placeholder="https://example.com/image.jpg or /placeholder.svg?height=400&width=400"
        />
        <p className="text-xs text-gray-500 mt-1">Use a publicly accessible image URL</p>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(formData)}>Save</Button>
      </DialogFooter>
    </div>
  )
}

function NavigationForm({ navigation, onSave, onCancel }: any) {
  const [formData, setFormData] = useState(
    navigation || {
      title: "",
      description: "",
      icon: "FileText",
      href: "",
      color: "bg-blue-500",
    },
  )

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="navTitle">Title</Label>
        <Input
          id="navTitle"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="href">Link URL</Label>
        <Input
          id="href"
          value={formData.href}
          onChange={(e) => setFormData({ ...formData, href: e.target.value })}
          placeholder="/page-url"
        />
      </div>
      <div>
        <Label htmlFor="icon">Icon</Label>
        <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FileText">FileText</SelectItem>
            <SelectItem value="MessageSquare">MessageSquare</SelectItem>
            <SelectItem value="Users">Users</SelectItem>
            <SelectItem value="Gavel">Gavel</SelectItem>
            <SelectItem value="BookOpen">BookOpen</SelectItem>
            <SelectItem value="Award">Award</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="color">Color</Label>
        <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bg-blue-500">Blue</SelectItem>
            <SelectItem value="bg-green-500">Green</SelectItem>
            <SelectItem value="bg-orange-500">Orange</SelectItem>
            <SelectItem value="bg-red-500">Red</SelectItem>
            <SelectItem value="bg-purple-500">Purple</SelectItem>
            <SelectItem value="bg-yellow-500">Yellow</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(formData)}>Save</Button>
      </DialogFooter>
    </div>
  )
}

function SocialLinkForm({ socialLink, onSave, onCancel }: any) {
  const [formData, setFormData] = useState(
    socialLink || {
      name: "",
      icon: "Globe",
      href: "",
      color: "text-blue-600",
    },
  )

  const iconOptions = [
    "Instagram",
    "Linkedin",
    "Twitter",
    "Facebook",
    "Youtube",
    "Github",
    "Send",
    "Globe",
    "Mail",
    "Phone",
    "MessageSquare",
  ]

  const colorOptions = [
    { label: "Blue", value: "text-blue-600" },
    { label: "Pink", value: "text-pink-600" },
    { label: "Purple", value: "text-purple-600" },
    { label: "Green", value: "text-green-600" },
    { label: "Red", value: "text-red-600" },
    { label: "Yellow", value: "text-yellow-600" },
    { label: "Gray", value: "text-gray-600" },
  ]

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="socialName">Platform Name</Label>
        <Input
          id="socialName"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Instagram, LinkedIn"
        />
      </div>
      <div>
        <Label htmlFor="socialIcon">Icon</Label>
        <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {iconOptions.map((icon) => (
              <SelectItem key={icon} value={icon}>
                {icon}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="socialColor">Color</Label>
        <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {colorOptions.map((color) => (
              <SelectItem key={color.value} value={color.value}>
                {color.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="socialHref">URL</Label>
        <Input
          id="socialHref"
          value={formData.href}
          onChange={(e) => setFormData({ ...formData, href: e.target.value })}
          placeholder="https://..."
        />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(formData)}>Save</Button>
      </DialogFooter>
    </div>
  )
}

function BadgeForm({ badge, onSave, onCancel }: any) {
  const [formData, setFormData] = useState(
    badge || {
      text: "",
      icon: "Star",
      color: "bg-blue-100 text-blue-800",
    },
  )

  const iconOptions = [
    "GraduationCap",
    "Gavel",
    "Users",
    "Heart",
    "Star",
    "Award",
    "Briefcase",
    "BookOpen",
    "Shield",
    "Target",
    "Zap",
    "Crown",
  ]

  const colorOptions = [
    { label: "Blue", value: "bg-blue-100 text-blue-800" },
    { label: "Purple", value: "bg-purple-100 text-purple-800" },
    { label: "Green", value: "bg-green-100 text-green-800" },
    { label: "Orange", value: "bg-orange-100 text-orange-800" },
    { label: "Red", value: "bg-red-100 text-red-800" },
    { label: "Yellow", value: "bg-yellow-100 text-yellow-800" },
    { label: "Pink", value: "bg-pink-100 text-pink-800" },
    { label: "Indigo", value: "bg-indigo-100 text-indigo-800" },
  ]

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="badgeText">Badge Text</Label>
        <Input
          id="badgeText"
          value={formData.text}
          onChange={(e) => setFormData({ ...formData, text: e.target.value })}
          placeholder="e.g., Law Student"
        />
      </div>
      <div>
        <Label htmlFor="badgeIcon">Icon</Label>
        <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {iconOptions.map((icon) => (
              <SelectItem key={icon} value={icon}>
                {icon}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="badgeColor">Color Theme</Label>
        <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {colorOptions.map((color) => (
              <SelectItem key={color.value} value={color.value}>
                {color.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(formData)}>Save</Button>
      </DialogFooter>
    </div>
  )
}
