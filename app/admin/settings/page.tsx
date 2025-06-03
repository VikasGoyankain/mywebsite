"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Plus,
  Save,
  Trash2,
  Edit,
  Loader2,
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
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import { useDatabaseInit } from "@/hooks/use-database-init"
import { useProfileStore } from "@/lib/profile-store"
import type { NavigationButton } from "@/lib/profile-store"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

// Define icon options with proper typing
const iconOptions = [
  { value: "Award", label: "Award", Icon: Award },
  { value: "Star", label: "Star", Icon: Star },
  { value: "Heart", label: "Heart", Icon: Heart },
  { value: "BookOpen", label: "Book Open", Icon: BookOpen },
  { value: "Briefcase", label: "Briefcase", Icon: Briefcase },
  { value: "GraduationCap", label: "Graduation Cap", Icon: GraduationCap },
  { value: "Gavel", label: "Gavel", Icon: Gavel },
  { value: "Globe", label: "Globe", Icon: Globe },
  { value: "Users", label: "Users", Icon: Users },
  { value: "FileText", label: "File Text", Icon: FileText },
  { value: "MessageSquare", label: "Message Square", Icon: MessageSquare },
  { value: "Send", label: "Send", Icon: Send },
  { value: "Verified", label: "Verified", Icon: Verified },
  { value: "Clock", label: "Clock", Icon: Clock },
  { value: "Mail", label: "Mail", Icon: Mail },
  { value: "Phone", label: "Phone", Icon: Phone },
  { value: "MapPin", label: "Map Pin", Icon: MapPin },
  { value: "BookMarked", label: "Book Marked", Icon: BookMarked },
  { value: "School", label: "School", Icon: School },
  { value: "Mic", label: "Mic", Icon: Mic },
  { value: "Landmark", label: "Landmark", Icon: Landmark },
  { value: "Scale", label: "Scale", Icon: Scale },
  { value: "Lightbulb", label: "Lightbulb", Icon: Lightbulb },
  { value: "Users2", label: "Users 2", Icon: Users2 },
  { value: "Megaphone", label: "Megaphone", Icon: Megaphone },
  { value: "Vote", label: "Vote", Icon: Vote },
  { value: "ScrollText", label: "Scroll Text", Icon: ScrollText },
  { value: "Building2", label: "Building", Icon: Building2 },
  { value: "Sparkles", label: "Sparkles", Icon: Sparkles },
  { value: "Brain", label: "Brain", Icon: Brain },
  { value: "Target", label: "Target", Icon: Target },
  { value: "Shield", label: "Shield", Icon: Shield },
  { value: "Handshake", label: "Handshake", Icon: Handshake },
  { value: "Scroll", label: "Scroll", Icon: Scroll },
  { value: "BookOpenCheck", label: "Book Open Check", Icon: BookOpenCheck },
  { value: "Presentation", label: "Presentation", Icon: Presentation },
  { value: "Speech", label: "Speech", Icon: Speech },
  { value: "Flag", label: "Flag", Icon: Flag },
  { value: "Crown", label: "Crown", Icon: Crown },
] as const

const colorOptions = [
  { value: "bg-blue-500", label: "Blue" },
  { value: "bg-purple-500", label: "Purple" },
  { value: "bg-green-500", label: "Green" },
  { value: "bg-red-500", label: "Red" },
  { value: "bg-yellow-500", label: "Yellow" },
  { value: "bg-pink-500", label: "Pink" },
  { value: "bg-indigo-500", label: "Indigo" },
  { value: "bg-teal-500", label: "Teal" },
  { value: "bg-orange-500", label: "Orange" },
  { value: "bg-cyan-500", label: "Cyan" },
] as const

// Helper function to get icon component
const getIconComponent = (iconName: string): LucideIcon | null => {
  const option = iconOptions.find(opt => opt.value === iconName)
  return option?.Icon || null
}

