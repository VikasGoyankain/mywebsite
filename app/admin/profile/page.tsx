"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { useProfileStore } from "@/lib/profile-store"
import { ImageUploader } from "@/components/image-uploader"
import {
  ChevronLeft,
  Save,
  Plus,
  Trash2,
  Edit,
  Loader2,
  X,
} from "lucide-react"

export default function ProfileManagement() {
  const { toast } = useToast()
  
  const {
    profileData,
    updateProfileData,
    updateContact,
    addSocialLink,
    updateSocialLink,
    deleteSocialLink,
    addBadge,
    updateBadge,
    deleteBadge,
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    saveToDatabase,
  } = useProfileStore()

  // Dialog states
  const [isSocialDialogOpen, setIsSocialDialogOpen] = useState(false)
  const [isBadgeDialogOpen, setIsBadgeDialogOpen] = useState(false)
  
  // Editing states
  const [editingSocial, setEditingSocial] = useState<number | null>(null)
  const [editingBadge, setEditingBadge] = useState<number | null>(null)
  
  // Form states for social links and badges
  const [socialForm, setSocialForm] = useState({
    name: "",
    icon: "",
    href: "",
    color: "bg-blue-100 text-blue-800",
  })
  
  const [badgeForm, setBadgeForm] = useState({
    text: "",
    icon: "",
    color: "bg-blue-100 text-blue-800",
  })

  // Handle saving profile changes
  const handleSaveChanges = async () => {
    try {
      await saveToDatabase()
      toast({
        title: "Changes Saved",
        description: "Your profile information has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Social link handlers
  const handleSocialSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingSocial !== null) {
      updateSocialLink(editingSocial, socialForm)
    } else {
      addSocialLink(socialForm)
    }
    
    // Reset form and close dialog
    setSocialForm({
      name: "",
      icon: "",
      href: "",
      color: "bg-blue-100 text-blue-800",
    })
    setEditingSocial(null)
    setIsSocialDialogOpen(false)
  }
  
  // Badge handlers
  const handleBadgeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingBadge !== null) {
      updateBadge(editingBadge, badgeForm)
    } else {
      addBadge(badgeForm)
    }
    
    // Reset form and close dialog
    setBadgeForm({
      text: "",
      icon: "",
      color: "bg-blue-100 text-blue-800",
    })
    setEditingBadge(null)
    setIsBadgeDialogOpen(false)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <Button variant="outline" size="sm" asChild className="mb-2">
            <Link href="/admin" className="flex items-center">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Profile Management</h1>
          <p className="text-muted-foreground mt-1">
            Update your personal information and contact details
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleSaveChanges} 
            disabled={isSaving || !hasUnsavedChanges}
            className="flex items-center gap-2"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </Button>
          {lastSaved && (
            <span className="text-xs text-muted-foreground">
              Last saved: {new Date(lastSaved).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => updateProfileData({ name: e.target.value })}
                placeholder="Your name"
              />
            </div>
            <div>
              <Label htmlFor="title">Title / Position</Label>
              <Input
                id="title"
                value={profileData.title}
                onChange={(e) => updateProfileData({ title: e.target.value })}
                placeholder="e.g. Senior Legal Consultant"
              />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                rows={6}
                value={profileData.bio}
                onChange={(e) => updateProfileData({ bio: e.target.value })}
                placeholder="Write a brief professional bio..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Fields */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profileData.profileImage} alt={profileData.name} />
                  <AvatarFallback>{profileData.name?.substring(0, 2) || "XY"}</AvatarFallback>
                </Avatar>
                <ImageUploader
                  currentImageUrl={profileData.profileImage}
                  onImageSelect={(url) => updateProfileData({ profileImage: url })}
                  buttonText="Change Profile Image"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profileData.contact.email}
                  onChange={(e) => updateContact({ email: e.target.value })}
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={profileData.contact.phone}
                  onChange={(e) => updateContact({ phone: e.target.value })}
                  placeholder="+1234567890"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profileData.contact.location}
                  onChange={(e) => updateContact({ location: e.target.value })}
                  placeholder="City, Country"
                />
              </div>
              <div>
                <Label htmlFor="availability">Availability</Label>
                <Input
                  id="availability"
                  value={profileData.contact.availability}
                  onChange={(e) => updateContact({ availability: e.target.value })}
                  placeholder="e.g. Available for consultations"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Specializations */}
        <Card>
          <CardHeader>
            <CardTitle>Specializations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-3">
                {profileData.specializations.map((specialization, index) => (
                  <Badge key={index} className="px-3 py-1 text-sm">
                    {specialization}
                    <button
                      onClick={() =>
                        updateProfileData({
                          specializations: profileData.specializations.filter((_, i) => i !== index),
                        })
                      }
                      className="ml-2 text-xs opacity-70 hover:opacity-100"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                {profileData.specializations.length === 0 && (
                  <div className="text-muted-foreground italic">No specializations added yet.</div>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  id="new-specialization"
                  placeholder="Add a specialization..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const value = e.currentTarget.value.trim()
                      if (value) {
                        updateProfileData({
                          specializations: [...profileData.specializations, value],
                        })
                        e.currentTarget.value = ""
                      }
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={() => {
                    const input = document.getElementById("new-specialization") as HTMLInputElement
                    const value = input.value.trim()
                    if (value) {
                      updateProfileData({
                        specializations: [...profileData.specializations, value],
                      })
                      input.value = ""
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Social Links</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingSocial(null)
                setSocialForm({
                  name: "",
                  icon: "",
                  href: "",
                  color: "bg-blue-100 text-blue-800",
                })
                setIsSocialDialogOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Link
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {profileData.socialLinks.map((link) => (
                <div key={link.id} className="flex items-center justify-between gap-2 border-b pb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${link.color}`}>
                      <span className="text-sm">{link.icon}</span>
                    </div>
                    <div>
                      <div className="font-medium">{link.name}</div>
                      <a href={link.href} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">
                        {link.href}
                      </a>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingSocial(link.id)
                        setSocialForm({
                          name: link.name,
                          icon: link.icon,
                          href: link.href,
                          color: link.color,
                        })
                        setIsSocialDialogOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => deleteSocialLink(link.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
              {profileData.socialLinks.length === 0 && (
                <div className="text-muted-foreground italic text-center py-4">No social links added yet.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Personal Badges/Interests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Badges & Skills</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingBadge(null)
                setBadgeForm({
                  text: "",
                  icon: "",
                  color: "bg-blue-100 text-blue-800",
                })
                setIsBadgeDialogOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Badge
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profileData.badges.map((badge) => (
                <Badge key={badge.id} className={`px-3 py-1 text-sm relative group ${badge.color}`}>
                  {badge.icon && <span className="mr-1">{badge.icon}</span>}
                  {badge.text}
                  <div className="absolute right-0 top-0 transform translate-x-1/2 -translate-y-1/2 hidden group-hover:flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 w-6 p-0 rounded-full bg-white"
                      onClick={() => {
                        setEditingBadge(badge.id)
                        setBadgeForm({
                          text: badge.text,
                          icon: badge.icon,
                          color: badge.color,
                        })
                        setIsBadgeDialogOpen(true)
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 w-6 p-0 rounded-full bg-white text-red-500"
                      onClick={() => deleteBadge(badge.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </Badge>
              ))}
              {profileData.badges.length === 0 && (
                <div className="text-muted-foreground italic w-full text-center py-4">No badges added yet.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Social Link Dialog */}
      {isSocialDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">
                {editingSocial !== null ? "Edit Social Link" : "Add Social Link"}
              </h3>
              <form onSubmit={handleSocialSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="social-name">Platform Name</Label>
                  <Input
                    id="social-name"
                    value={socialForm.name}
                    onChange={(e) => setSocialForm({ ...socialForm, name: e.target.value })}
                    placeholder="e.g. LinkedIn"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="social-icon">Icon (emoji or symbol)</Label>
                  <Input
                    id="social-icon"
                    value={socialForm.icon}
                    onChange={(e) => setSocialForm({ ...socialForm, icon: e.target.value })}
                    placeholder="e.g. 📱 or 🔗"
                  />
                </div>
                <div>
                  <Label htmlFor="social-url">URL</Label>
                  <Input
                    id="social-url"
                    value={socialForm.href}
                    onChange={(e) => setSocialForm({ ...socialForm, href: e.target.value })}
                    placeholder="https://..."
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsSocialDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingSocial !== null ? "Update" : "Add"} Link
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Badge Dialog */}
      {isBadgeDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">
                {editingBadge !== null ? "Edit Badge" : "Add Badge"}
              </h3>
              <form onSubmit={handleBadgeSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="badge-text">Badge Text</Label>
                  <Input
                    id="badge-text"
                    value={badgeForm.text}
                    onChange={(e) => setBadgeForm({ ...badgeForm, text: e.target.value })}
                    placeholder="e.g. React Expert"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="badge-icon">Icon (emoji or symbol)</Label>
                  <Input
                    id="badge-icon"
                    value={badgeForm.icon}
                    onChange={(e) => setBadgeForm({ ...badgeForm, icon: e.target.value })}
                    placeholder="e.g. 🔥 or ⚡"
                  />
                </div>
                <div>
                  <Label>Color</Label>
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    {[
                      "bg-blue-100 text-blue-800",
                      "bg-green-100 text-green-800",
                      "bg-yellow-100 text-yellow-800",
                      "bg-red-100 text-red-800",
                      "bg-purple-100 text-purple-800",
                      "bg-pink-100 text-pink-800",
                      "bg-indigo-100 text-indigo-800",
                      "bg-gray-100 text-gray-800",
                    ].map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`h-8 rounded-md ${color} ${
                          badgeForm.color === color ? "ring-2 ring-offset-2 ring-primary" : ""
                        }`}
                        onClick={() => setBadgeForm({ ...badgeForm, color })}
                      ></button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsBadgeDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingBadge !== null ? "Update" : "Add"} Badge
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 