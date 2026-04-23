"use client"

import { useEffect, useState } from "react"
import { useProfileStore } from "@/lib/profile-store"
import { useDatabaseInit } from "@/hooks/use-database-init"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Plus, Save, Trash2, AlertCircle, CheckCircle2, ArrowLeft, PlusCircle, Settings, ChevronUp, ChevronDown, GripVertical } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

// Form interfaces
interface EducationFormData {
  degree: string
  institution: string
  year: string
  grade: string
  specialization: string
  achievements: string[]
  image: string
}

interface ExperienceFormData {
  title: string
  company: string
  duration: string
  location: string
  description: string
  type: string
  image: string
  order: number
}

// Default form data
const defaultEducationForm: EducationFormData = {
  degree: "",
  institution: "",
  year: "",
  grade: "",
  specialization: "",
  achievements: [],
  image: ""
}

const defaultExperienceForm: ExperienceFormData = {
  title: "",
  company: "",
  duration: "",
  location: "",
  description: "",
  type: "",
  image: "",
  order: 0
}

const EXPERIENCE_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Freelance",
  "Internship",
  "Volunteer"
]

export default function AdminExpEduPage() {
  // Initialize database connection
  useDatabaseInit()

  // Get store data and actions
  const {
    education = [],
    experience = [],
    syncStatus,
    isLoading,
    error,
    addEducation,
    updateEducation,
    deleteEducation,
    moveEducationUp,
    moveEducationDown,
    addExperience,
    updateExperience,
    deleteExperience,
    moveExperienceUp,
    moveExperienceDown,
    saveToDatabase
  } = useProfileStore()

  // Local state
  const [activeTab, setActiveTab] = useState("education")
  const [formTab, setFormTab] = useState<"education" | "experience" | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showEducationOrderManager, setShowEducationOrderManager] = useState(false)
  const [showExperienceOrderManager, setShowExperienceOrderManager] = useState(false)

  // Form data state
  const [educationForm, setEducationForm] = useState<EducationFormData>(defaultEducationForm)
  const [experienceForm, setExperienceForm] = useState<ExperienceFormData>(defaultExperienceForm)

  // Alternative input method for adding items
  const [educationAchievementInput, setEducationAchievementInput] = useState("")

  // Sort education by order
  const sortedEducation = [...education].sort((a, b) => (a.order || 0) - (b.order || 0))
  
  // Sort experience by order
  const sortedExperience = [...experience].sort((a, b) => (a.order || 0) - (b.order || 0))

  // Add state for reordering feedback
  const [reorderingId, setReorderingId] = useState<string | null>(null)

  const addEducationAchievement = () => {
    if (!educationAchievementInput.trim()) return
    setEducationForm(prev => ({ ...prev, achievements: [...prev.achievements, educationAchievementInput.trim()] }))
    setEducationAchievementInput("")
  }

  // Reset form when selected item changes
  useEffect(() => {
    if (selectedId !== null) {
      switch (formTab) {
        case "education":
          const edu = education.find(e => e.id === selectedId)
          if (edu) setEducationForm({
            degree: edu.degree || "",
            institution: edu.institution || "",
            year: edu.year || "",
            grade: edu.grade || "",
            specialization: edu.specialization || "",
            achievements: Array.isArray(edu.achievements) ? edu.achievements : [],
            image: edu.image || ""
          })
          break
        case "experience":
          const exp = experience.find(e => e.id === selectedId)
          if (exp) setExperienceForm({
            title: exp.title || "",
            company: exp.company || "",
            duration: exp.duration || "",
            location: exp.location || "",
            description: exp.description || "",
            type: exp.type || "",
            image: exp.image || "",
            order: exp.order || 0
          })
          break
      }
    } else {
      setEducationForm(defaultEducationForm)
      setExperienceForm(defaultExperienceForm)
    }
  }, [selectedId, formTab, education, experience])

  // Reset sync status after success
  useEffect(() => {
    if (syncStatus === "success") {
      const timer = setTimeout(() => {
        useProfileStore.setState({ syncStatus: "idle" })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [syncStatus])

  const handleEducationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      if (selectedId === null) {
        addEducation({
          degree: educationForm.degree,
          institution: educationForm.institution,
          year: educationForm.year,
          grade: educationForm.grade,
          specialization: educationForm.specialization,
          achievements: educationForm.achievements,
          image: educationForm.image,
          order: education.length
        })
      } else {
        updateEducation(selectedId, {
          degree: educationForm.degree,
          institution: educationForm.institution,
          year: educationForm.year,
          grade: educationForm.grade,
          specialization: educationForm.specialization,
          achievements: educationForm.achievements,
          image: educationForm.image
        })
      }
      
      await saveToDatabase()
      toast.success(selectedId === null ? "Education entry added successfully" : "Education entry updated successfully")
      setSelectedId(null)
      setFormTab(null)
      setActiveTab("education")
    } catch (error) {
      toast.error("Failed to save education entry")
      console.error("Error saving education:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExperienceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (selectedId === null) {
        addExperience({
          title: experienceForm.title,
          company: experienceForm.company,
          duration: experienceForm.duration,
          location: experienceForm.location,
          description: experienceForm.description,
          type: experienceForm.type,
          image: experienceForm.image,
          order: experience.length
        })
      } else {
        updateExperience(selectedId, {
          title: experienceForm.title,
          company: experienceForm.company,
          duration: experienceForm.duration,
          location: experienceForm.location,
          description: experienceForm.description,
          type: experienceForm.type,
          image: experienceForm.image
        })
      }

      await saveToDatabase()
      toast.success(selectedId === null ? "Experience entry added successfully" : "Experience entry updated successfully")
      setSelectedId(null)
      setFormTab(null)
      setActiveTab("experience")
    } catch (error) {
      toast.error("Failed to save experience entry")
      console.error("Error saving experience:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle deletions
  const handleDelete = async (type: "education" | "experience", id: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return

    setIsSubmitting(true)
    try {
      if (type === "education") {
        deleteEducation(id)
      } else {
        deleteExperience(id)
      }
      await saveToDatabase()
      toast.success("Entry deleted successfully")
      if (selectedId === id) {
        setSelectedId(null)
        setFormTab(null)
      }
    } catch (error) {
      toast.error("Failed to delete entry")
      console.error("Error deleting entry:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle manual save
  const handleManualSave = async () => {
    setIsSubmitting(true)
    try {
      await saveToDatabase()
      toast.success("Changes saved successfully")
    } catch (error) {
      toast.error("Failed to save changes")
      console.error("Error saving changes:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle edit button click
  const handleEdit = (type: "education" | "experience", id: string) => {
    setSelectedId(id)
    setFormTab(type)
    setActiveTab("form")
  }

  // Handle add new button click
  const handleAddNew = (type: "education" | "experience") => {
    setSelectedId(null)
    setFormTab(type)
    setActiveTab("form")
    
    if (type === "education") {
      setEducationForm(defaultEducationForm)
    } else {
      setExperienceForm(defaultExperienceForm)
    }
  }

  // Update the move functions
  const handleMoveUp = async (id: string, type: "education" | "experience") => {
    setReorderingId(id)
    try {
      if (type === "education") {
        moveEducationUp(id)
      } else {
        moveExperienceUp(id)
      }
      await saveToDatabase()
      toast.success(`${type === "education" ? "Education" : "Experience"} order updated`)
    } catch (error) {
      toast.error("Failed to update order")
      console.error("Error updating order:", error)
    } finally {
      setReorderingId(null)
    }
  }

  const handleMoveDown = async (id: string, type: "education" | "experience") => {
    setReorderingId(id)
    try {
      if (type === "education") {
        moveEducationDown(id)
      } else {
        moveExperienceDown(id)
      }
      await saveToDatabase()
      toast.success(`${type === "education" ? "Education" : "Experience"} order updated`)
    } catch (error) {
      toast.error("Failed to update order")
      console.error("Error updating order:", error)
    } finally {
      setReorderingId(null)
    }
  }

  useEffect(() => {
    if ((education.length > 0 || experience.length > 0) && error) {
      useProfileStore.setState({ error: null });
    }
  }, [education, experience, error]);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <nav className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="icon" className="hover:bg-accent">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Education & Experience</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleManualSave}
                disabled={isSubmitting || syncStatus === "syncing"}
                variant="outline"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Navigation Tabs */}
      <div className="container mx-auto px-6 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
            <TabsTrigger
              value="education"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
            >
              Education
              {Array.isArray(education) && education.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {education.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="experience"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
            >
              Experience
              {Array.isArray(experience) && experience.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {experience.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Education Tab Content */}
          <TabsContent value="education" className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowEducationOrderManager(!showEducationOrderManager)}
                  className="hover:bg-accent"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {showEducationOrderManager ? 'Hide' : 'Manage'} Order
                </Button>
              </div>
              
              <Button
                variant="outline"
                onClick={() => handleAddNew("education")}
                className="hover:bg-accent"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Education
              </Button>
            </div>

            {/* Education Order Manager Section */}
            {showEducationOrderManager && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Manage Education Order</CardTitle>
                  <CardDescription>
                    Use the arrow buttons to reorder your education qualifications. The order will be reflected on your public profile.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {sortedEducation.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No education entries to reorder</p>
                    ) : (
                      <div className="space-y-2">
                        {sortedEducation.map((edu, index) => (
                          <div 
                            key={edu.id} 
                            className="flex items-center gap-3 p-3 bg-accent/30 rounded-md border"
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                              <span className="font-medium text-sm">#{index + 1}</span>
                              <div className="flex-1">
                                <p className="font-medium">{edu.degree || "Unnamed Degree"}</p>
                                <p className="text-sm text-muted-foreground">{edu.institution || "Institution not specified"}</p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleMoveUp(edu.id, "education")}
                                disabled={index === 0 || reorderingId === edu.id}
                                className="hover:bg-accent"
                              >
                                {reorderingId === edu.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <ChevronUp className="w-3 h-3" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleMoveDown(edu.id, "education")}
                                disabled={index === sortedEducation.length - 1 || reorderingId === edu.id}
                                className="hover:bg-accent"
                              >
                                {reorderingId === edu.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <ChevronDown className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {sortedEducation.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          Changes are automatically saved to the database.
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleManualSave}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-3 h-3 mr-1" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedEducation.map((edu) => (
                <Card key={edu.id} className="relative">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>
                          {edu.degree || "Unnamed Degree"}
                        </CardTitle>
                        <CardDescription>{edu.institution || "Institution not specified"}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          #{edu.order !== undefined ? edu.order + 1 : 'N/A'}
                        </Badge>
                        <Badge variant="secondary">
                          {edu.year || "Year not specified"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {edu.specialization && (
                        <p className="text-sm text-muted-foreground">
                          Specialization: {edu.specialization}
                        </p>
                      )}
                      {edu.grade && (
                        <p className="text-sm text-muted-foreground">
                          Grade: {edu.grade}
                        </p>
                      )}
                      {Array.isArray(edu.achievements) && edu.achievements.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Achievements:</p>
                          <div className="flex flex-wrap gap-1">
                            {edu.achievements.map((achievement, index) => (
                              <Badge key={index} variant="outline">
                                {achievement}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit("education", edu.id)}
                        className="hover:bg-accent"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-primary"
                        >
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                          <path d="m15 5 4 4" />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete("education", edu.id)}
                        className="hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!Array.isArray(education) || education.length === 0) && (
                <Card className="col-span-full">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-lg text-muted-foreground mb-4">No education entries yet</p>
                    <Button
                      variant="outline"
                      onClick={() => handleAddNew("education")}
                      className="hover:bg-accent"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Education Entry
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Experience Tab Content */}
          <TabsContent value="experience" className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowExperienceOrderManager(!showExperienceOrderManager)}
                  className="hover:bg-accent"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {showExperienceOrderManager ? 'Hide' : 'Manage'} Order
                </Button>
              </div>
              
              <Button
                variant="outline"
                onClick={() => handleAddNew("experience")}
                className="hover:bg-accent"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Experience
              </Button>
            </div>

            {/* Experience Order Manager Section */}
            {showExperienceOrderManager && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Manage Experience Order</CardTitle>
                  <CardDescription>
                    Use the arrow buttons to reorder your work experience. The order will be reflected on your public profile.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {sortedExperience.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No experience entries to reorder</p>
                    ) : (
                      <div className="space-y-2">
                        {sortedExperience.map((exp, index) => (
                          <div 
                            key={exp.id} 
                            className="flex items-center gap-3 p-3 bg-accent/30 rounded-md border"
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                              <span className="font-medium text-sm">#{index + 1}</span>
                              <div className="flex-1">
                                <p className="font-medium">{exp.title || "Unnamed Position"}</p>
                                <p className="text-sm text-muted-foreground">{exp.company || "Company not specified"}</p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleMoveUp(exp.id, "experience")}
                                disabled={index === 0 || reorderingId === exp.id}
                                className="hover:bg-accent"
                              >
                                {reorderingId === exp.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <ChevronUp className="w-3 h-3" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleMoveDown(exp.id, "experience")}
                                disabled={index === sortedExperience.length - 1 || reorderingId === exp.id}
                                className="hover:bg-accent"
                              >
                                {reorderingId === exp.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <ChevronDown className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {sortedExperience.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          Changes are automatically saved to the database.
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleManualSave}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-3 h-3 mr-1" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...experience].reverse().map((exp) => (
                <Card key={exp.id} className="relative">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>
                          {exp.title || "Unnamed Position"}
                        </CardTitle>
                        <CardDescription>{exp.company || "Company not specified"}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          #{exp.order !== undefined ? exp.order + 1 : 'N/A'}
                        </Badge>
                        <Badge variant="secondary">
                          {exp.duration || "Duration not specified"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {exp.location && (
                        <p className="text-sm text-muted-foreground">
                          Location: {exp.location}
                        </p>
                      )}
                      {exp.description && (
                        <p className="text-sm text-muted-foreground">
                          {exp.description}
                        </p>
                      )}
                      {exp.type && (
                        <Badge variant="outline" className="mt-2">
                          {exp.type}
                        </Badge>
                      )}
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit("experience", exp.id)}
                        className="hover:bg-accent"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-primary"
                        >
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                          <path d="m15 5 4 4" />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete("experience", exp.id)}
                        className="hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!Array.isArray(experience) || experience.length === 0) && (
                <Card className="col-span-full">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-lg text-muted-foreground mb-4">No experience entries yet</p>
                    <Button
                      variant="outline"
                      onClick={() => handleAddNew("experience")}
                      className="hover:bg-accent"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Experience Entry
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Form Tab Content */}
          {formTab && (
            <TabsContent value="form" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        {selectedId === null ? `Add New ${formTab === "education" ? "Education" : "Experience"}` : `Edit ${formTab === "education" ? "Education" : "Experience"}`}
                      </CardTitle>
                      <CardDescription>
                        Fill in the details below to {selectedId === null ? "add a new" : "update the"} {formTab === "education" ? "education" : "experience"} entry.
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSelectedId(null)
                        setFormTab(null)
                        setActiveTab(formTab)
                      }}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to {formTab}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {formTab === "education" && (
                    <form onSubmit={handleEducationSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="degree">Degree</Label>
                          <Input
                            id="degree"
                            value={educationForm.degree}
                            onChange={(e) => setEducationForm(prev => ({ ...prev, degree: e.target.value }))}
                            placeholder="e.g., Bachelor of Science"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="institution">Institution</Label>
                          <Input
                            id="institution"
                            value={educationForm.institution}
                            onChange={(e) => setEducationForm(prev => ({ ...prev, institution: e.target.value }))}
                            placeholder="e.g., University of Technology"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="year">Year</Label>
                          <Input
                            id="year"
                            value={educationForm.year}
                            onChange={(e) => setEducationForm(prev => ({ ...prev, year: e.target.value }))}
                            placeholder="e.g., 2020-2024"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="grade">Grade</Label>
                          <Input
                            id="grade"
                            value={educationForm.grade}
                            onChange={(e) => setEducationForm(prev => ({ ...prev, grade: e.target.value }))}
                            placeholder="e.g., First Class Honours"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="eduImage">Institution Logo URL</Label>
                          <Input
                            id="eduImage"
                            value={educationForm.image}
                            onChange={(e) => setEducationForm(prev => ({ ...prev, image: e.target.value }))}
                            placeholder="e.g., https://example.com/logo.png"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="specialization">Specialization</Label>
                          <Input
                            id="specialization"
                            value={educationForm.specialization}
                            onChange={(e) => setEducationForm(prev => ({ ...prev, specialization: e.target.value }))}
                            placeholder="e.g., Computer Science"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="achievements">Achievements</Label>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              value={educationAchievementInput}
                              onChange={(e) => setEducationAchievementInput(e.target.value)}
                              placeholder="Type an achievement (e.g., 🏆 Dean's List, Academic Excellence Award)"
                              className="flex-1"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addEducationAchievement();
                                }
                              }}
                            />
                            <Button 
                              type="button" 
                              onClick={addEducationAchievement}
                              variant="outline"
                            >
                              <PlusCircle className="w-4 h-4 mr-1" />
                              Add
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {Array.isArray(educationForm.achievements) && educationForm.achievements.map((item, index) => (
                              <Badge key={index} variant="secondary" className="px-2 py-1">
                                {item}
                                <button 
                                  type="button"
                                  className="ml-1 text-gray-500 hover:text-red-500"
                                  onClick={() => {
                                    setEducationForm(prev => ({
                                      ...prev,
                                      achievements: prev.achievements.filter((_, i) => i !== index)
                                    }))
                                  }}
                                >
                                  ×
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Type each achievement and click "Add" or press Enter.
                        </p>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setSelectedId(null)
                            setFormTab(null)
                            setActiveTab("education")
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              {selectedId === null ? "Add Education" : "Update Education"}
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  )}

                  {formTab === "experience" && (
                    <form onSubmit={handleExperienceSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Position Title</Label>
                          <Input
                            id="title"
                            value={experienceForm.title}
                            onChange={(e) => setExperienceForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="e.g., Senior Software Engineer"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="company">Company</Label>
                          <Input
                            id="company"
                            value={experienceForm.company}
                            onChange={(e) => setExperienceForm(prev => ({ ...prev, company: e.target.value }))}
                            placeholder="e.g., Tech Corp"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="duration">Duration</Label>
                          <Input
                            id="duration"
                            value={experienceForm.duration}
                            onChange={(e) => setExperienceForm(prev => ({ ...prev, duration: e.target.value }))}
                            placeholder="e.g., Jan 2020 - Present"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="type">Employment Type</Label>
                          <Select
                            value={experienceForm.type}
                            onValueChange={(value) => setExperienceForm(prev => ({ ...prev, type: value }))}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select employment type" />
                            </SelectTrigger>
                            <SelectContent>
                              {EXPERIENCE_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={experienceForm.location}
                            onChange={(e) => setExperienceForm(prev => ({ ...prev, location: e.target.value }))}
                            placeholder="e.g., New York, NY"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="image">Company Logo URL</Label>
                          <Input
                            id="image"
                            value={experienceForm.image}
                            onChange={(e) => setExperienceForm(prev => ({ ...prev, image: e.target.value }))}
                            placeholder="e.g., https://example.com/logo.png"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={experienceForm.description}
                            onChange={(e) => setExperienceForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe your role and responsibilities"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setSelectedId(null)
                            setFormTab(null)
                            setActiveTab("experience")
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              {selectedId === null ? "Add Experience" : "Update Experience"}
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Success Alert */}
      {syncStatus === "success" && (
        <Alert className="fixed bottom-4 right-4 w-auto animate-fade-out">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Changes saved successfully</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && !isSubmitting ? (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-lg">Loading data...</p>
          </div>
        </div>
      ) : null}

      {/* Error State */}
      {error && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-6">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  )
}
