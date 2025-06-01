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
import { ProfilePhotoUploader } from "@/components/profile-photo-uploader"
import {
  ChevronLeft,
  Save,
  Plus,
  Trash2,
  Edit,
  Loader2,
  X,
  Award,
  Star,
  Heart,
  BookOpen,
  Briefcase,
  GraduationCap,
  Gavel,
  Globe,
  Users,
  FileText,
  MessageSquare,
  Send,
  Verified,
  Clock,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Twitter,
  Linkedin,
  BookMarked,
  School,
  Mic,
  Landmark,
  Scale,
  Lightbulb,
  Users2,
  Megaphone,
  Vote,
  ScrollText,
  Building2,
  Sparkles,
  Brain,
  Target,
  Shield,
  Handshake,
  Scroll,
  BookOpenCheck,
  Presentation,
  Speech,
  Flag,
  Crown,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const SOCIAL_PLATFORMS = [
  {
    name: 'LinkedIn',
    icon: '/icons/linkedin.svg',
    color: 'bg-blue-600',
    placeholder: 'https://linkedin.com/in/yourusername'
  },
  {
    name: 'GitHub',
    icon: '/icons/github.svg',
    color: 'bg-gray-900',
    placeholder: 'https://github.com/yourusername'
  },
  {
    name: 'Twitter',
    icon: '/icons/twitter.svg',
    color: 'bg-black',
    placeholder: 'https://twitter.com/yourusername'
  },
  {
    name: 'Instagram',
    icon: '/icons/instagram.svg',
    color: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500',
    placeholder: 'https://instagram.com/yourusername'
  },
  {
    name: 'Facebook',
    icon: '/icons/facebook.svg',
    color: 'bg-blue-600',
    placeholder: 'https://facebook.com/yourusername'
  },
  {
    name: 'YouTube',
    icon: '/icons/youtube.svg',
    color: 'bg-red-600',
    placeholder: 'https://youtube.com/@yourusername'
  },
  {
    name: 'WhatsApp',
    icon: '/icons/whatsapp.svg',
    color: 'bg-green-500',
    placeholder: 'https://wa.me/yourphonenumber'
  },
  {
    name: 'Telegram',
    icon: '/icons/telegram.svg',
    color: 'bg-blue-400',
    placeholder: 'https://t.me/yourusername'
  },
  {
    name: 'Threads',
    icon: '/icons/threads.svg',
    color: 'bg-black',
    placeholder: 'https://threads.net/@yourusername'
  },
  {
    name: 'Pinterest',
    icon: '/icons/pinterest.svg',
    color: 'bg-red-600',
    placeholder: 'https://pinterest.com/yourusername'
  },
  {
    name: 'Quora',
    icon: '/icons/quora.svg',
    color: 'bg-red-500',
    placeholder: 'https://quora.com/profile/yourusername'
  },
  {
    name: 'Reddit',
    icon: '/icons/reddit.svg',
    color: 'bg-orange-500',
    placeholder: 'https://reddit.com/user/yourusername'
  },
  {
    name: 'Discord',
    icon: '/icons/discord.svg',
    color: 'bg-indigo-600',
    placeholder: 'https://discord.com/users/yourusername'
  }
] as const;

const iconMap = {
  Award,
  Star,
  Heart,
  BookOpen,
  Briefcase,
  GraduationCap,
  Gavel,
  Globe,
  Users,
  FileText,
  MessageSquare,
  Send,
  Verified,
  Clock,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Twitter,
  Linkedin,
  BookMarked,
  School,
  Mic,
  Landmark,
  Scale,
  Lightbulb,
  Users2,
  Megaphone,
  Vote,
  ScrollText,
  Building2,
  Sparkles,
  Brain,
  Target,
  Shield,
  Handshake,
  Scroll,
  BookOpenCheck,
  Presentation,
  Speech,
  Flag,
  Crown,
} as const;

const BADGE_ICONS = [
  { name: 'BookMarked', icon: 'BookMarked', description: 'Law Student' },
  { name: 'School', icon: 'School', description: 'Student Leader' },
  { name: 'Scale', icon: 'Scale', description: 'Legal Advocate' },
  { name: 'Gavel', icon: 'Gavel', description: 'Legal Expert' },
  { name: 'Landmark', icon: 'Landmark', description: 'Member of Parliament' },
  { name: 'Mic', icon: 'Mic', description: 'Public Speaker' },
  { name: 'Megaphone', icon: 'Megaphone', description: 'Political Activist' },
  { name: 'Users2', icon: 'Users2', description: 'Social Worker' },
  { name: 'Brain', icon: 'Brain', description: 'Intelligent' },
  { name: 'Lightbulb', icon: 'Lightbulb', description: 'Smart' },
  { name: 'Sparkles', icon: 'Sparkles', description: 'Rising Star' },
  { name: 'Target', icon: 'Target', description: 'Goal Oriented' },
  { name: 'Shield', icon: 'Shield', description: 'Protector of Rights' },
  { name: 'Handshake', icon: 'Handshake', description: 'Diplomatic' },
  { name: 'Scroll', icon: 'Scroll', description: 'Policy Expert' },
  { name: 'BookOpenCheck', icon: 'BookOpenCheck', description: 'Academic Excellence' },
  { name: 'Presentation', icon: 'Presentation', description: 'Public Policy Expert' },
  { name: 'Speech', icon: 'Speech', description: 'Orator' },
  { name: 'Flag', icon: 'Flag', description: 'National Leader' },
  { name: 'Crown', icon: 'Crown', description: 'Leadership Excellence' },
  { name: 'Award', icon: 'Award', description: 'Achievement' },
  { name: 'Star', icon: 'Star', description: 'Excellence' },
  { name: 'Heart', icon: 'Heart', description: 'Passion' },
  { name: 'Briefcase', icon: 'Briefcase', description: 'Professional' },
  { name: 'Globe', icon: 'Globe', description: 'International' },
  { name: 'FileText', icon: 'FileText', description: 'Documentation' },
  { name: 'MessageSquare', icon: 'MessageSquare', description: 'Communication' },
  { name: 'Verified', icon: 'Verified', description: 'Certified' },
  { name: 'Clock', icon: 'Clock', description: 'Time Management' },
  { name: 'Vote', icon: 'Vote', description: 'Democratic Leader' },
  { name: 'Building2', icon: 'Building2', description: 'Institution Builder' },
  { name: 'ScrollText', icon: 'ScrollText', description: 'Policy Maker' },
] as const;

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
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      {/* Header Section - More compact and responsive */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 bg-white/50 backdrop-blur-sm p-4 rounded-lg shadow-sm sticky top-0 z-50">
        <div>
          <Button variant="outline" size="sm" asChild className="mb-2 hover:bg-gray-50">
            <Link href="/admin" className="flex items-center">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Profile Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Update your personal information and contact details
          </p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <Button 
            onClick={handleSaveChanges} 
            disabled={isSaving || !hasUnsavedChanges}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </Button>
          {lastSaved && (
            <span className="text-xs text-muted-foreground bg-gray-50 px-2 py-1 rounded">
              Last saved: {new Date(lastSaved).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Main Grid - More responsive and adaptive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column - Basic Info and Profile Image */}
        <div className="lg:col-span-4 space-y-4">
          {/* Basic Profile Info - More compact */}
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="name" className="text-sm">Name</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => updateProfileData({ name: e.target.value })}
                  placeholder="Your name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="title" className="text-sm">Title / Position</Label>
                <Input
                  id="title"
                  value={profileData.title}
                  onChange={(e) => updateProfileData({ title: e.target.value })}
                  placeholder="e.g. Senior Legal Consultant"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="bio" className="text-sm">Bio</Label>
                <Textarea
                  id="bio"
                  rows={4}
                  value={profileData.bio}
                  onChange={(e) => updateProfileData({ bio: e.target.value })}
                  placeholder="Write a brief professional bio..."
                  className="mt-1 resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Profile Image - More compact */}
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Profile Image</CardTitle>
              <CardDescription className="text-sm">Upload a profile image or provide an image URL</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfilePhotoUploader
                currentImageUrl={profileData.profileImage}
                onImageSelect={(url, file) => {
                  if (file) {
                    const formData = new FormData()
                    formData.append('file', file)
                    
                    fetch('/api/upload', {
                      method: 'POST',
                      body: formData,
                    })
                    .then(response => response.json())
                    .then(data => {
                      if (data.success) {
                        updateProfileData({ profileImage: data.url })
                      } else {
                        throw new Error(data.error || 'Failed to upload image')
                      }
                    })
                    .catch(error => {
                      console.error('Error uploading image:', error)
                      toast({
                        title: "Upload failed",
                        description: "Failed to upload image to server. Please try again.",
                        variant: "destructive",
                      })
                    })
                  } else {
                    updateProfileData({ profileImage: url })
                  }
                }}
                onImageRemove={() => {
                  updateProfileData({ profileImage: "" })
                }}
              />
            </CardContent>
          </Card>

          {/* Contact Information - More compact */}
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="email" className="text-sm">Email</Label>
                <Input
                  id="email"
                  value={profileData.contact.email}
                  onChange={(e) => updateContact({ email: e.target.value })}
                  placeholder="your.email@example.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm">Phone</Label>
                <Input
                  id="phone"
                  value={profileData.contact.phone}
                  onChange={(e) => updateContact({ phone: e.target.value })}
                  placeholder="+1234567890"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="location" className="text-sm">Location</Label>
                <Input
                  id="location"
                  value={profileData.contact.location}
                  onChange={(e) => updateContact({ location: e.target.value })}
                  placeholder="City, Country"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="availability" className="text-sm">Availability</Label>
                <Input
                  id="availability"
                  value={profileData.contact.availability}
                  onChange={(e) => updateContact({ availability: e.target.value })}
                  placeholder="e.g. Available for consultations"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Specializations, Social Links, and Badges */}
        <div className="lg:col-span-8 space-y-4">
          {/* Specializations - More compact */}
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Specializations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {profileData.specializations.map((specialization, index) => (
                    <Badge 
                      key={index} 
                      className="px-3 py-1 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                    >
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
                    <div className="text-sm text-muted-foreground italic">No specializations added yet.</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    id="new-specialization"
                    placeholder="Add a specialization..."
                    className="flex-1"
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
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
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

          {/* Social Links - More compact */}
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Social Links</CardTitle>
              <CardDescription className="text-sm">Add your social media profiles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profileData.socialLinks.map((link) => (
                  <div key={link.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="relative w-8 h-8 flex items-center justify-center rounded-full overflow-hidden bg-gray-100">
                      <img
                        src={link.icon}
                        alt={link.name}
                        className="w-5 h-5"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{link.name}</div>
                      <Input
                        type="url"
                        value={link.href}
                        onChange={(e) => {
                          const newLinks = [...profileData.socialLinks];
                          const linkIndex = newLinks.findIndex(l => l.id === link.id);
                          if (linkIndex !== -1) {
                            newLinks[linkIndex].href = e.target.value;
                            updateProfileData({ socialLinks: newLinks });
                          }
                        }}
                        placeholder={SOCIAL_PLATFORMS.find(p => p.name === link.name)?.placeholder}
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => {
                        const newLinks = profileData.socialLinks.filter(l => l.id !== link.id);
                        updateProfileData({ socialLinks: newLinks });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center gap-2 pt-2">
                  <Select
                    value={socialForm.name}
                    onValueChange={(value) => {
                      const platform = SOCIAL_PLATFORMS.find(p => p.name === value);
                      if (platform) {
                        setSocialForm({
                          name: platform.name,
                          icon: platform.icon,
                          href: '',
                          color: platform.color
                        });
                      }
                    }}
                  >
                    <SelectTrigger className="w-[180px] h-9">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {SOCIAL_PLATFORMS.map((platform) => (
                        <SelectItem key={platform.name} value={platform.name}>
                          <div className="flex items-center gap-2">
                            <div className="relative w-4 h-4 flex items-center justify-center">
                              <img
                                src={platform.icon}
                                alt={platform.name}
                                className="w-4 h-4"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/placeholder.svg';
                                }}
                              />
                            </div>
                            <span className="text-sm">{platform.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="url"
                    value={socialForm.href}
                    onChange={(e) => setSocialForm({ ...socialForm, href: e.target.value })}
                    placeholder={SOCIAL_PLATFORMS.find(p => p.name === socialForm.name)?.placeholder}
                    className="flex-1 h-9 text-sm"
                  />
                  <Button
                    onClick={() => {
                      if (socialForm.name && socialForm.href) {
                        const newLink = {
                          id: Date.now(),
                          name: socialForm.name,
                          icon: socialForm.icon,
                          href: socialForm.href,
                          color: socialForm.color
                        };
                        updateProfileData({
                          socialLinks: [...profileData.socialLinks, newLink],
                        });
                        setSocialForm({ name: '', icon: '', href: '', color: '' });
                      }
                    }}
                    disabled={!socialForm.name || !socialForm.href}
                    className="h-9 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Badges - More compact */}
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Badges</CardTitle>
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
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Badge
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profileData.badges.map((badge) => {
                  const IconComponent = iconMap[badge.icon as keyof typeof iconMap]
                  return (
                    <Badge 
                      key={badge.id} 
                      className={`px-3 py-1 text-sm relative group ${badge.color} hover:shadow-md transition-all duration-200`}
                    >
                      {IconComponent && <IconComponent className="w-4 h-4 mr-1" />}
                      <span>{badge.text}</span>
                      <div className="absolute right-0 top-0 transform translate-x-1/2 -translate-y-1/2 hidden group-hover:flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 w-6 p-0 rounded-full bg-white hover:bg-gray-50"
                          onClick={() => {
                            setEditingBadge(badge.id);
                            setBadgeForm({
                              text: badge.text,
                              icon: badge.icon,
                              color: badge.color,
                            });
                            setIsBadgeDialogOpen(true);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 w-6 p-0 rounded-full bg-white hover:bg-red-50 text-red-500 hover:text-red-600"
                          onClick={() => deleteBadge(badge.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </Badge>
                  )
                })}
                {profileData.badges.length === 0 && (
                  <div className="text-sm text-muted-foreground italic w-full text-center py-4">No badges added yet.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
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
                  <Label htmlFor="social-platform">Platform</Label>
                  <select
                    id="social-platform"
                    className="w-full p-2 border rounded-md"
                    value={socialForm.name}
                    onChange={(e) => {
                      const platform = SOCIAL_PLATFORMS.find(p => p.name === e.target.value);
                      if (platform) {
                        setSocialForm({
                          name: platform.name,
                          icon: platform.icon,
                          href: "",
                          color: platform.color,
                        });
                      }
                    }}
                    required
                  >
                    <option value="">Select a platform</option>
                    {SOCIAL_PLATFORMS.map((platform) => (
                      <option key={platform.name} value={platform.name}>
                        {platform.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="social-url">URL</Label>
                  <Input
                    id="social-url"
                    type="url"
                    value={socialForm.href}
                    onChange={(e) => setSocialForm({ ...socialForm, href: e.target.value })}
                    placeholder={SOCIAL_PLATFORMS.find(p => p.name === socialForm.name)?.placeholder || "https://..."}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsSocialDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save</Button>
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
                    placeholder="e.g. Legal Expert"
                    required
                  />
                </div>
                <div>
                  <Label>Icon</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {BADGE_ICONS.map((icon) => {
                      const IconComponent = iconMap[icon.icon as keyof typeof iconMap]
                      return (
                        <button
                          key={icon.name}
                          type="button"
                          onClick={() => setBadgeForm({ ...badgeForm, icon: icon.name })}
                          className={`p-2 rounded-lg border ${
                            badgeForm.icon === icon.name
                              ? 'border-primary bg-primary/10'
                              : 'border-gray-200 hover:border-primary/50'
                          } flex flex-col items-center gap-1 group`}
                          title={icon.description}
                        >
                          {IconComponent && <IconComponent className="w-5 h-5" />}
                          <span className="text-xs text-gray-500 group-hover:text-gray-700">
                            {icon.name}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div>
                  <Label>Color</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
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
                  <Button type="submit" disabled={!badgeForm.text || !badgeForm.icon}>
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