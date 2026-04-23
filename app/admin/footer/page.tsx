"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { useProfileStore } from "@/lib/profile-store"
import { useToast } from "@/hooks/use-toast"
import { useDatabaseInit } from "@/hooks/use-database-init"
import { ArrowLeft, Plus, Trash2, Save, Edit2, X } from "lucide-react"
import Link from "next/link"
import { FooterConfig, FooterLink, FooterSection } from "@/lib/redis"

export default function AdminFooter() {
  useDatabaseInit()
  const { footerConfig, updateFooterConfig, saveFooterConfig: storeFooterConfig } = useProfileStore()
  const { profileData } = useProfileStore()
  const { toast } = useToast()
  
  const [isSaving, setIsSaving] = useState(false)
  const [showSectionDialog, setShowSectionDialog] = useState(false)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [editingLinkIndex, setEditingLinkIndex] = useState<number | null>(null)
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null)
  const [sectionForm, setSectionForm] = useState({ title: "" })
  const [linkForm, setLinkForm] = useState({ label: "", href: "" })

  if (!footerConfig) {
    return <div className="p-6">Loading footer configuration...</div>
  }

  const sections: FooterSection[] = Array.isArray(footerConfig.sections) ? footerConfig.sections : []

  const handleToggle = (field: "useProfileName" | "useProfileImage" | "useProfileBio" | "useProfileSocialLinks", value: boolean) => {
    updateFooterConfig({ [field]: value })
  }

  const handleCustomChange = (field: string, value: string) => {
    updateFooterConfig({ [field]: value })
  }

  // Section Management
  const handleAddSection = () => {
    if (!sectionForm.title.trim()) {
      toast({ title: "Error", description: "Section title is required", variant: "destructive" })
      return
    }

    const newSection: FooterSection = {
      id: `section_${Date.now()}`,
      title: sectionForm.title,
      links: []
    }

    updateFooterConfig({
      sections: [...sections, newSection]
    })
    setSectionForm({ title: "" })
    setEditingSectionId(null)
    setShowSectionDialog(false)
    toast({ title: "Success", description: "Section added successfully" })
  }

  const handleEditSection = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId)
    if (section) {
      setSectionForm({ title: section.title })
      setEditingSectionId(sectionId)
      setShowSectionDialog(true)
    }
  }

  const handleUpdateSection = () => {
    if (!sectionForm.title.trim()) {
      toast({ title: "Error", description: "Section title is required", variant: "destructive" })
      return
    }

    updateFooterConfig({
      sections: sections.map(s =>
        s.id === editingSectionId ? { ...s, title: sectionForm.title } : s
      )
    })
    setSectionForm({ title: "" })
    setEditingSectionId(null)
    setShowSectionDialog(false)
    toast({ title: "Success", description: "Section updated successfully" })
  }

  const handleDeleteSection = (sectionId: string) => {
    updateFooterConfig({
      sections: sections.filter(s => s.id !== sectionId)
    })
    toast({ title: "Success", description: "Section deleted successfully" })
  }

  // Link Management
  const handleAddLink = (sectionId: string) => {
    if (!linkForm.label.trim() || !linkForm.href.trim()) {
      toast({ title: "Error", description: "Both label and URL are required", variant: "destructive" })
      return
    }

    updateFooterConfig({
      sections: sections.map(s =>
        s.id === sectionId
          ? {
              ...s,
              links: editingLinkIndex !== null
                ? s.links.map((link, i) =>
                    i === editingLinkIndex ? { label: linkForm.label, href: linkForm.href } : link
                  )
                : [...s.links, { label: linkForm.label, href: linkForm.href }]
            }
          : s
      )
    })
    setLinkForm({ label: "", href: "" })
    setEditingLinkIndex(null)
    setShowLinkDialog(false)
    toast({ title: "Success", description: editingLinkIndex !== null ? "Link updated" : "Link added" })
  }

  const handleEditLink = (sectionId: string, index: number) => {
    const section = sections.find(s => s.id === sectionId)
    if (section && section.links[index]) {
      setLinkForm({ label: section.links[index].label, href: section.links[index].href })
      setEditingLinkIndex(index)
      setCurrentSectionId(sectionId)
      setShowLinkDialog(true)
    }
  }

  const handleDeleteLink = (sectionId: string, index: number) => {
    updateFooterConfig({
      sections: sections.map(s =>
        s.id === sectionId
          ? { ...s, links: s.links.filter((_, i) => i !== index) }
          : s
      )
    })
    toast({ title: "Success", description: "Link deleted" })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await storeFooterConfig()
      toast({ title: "Success", description: "Footer configuration saved successfully" })
    } catch (error) {
      console.error("Error saving footer config:", error)
      toast({
        title: "Error",
        description: "Failed to save footer configuration",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const resetSectionDialog = () => {
    setSectionForm({ title: "" })
    setEditingSectionId(null)
  }

  const resetLinkDialog = () => {
    setLinkForm({ label: "", href: "" })
    setEditingLinkIndex(null)
    setCurrentSectionId(null)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Footer Configuration</h1>
            <p className="text-gray-500">Manage footer content and settings</p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Name */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="use-name">Use Profile Name</Label>
                  <Switch
                    id="use-name"
                    checked={footerConfig.useProfileName}
                    onCheckedChange={(value) => handleToggle("useProfileName", value)}
                  />
                </div>
                {!footerConfig.useProfileName && (
                  <div className="space-y-2">
                    <Label htmlFor="custom-name">Custom Name</Label>
                    <Input
                      id="custom-name"
                      value={footerConfig.customName}
                      onChange={(e) => handleCustomChange("customName", e.target.value)}
                      placeholder="Enter custom name"
                    />
                  </div>
                )}
                {footerConfig.useProfileName && (
                  <div className="p-3 bg-blue-50 rounded border border-blue-200 text-sm">
                    Currently showing: <strong>{profileData.name || "N/A"}</strong>
                  </div>
                )}
              </div>

              {/* Profile Image */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="use-image">Use Profile Image</Label>
                  <Switch
                    id="use-image"
                    checked={footerConfig.useProfileImage}
                    onCheckedChange={(value) => handleToggle("useProfileImage", value)}
                  />
                </div>
                {!footerConfig.useProfileImage && (
                  <div className="space-y-2">
                    <Label htmlFor="custom-image">Custom Image URL</Label>
                    <Input
                      id="custom-image"
                      value={footerConfig.customImage}
                      onChange={(e) => handleCustomChange("customImage", e.target.value)}
                      placeholder="Enter image URL"
                    />
                  </div>
                )}
                {footerConfig.useProfileImage && (
                  <div className="p-3 bg-blue-50 rounded border border-blue-200 text-sm">
                    Currently showing profile image
                  </div>
                )}
              </div>

              {/* Profile Bio */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="use-bio">Use Profile Bio</Label>
                  <Switch
                    id="use-bio"
                    checked={footerConfig.useProfileBio}
                    onCheckedChange={(value) => handleToggle("useProfileBio", value)}
                  />
                </div>
                {!footerConfig.useProfileBio && (
                  <div className="space-y-2">
                    <Label htmlFor="custom-bio">Custom Bio</Label>
                    <Textarea
                      id="custom-bio"
                      value={footerConfig.customBio}
                      onChange={(e) => handleCustomChange("customBio", e.target.value)}
                      placeholder="Enter custom bio"
                      rows={4}
                    />
                  </div>
                )}
                {footerConfig.useProfileBio && (
                  <div className="p-3 bg-blue-50 rounded border border-blue-200 text-sm">
                    Currently showing profile bio
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Social Links Toggle */}
          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded border border-blue-200">
                <div>
                  <Label htmlFor="use-social" className="text-base font-medium">Show Social Links from Profile</Label>
                  <p className="text-sm text-gray-600 mt-1">Display social media links that are configured in your profile</p>
                </div>
                <Switch
                  id="use-social"
                  checked={footerConfig.useProfileSocialLinks}
                  onCheckedChange={(value) => handleToggle("useProfileSocialLinks", value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Footer Sections */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Footer Sections</h2>
              <Dialog open={showSectionDialog} onOpenChange={setShowSectionDialog}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => resetSectionDialog()}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Section
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingSectionId ? "Edit Section" : "Add New Section"}</DialogTitle>
                    <DialogDescription>
                      {editingSectionId ? "Rename your footer section" : "Create a new footer section"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="section-title">Section Title</Label>
                      <Input
                        id="section-title"
                        value={sectionForm.title}
                        onChange={(e) => setSectionForm({ title: e.target.value })}
                        placeholder="e.g., Resources, Support, Company"
                      />
                    </div>
                    <Button
                      onClick={editingSectionId ? handleUpdateSection : handleAddSection}
                      className="w-full"
                    >
                      {editingSectionId ? "Update Section" : "Add Section"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {sections.length === 0 ? (
              <Card className="p-6 text-center text-gray-500">
                No sections yet. Add one to get started!
              </Card>
            ) : (
              sections.map((section) => (
                <Card key={section.id}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{section.title}</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditSection(section.id)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSection(section.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Dialog
                        open={showLinkDialog && currentSectionId === section.id}
                        onOpenChange={(open) => {
                          if (!open) resetLinkDialog()
                          setShowLinkDialog(open)
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              resetLinkDialog()
                              setCurrentSectionId(section.id)
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Link
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              {editingLinkIndex !== null ? "Edit Link" : "Add Link"}
                            </DialogTitle>
                            <DialogDescription>
                              Add a new link to "{section.title}" section
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="link-label">Link Label</Label>
                              <Input
                                id="link-label"
                                value={linkForm.label}
                                onChange={(e) => setLinkForm({ ...linkForm, label: e.target.value })}
                                placeholder="e.g., About Us"
                              />
                            </div>
                            <div>
                              <Label htmlFor="link-href">URL</Label>
                              <Input
                                id="link-href"
                                value={linkForm.href}
                                onChange={(e) => setLinkForm({ ...linkForm, href: e.target.value })}
                                placeholder="e.g., /about"
                              />
                            </div>
                            <Button
                              onClick={() => handleAddLink(section.id)}
                              className="w-full"
                            >
                              {editingLinkIndex !== null ? "Update Link" : "Add Link"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {section.links.length === 0 ? (
                        <p className="text-sm text-gray-500 py-4">No links yet</p>
                      ) : (
                        <ScrollArea className="h-auto">
                          <div className="space-y-2">
                            {section.links.map((link, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded"
                              >
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{link.label}</p>
                                  <p className="text-xs text-gray-500">{link.href}</p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      handleEditLink(section.id, index)
                                      setShowLinkDialog(true)
                                    }}
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteLink(section.id, index)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Copyright Message */}
          <Card>
            <CardHeader>
              <CardTitle>Copyright Message</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="copyright">Message</Label>
                <Textarea
                  id="copyright"
                  value={footerConfig.copyrightMessage}
                  onChange={(e) => handleCustomChange("copyrightMessage", e.target.value)}
                  placeholder="Enter copyright message"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Current footer: © {new Date().getFullYear()} {footerConfig.useProfileName ? profileData.name : footerConfig.customName}. All rights reserved. | {footerConfig.copyrightMessage}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex gap-4 justify-end">
            <Link href="/admin">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
