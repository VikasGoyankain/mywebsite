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
import { ArrowLeft, Plus, Trash2, Save, Copy } from "lucide-react"
import Link from "next/link"
import { FooterConfig, FooterLink } from "@/lib/redis"

export default function AdminFooter() {
  useDatabaseInit()
  const { footerConfig, updateFooterConfig, saveFooterConfig: storeFooterConfig } = useProfileStore()
  const { profileData } = useProfileStore()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [showSocialDialog, setShowSocialDialog] = useState(false)
  const [showQuickLinkDialog, setShowQuickLinkDialog] = useState(false)
  const [showLegalLinkDialog, setShowLegalLinkDialog] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [linkForm, setLinkForm] = useState({ name: "", href: "" })

  if (!footerConfig) {
    return <div className="p-6">Loading footer configuration...</div>
  }

  const handleToggle = (field: "useProfileName" | "useProfileImage" | "useProfileBio", value: boolean) => {
    updateFooterConfig({ [field]: value })
  }

  const handleCustomChange = (field: string, value: string) => {
    updateFooterConfig({ [field]: value })
  }

  const handleAddSocialLink = () => {
    if (!linkForm.name || !linkForm.href) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" })
      return
    }

    const updatedLinks = editingIndex !== null
      ? footerConfig.socialLinks.map((link, i) =>
          i === editingIndex ? { name: linkForm.name, href: linkForm.href } : link
        )
      : [...footerConfig.socialLinks, { name: linkForm.name, href: linkForm.href }]

    updateFooterConfig({ socialLinks: updatedLinks })
    setLinkForm({ name: "", href: "" })
    setEditingIndex(null)
    setShowSocialDialog(false)
    toast({ title: "Success", description: editingIndex !== null ? "Social link updated" : "Social link added" })
  }

  const handleAddQuickLink = () => {
    if (!linkForm.name || !linkForm.href) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" })
      return
    }

    const updatedLinks: FooterLink[] = editingIndex !== null
      ? footerConfig.quickLinks.map((link, i) =>
          i === editingIndex ? { label: linkForm.name, href: linkForm.href } : link
        )
      : [...footerConfig.quickLinks, { label: linkForm.name, href: linkForm.href }]

    updateFooterConfig({ quickLinks: updatedLinks })
    setLinkForm({ name: "", href: "" })
    setEditingIndex(null)
    setShowQuickLinkDialog(false)
    toast({ title: "Success", description: editingIndex !== null ? "Quick link updated" : "Quick link added" })
  }

  const handleAddLegalLink = () => {
    if (!linkForm.name || !linkForm.href) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" })
      return
    }

    const updatedLinks: FooterLink[] = editingIndex !== null
      ? footerConfig.legalLinks.map((link, i) =>
          i === editingIndex ? { label: linkForm.name, href: linkForm.href } : link
        )
      : [...footerConfig.legalLinks, { label: linkForm.name, href: linkForm.href }]

    updateFooterConfig({ legalLinks: updatedLinks })
    setLinkForm({ name: "", href: "" })
    setEditingIndex(null)
    setShowLegalLinkDialog(false)
    toast({ title: "Success", description: editingIndex !== null ? "Legal link updated" : "Legal link added" })
  }

  const handleDeleteSocialLink = (index: number) => {
    updateFooterConfig({
      socialLinks: footerConfig.socialLinks.filter((_, i) => i !== index),
    })
    toast({ title: "Success", description: "Social link deleted" })
  }

  const handleDeleteQuickLink = (index: number) => {
    updateFooterConfig({
      quickLinks: footerConfig.quickLinks.filter((_, i) => i !== index),
    })
    toast({ title: "Success", description: "Quick link deleted" })
  }

  const handleDeleteLegalLink = (index: number) => {
    updateFooterConfig({
      legalLinks: footerConfig.legalLinks.filter((_, i) => i !== index),
    })
    toast({ title: "Success", description: "Legal link deleted" })
  }

  const handleEditSocialLink = (index: number) => {
    const link = footerConfig.socialLinks[index]
    setLinkForm({ name: link.name, href: link.href })
    setEditingIndex(index)
    setShowSocialDialog(true)
  }

  const handleEditQuickLink = (index: number) => {
    const link = footerConfig.quickLinks[index]
    setLinkForm({ name: link.label, href: link.href })
    setEditingIndex(index)
    setShowQuickLinkDialog(true)
  }

  const handleEditLegalLink = (index: number) => {
    const link = footerConfig.legalLinks[index]
    setLinkForm({ name: link.label, href: link.href })
    setEditingIndex(index)
    setShowLegalLinkDialog(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await storeFooterConfig()
      toast({ title: "Success", description: "Footer configuration saved successfully" })
      // Optional: Show a message that users need to refresh public pages to see changes
      toast({ 
        title: "Info", 
        description: "Public pages will show updates after refresh or when they reload naturally"
      })
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

  const resetDialog = () => {
    setLinkForm({ name: "", href: "" })
    setEditingIndex(null)
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

          {/* Social Links */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Social Links</CardTitle>
              <Dialog open={showSocialDialog} onOpenChange={setShowSocialDialog}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    onClick={() => {
                      resetDialog()
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Social Link
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingIndex !== null ? "Edit Social Link" : "Add Social Link"}</DialogTitle>
                    <DialogDescription>Enter the social platform name and profile URL</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Platform Name (e.g., LinkedIn, Twitter)</Label>
                      <Input
                        value={linkForm.name}
                        onChange={(e) => setLinkForm({ ...linkForm, name: e.target.value })}
                        placeholder="e.g., LinkedIn"
                      />
                    </div>
                    <div>
                      <Label>Profile URL</Label>
                      <Input
                        value={linkForm.href}
                        onChange={(e) => setLinkForm({ ...linkForm, href: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <Button onClick={handleAddSocialLink} className="w-full">
                      {editingIndex !== null ? "Update" : "Add"} Social Link
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2 pr-4">
                  {footerConfig.socialLinks.length === 0 ? (
                    <p className="text-sm text-gray-500 py-4">No social links added yet</p>
                  ) : (
                    footerConfig.socialLinks.map((link, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{link.name}</p>
                          <p className="text-sm text-gray-500 truncate">{link.href}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditSocialLink(index)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSocialLink(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Quick Links</CardTitle>
              <Dialog open={showQuickLinkDialog} onOpenChange={setShowQuickLinkDialog}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    onClick={() => {
                      resetDialog()
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Quick Link
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingIndex !== null ? "Edit Quick Link" : "Add Quick Link"}</DialogTitle>
                    <DialogDescription>Enter the link label and URL</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Link Label</Label>
                      <Input
                        value={linkForm.name}
                        onChange={(e) => setLinkForm({ ...linkForm, name: e.target.value })}
                        placeholder="e.g., Home"
                      />
                    </div>
                    <div>
                      <Label>URL</Label>
                      <Input
                        value={linkForm.href}
                        onChange={(e) => setLinkForm({ ...linkForm, href: e.target.value })}
                        placeholder="e.g., /"
                      />
                    </div>
                    <Button onClick={handleAddQuickLink} className="w-full">
                      {editingIndex !== null ? "Update" : "Add"} Quick Link
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2 pr-4">
                  {footerConfig.quickLinks.length === 0 ? (
                    <p className="text-sm text-gray-500 py-4">No quick links added yet</p>
                  ) : (
                    footerConfig.quickLinks.map((link, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{link.label}</p>
                          <p className="text-sm text-gray-500">{link.href}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditQuickLink(index)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteQuickLink(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Legal Links */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Legal Links</CardTitle>
              <Dialog open={showLegalLinkDialog} onOpenChange={setShowLegalLinkDialog}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    onClick={() => {
                      resetDialog()
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Legal Link
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingIndex !== null ? "Edit Legal Link" : "Add Legal Link"}</DialogTitle>
                    <DialogDescription>Enter the link label and URL</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Link Label</Label>
                      <Input
                        value={linkForm.name}
                        onChange={(e) => setLinkForm({ ...linkForm, name: e.target.value })}
                        placeholder="e.g., Privacy Policy"
                      />
                    </div>
                    <div>
                      <Label>URL</Label>
                      <Input
                        value={linkForm.href}
                        onChange={(e) => setLinkForm({ ...linkForm, href: e.target.value })}
                        placeholder="e.g., /privacy"
                      />
                    </div>
                    <Button onClick={handleAddLegalLink} className="w-full">
                      {editingIndex !== null ? "Update" : "Add"} Legal Link
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2 pr-4">
                  {footerConfig.legalLinks.length === 0 ? (
                    <p className="text-sm text-gray-500 py-4">No legal links added yet</p>
                  ) : (
                    footerConfig.legalLinks.map((link, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{link.label}</p>
                          <p className="text-sm text-gray-500">{link.href}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditLegalLink(index)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLegalLink(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

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