export default function SettingsPage() {
  // Initialize database connection
  useDatabaseInit()

  const { toast } = useToast()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("password")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get store data and actions
  const {
    navigationButtons,
    updateAdminPassword,
    verifyAdminPassword,
    addNavigationButton,
    updateNavigationButton,
    deleteNavigationButton,
    saveToDatabase,
  } = useProfileStore()

  // Password change form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Navigation buttons state
  const [editingButton, setEditingButton] = useState<NavigationButton | null>(null)
  const [newButton, setNewButton] = useState<Omit<NavigationButton, "id">>({
    text: "",
    href: "",
    icon: "",
    description: "",
    color: "bg-blue-500",
    order: 0,
  })

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Security checks
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "All password fields are required.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }
    if (passwordForm.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "New password must be at least 8 characters.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      toast({
        title: "Error",
        description: "New password must be different from the current password.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }
    // Basic strength check: must contain letters and numbers
    if (!/[a-zA-Z]/.test(passwordForm.newPassword) || !/[0-9]/.test(passwordForm.newPassword)) {
      toast({
        title: "Error",
        description: "Password must contain both letters and numbers.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      // Verify current password
      const isCurrentPasswordValid = await verifyAdminPassword(passwordForm.currentPassword)
      if (!isCurrentPasswordValid) {
        toast({
          title: "Error",
          description: "Current password is incorrect.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Update password
      await updateAdminPassword(passwordForm.newPassword)
      await saveToDatabase()
      
      toast({
        title: "Success",
        description: "Password changed successfully.",
        variant: "default",
      })
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle navigation button management
  const handleAddButton = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (editingButton) {
        updateNavigationButton(editingButton.id, editingButton)
      } else {
        addNavigationButton(newButton)
      }
      
      await saveToDatabase()
      
      // Reset form
      setNewButton({
        text: "",
        href: "",
        icon: "",
        description: "",
        color: "bg-blue-500",
        order: navigationButtons.length,
      })
      setEditingButton(null)
      
      toast({
        title: "Success",
        description: `Navigation button ${editingButton ? "updated" : "added"} successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingButton ? "update" : "add"} navigation button. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteButton = async (buttonId: string) => {
    setIsSubmitting(true)

    try {
      deleteNavigationButton(buttonId)
      await saveToDatabase()
      
      toast({
        title: "Success",
        description: "Navigation button deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete navigation button. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 bg-white/50 backdrop-blur-sm p-4 rounded-lg shadow-sm sticky top-0 z-50">
        <div>
          <Button variant="outline" size="sm" asChild className="mb-2 hover:bg-gray-50">
            <Link href="/admin" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your account settings and website preferences
          </p>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="password">Change Password</TabsTrigger>
          <TabsTrigger value="navigation">Navigation Buttons</TabsTrigger>
        </TabsList>

        {/* Password Change Tab */}
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your admin account password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value
                    })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value
                    })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value
                    })}
                    required
                  />
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Changing Password...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Change Password
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Navigation Buttons Tab */}
        <TabsContent value="navigation">
          <Card>
            <CardHeader>
              <CardTitle>Navigation Buttons</CardTitle>
              <CardDescription>
                Manage the navigation buttons displayed below your bio
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Add/Edit Button Form */}
              <form onSubmit={handleAddButton} className="space-y-4 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="button-text">Button Text</Label>
                    <Input
                      id="button-text"
                      value={editingButton ? editingButton.text : newButton.text}
                      onChange={(e) => editingButton 
                        ? setEditingButton({...editingButton, text: e.target.value})
                        : setNewButton({...newButton, text: e.target.value})
                      }
                      placeholder="e.g. View Resume"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="button-href">Button Link</Label>
                    <Input
                      id="button-href"
                      value={editingButton ? editingButton.href : newButton.href}
                      onChange={(e) => editingButton
                        ? setEditingButton({...editingButton, href: e.target.value})
                        : setNewButton({...newButton, href: e.target.value})
                      }
                      placeholder="e.g. /resume"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="button-icon">Icon</Label>
                    <Select
                      value={editingButton ? editingButton.icon : newButton.icon}
                      onValueChange={(value) => editingButton
                        ? setEditingButton({...editingButton, icon: value})
                        : setNewButton({...newButton, icon: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an icon" />
                      </SelectTrigger>
                      <SelectContent>
                        {iconOptions.map(({ value, label, Icon }) => (
                          <SelectItem key={value} value={value}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              {label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="button-color">Color</Label>
                    <Select
                      value={editingButton ? editingButton.color : newButton.color}
                      onValueChange={(value) => editingButton
                        ? setEditingButton({...editingButton, color: value})
                        : setNewButton({...newButton, color: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a color" />
                      </SelectTrigger>
                      <SelectContent>
                        {colorOptions.map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center gap-2">
                              <div className={cn("w-4 h-4 rounded-full", color.value)} />
                              {color.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="button-description">Description</Label>
                  <Textarea
                    id="button-description"
                    value={editingButton ? editingButton.description : newButton.description}
                    onChange={(e) => editingButton
                      ? setEditingButton({...editingButton, description: e.target.value})
                      : setNewButton({...newButton, description: e.target.value})
                    }
                    placeholder="Enter a brief description for the button"
                    className="resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  {editingButton && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditingButton(null)}
                    >
                      Cancel Edit
                    </Button>
                  )}
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {editingButton ? "Updating..." : "Adding..."}
                      </>
                    ) : (
                      <>
                        {editingButton ? (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Update Button
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Button
                          </>
                        )}
                      </>
                    )}
                  </Button>
                </div>
              </form>

              {/* List of Navigation Buttons */}
              <div className="space-y-4">
                {navigationButtons.map((button) => {
                  const Icon = getIconComponent(button.icon)
                  return (
                    <div
                      key={button.id}
                      className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", button.color)}>
                          {Icon && <Icon className="w-6 h-6 text-white" />}
                        </div>
                        <div>
                          <p className="font-medium">{button.text}</p>
                          <p className="text-sm text-gray-500">{button.href}</p>
                          {button.description && (
                            <p className="text-sm text-gray-600 mt-1">{button.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingButton(button)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteButton(button.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
                {navigationButtons.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    No navigation buttons added yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 