"use client"

import { useEffect, useState, useRef } from "react"
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
import { Loader2, Plus, Save, Trash2, AlertCircle, CheckCircle2, ArrowLeft, PlusCircle, Edit, Settings, Upload, ExternalLink, Calendar, Image } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { Certificate } from "@/lib/profile-store"
import { uploadToImageKit } from '@/lib/imagekit'

// Form interfaces
interface SkillFormData {
  name: string
  category: string
  proficiency: number
  experience: string
  icon: string
  subSkills: string[]
  books: string[]
  achievements: string[]
  tools: string[]
}

interface EducationFormData {
  degree: string
  institution: string
  year: string
  grade: string
  specialization: string
  achievements: string[]
}

interface ExperienceFormData {
  title: string
  company: string
  duration: string
  location: string
  description: string
  type: string
  image: string
}

interface CertificateFormData extends Omit<Certificate, 'id'> {
  id: string
}

// Default form data with empty arrays
const defaultSkillForm: SkillFormData = {
  name: "",
  category: "",
  proficiency: 0,
  experience: "",
  icon: "",
  subSkills: [],
  books: [],
  achievements: [],
  tools: []
}

const defaultEducationForm: EducationFormData = {
  degree: "",
  institution: "",
  year: "",
  grade: "",
  specialization: "",
  achievements: []
}

const defaultExperienceForm: ExperienceFormData = {
  title: "",
  company: "",
  duration: "",
  location: "",
  description: "",
  type: "",
  image: ""
}

const defaultCertificateForm: CertificateFormData = {
  id: "",
  name: "",
  issuer: "",
  date: "",
  expiry: "",
  category: "",
  credentialId: "",
  credentialUrl: "",
  imageUrl: "",
  description: ""
}

// Default categories list
const DEFAULT_CATEGORIES = [
  "Programming Languages",
  "Frameworks",
  "Databases",
  "DevOps",
  "Cloud Services",
  "Tools & Platforms",
  "Soft Skills",
  "Other"
]

const EXPERIENCE_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Freelance",
  "Internship",
  "Volunteer"
]

// Create a function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export default function AdminSkillsPage() {
  // Initialize database connection
  useDatabaseInit()

  // Get store data and actions
  const {
    skills = [],
    education = [],
    experience = [],
    certificates = [],
    syncStatus,
    isLoading,
    error,
    addSkill,
    updateSkill,
    deleteSkill,
    addEducation,
    updateEducation,
    deleteEducation,
    addExperience,
    updateExperience,
    deleteExperience,
    addCertificate,
    updateCertificate,
    deleteCertificate,
    saveToDatabase
  } = useProfileStore()

  // Local state
  const [activeTab, setActiveTab] = useState("skills")
  const [formTab, setFormTab] = useState<"skills" | "education" | "experience" | "certificates" | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  
  // Categories state
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES)
  const [newCategory, setNewCategory] = useState("")
  const [editingCategory, setEditingCategory] = useState<{index: number, value: string} | null>(null)

  // Form data state
  const [skillForm, setSkillForm] = useState<SkillFormData>(defaultSkillForm)
  const [educationForm, setEducationForm] = useState<EducationFormData>(defaultEducationForm)
  const [experienceForm, setExperienceForm] = useState<ExperienceFormData>(defaultExperienceForm)
  const [certificateForm, setCertificateForm] = useState<CertificateFormData>(defaultCertificateForm)

  // Alternative input method for adding items
  const [subSkillInput, setSubSkillInput] = useState("")
  const [bookInput, setBookInput] = useState("")
  const [achievementInput, setAchievementInput] = useState("")
  const [toolInput, setToolInput] = useState("")

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addSubSkill = () => {
    if (!subSkillInput.trim()) return
    setSkillForm(prev => ({ ...prev, subSkills: [...prev.subSkills, subSkillInput.trim()] }))
    setSubSkillInput("")
  }
  const addBook = () => {
    if (!bookInput.trim()) return
    setSkillForm(prev => ({ ...prev, books: [...prev.books, bookInput.trim()] }))
    setBookInput("")
  }
  const addAchievement = () => {
    if (!achievementInput.trim()) return
    setSkillForm(prev => ({ ...prev, achievements: [...prev.achievements, achievementInput.trim()] }))
    setAchievementInput("")
  }
  const addTool = () => {
    if (!toolInput.trim()) return
    setSkillForm(prev => ({ ...prev, tools: [...prev.tools, toolInput.trim()] }))
    setToolInput("")
  }

  // Reset form when selected item changes
  useEffect(() => {
    if (selectedId !== null) {
      switch (formTab) {
        case "skills":
          const skill = skills.find(s => s.id === selectedId)
          if (skill) setSkillForm({
            name: skill.name || "",
            category: skill.category || "",
            proficiency: skill.proficiency || 0,
            experience: skill.experience || "",
            icon: skill.icon || "",
            subSkills: Array.isArray(skill.subSkills) ? skill.subSkills : [],
            books: Array.isArray(skill.books) ? skill.books : [],
            achievements: Array.isArray(skill.achievements) ? skill.achievements : [],
            tools: Array.isArray(skill.tools) ? skill.tools : []
          })
          break
        case "education":
          const edu = education.find(e => e.id === selectedId)
          if (edu) setEducationForm({
            degree: edu.degree || "",
            institution: edu.institution || "",
            year: edu.year || "",
            grade: edu.grade || "",
            specialization: edu.specialization || "",
            achievements: Array.isArray(edu.achievements) ? edu.achievements : []
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
            image: exp.image || ""
          })
          break
      }
    } else {
      setSkillForm(defaultSkillForm)
      setEducationForm(defaultEducationForm)
      setExperienceForm(defaultExperienceForm)
    }
  }, [selectedId, formTab, skills, education, experience])

  // Reset sync status after success
  useEffect(() => {
    if (syncStatus === "success") {
      const timer = setTimeout(() => {
        // Reset sync status to idle after showing success message
        useProfileStore.setState({ syncStatus: "idle" })
      }, 3000) // Hide after 3 seconds
      return () => clearTimeout(timer)
    }
  }, [syncStatus])

  // Handle form submissions with proper loading state
  const handleSkillSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Ensure category is not empty
      const skillData = {
        name: skillForm.name,
        category: skillForm.category.trim() || "Uncategorized",
        proficiency: skillForm.proficiency,
        experience: skillForm.experience,
        icon: skillForm.icon,
        subSkills: skillForm.subSkills,
        books: skillForm.books,
        achievements: skillForm.achievements,
        tools: skillForm.tools
      }
      
      if (selectedId === null) {
        addSkill(skillData)
      } else {
        updateSkill(selectedId, skillData)
      }

      await saveToDatabase()
      toast.success(selectedId === null ? "Skill added successfully" : "Skill updated successfully")
      setSelectedId(null)
      setFormTab(null)
      setActiveTab("skills")
    } catch (error) {
      toast.error("Failed to save skill")
      console.error("Error saving skill:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

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
          achievements: educationForm.achievements
        })
      } else {
        updateEducation(selectedId, {
          degree: educationForm.degree,
          institution: educationForm.institution,
          year: educationForm.year,
          grade: educationForm.grade,
          specialization: educationForm.specialization,
          achievements: educationForm.achievements
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
          image: experienceForm.image
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

  const handleCertificateImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      // Convert file to base64
      const base64Data = await fileToBase64(file);
      
      // Upload to ImageKit
      const imageUrl = await uploadToImageKit(
        base64Data,
        file.name,
        "certificates"
      );
      
      // Update form with new image URL
      setCertificateForm(prev => ({ ...prev, imageUrl }));
      
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCertificateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const certificateData = {
        name: certificateForm.name,
        issuer: certificateForm.issuer,
        date: certificateForm.date,
        expiry: certificateForm.expiry || "",
        category: certificateForm.category.trim() || "Uncategorized",
        credentialId: certificateForm.credentialId,
        credentialUrl: certificateForm.credentialUrl,
        imageUrl: certificateForm.imageUrl,
        description: certificateForm.description
      }
      
      if (selectedId === null) {
        addCertificate(certificateData)
      } else {
        updateCertificate(selectedId, certificateData)
      }

      await saveToDatabase()
      toast.success(selectedId === null ? "Certificate added successfully" : "Certificate updated successfully")
      setSelectedId(null)
      setFormTab(null)
      setActiveTab("certificates")
    } catch (error) {
      toast.error("Failed to save certificate")
      console.error("Error saving certificate:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle deletions with proper loading state
  const handleDelete = async (type: "skills" | "education" | "experience" | "certificates", id: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return

    setIsSubmitting(true)
    try {
      switch (type) {
        case "skills":
          deleteSkill(id)
          break
        case "education":
          deleteEducation(id)
          break
        case "experience":
          deleteExperience(id)
          break
        case "certificates":
          deleteCertificate(id)
          break
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

  // Handle manual save with proper loading state
  const handleManualSave = async () => {
    setIsSubmitting(true)
    try {
      // Save categories to localStorage again to ensure they persist
      saveCategoriesToLocalStorage(categories)
      
      // Save all other data to the database
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
  const handleEdit = (type: "skills" | "education" | "experience" | "certificates", id: string) => {
    setSelectedId(id)
    setFormTab(type)
    setActiveTab("form") // Switch to form tab
    
    // If editing a certificate, populate the form
    if (type === "certificates") {
      const certificate = certificates.find(cert => cert.id === id)
      if (certificate) {
        setCertificateForm({
          id: certificate.id,
          name: certificate.name || "",
          issuer: certificate.issuer || "",
          date: certificate.date || "",
          expiry: certificate.expiry || "",
          category: certificate.category || "",
          credentialId: certificate.credentialId || "",
          credentialUrl: certificate.credentialUrl || "",
          imageUrl: certificate.imageUrl || "",
          description: certificate.description || ""
        })
      }
    }
  }

  // Handle add new button click
  const handleAddNew = (type: "skills" | "education" | "experience" | "certificates") => {
    setSelectedId(null) // Clear any selected item
    setFormTab(type) // Set the form type
    setActiveTab("form") // Switch to form tab
    
    // Reset the appropriate form
    switch (type) {
      case "skills":
        setSkillForm(defaultSkillForm)
        break
      case "education":
        setEducationForm(defaultEducationForm)
        break
      case "experience":
        setExperienceForm(defaultExperienceForm)
        break
      case "certificates":
        setCertificateForm(defaultCertificateForm)
        break
    }
  }

  // Functions to manage categories
  const addCategory = () => {
    if (!newCategory.trim()) return
    if (categories.includes(newCategory.trim())) {
      toast.error("This category already exists")
      return
    }
    setCategories([...categories, newCategory.trim()])
    setNewCategory("")
    toast.success("Category added successfully")
    saveCategoriesToLocalStorage([...categories, newCategory.trim()])
  }
  
  const updateCategory = () => {
    if (!editingCategory) return
    if (!editingCategory.value.trim()) {
      toast.error("Category name cannot be empty")
      return
    }
    if (categories.includes(editingCategory.value.trim()) && categories[editingCategory.index] !== editingCategory.value.trim()) {
      toast.error("This category already exists")
      return
    }
    
    const updatedCategories = [...categories]
    updatedCategories[editingCategory.index] = editingCategory.value.trim()
    setCategories(updatedCategories)
    
    // Update any skills using the old category name
    const oldCategoryName = categories[editingCategory.index]
    skills.forEach(skill => {
      if (skill.category === oldCategoryName) {
        updateSkill(skill.id, { category: editingCategory.value.trim() })
      }
    })
    
    setEditingCategory(null)
    toast.success("Category updated successfully")
    saveCategoriesToLocalStorage(updatedCategories)
  }
  
  const deleteCategory = (index: number) => {
    if (!confirm(`Are you sure you want to delete "${categories[index]}"?`)) return
    
    // Check if any skills are using this category
    const categoryName = categories[index]
    const skillsUsingCategory = skills.filter(skill => skill.category === categoryName)
    
    if (skillsUsingCategory.length > 0) {
      if (!confirm(`This will set ${skillsUsingCategory.length} skill(s) to "Uncategorized". Continue?`)) return
      
      // Update skills to use "Uncategorized"
      skillsUsingCategory.forEach(skill => {
        updateSkill(skill.id, { category: "Uncategorized" })
      })
    }
    
    const updatedCategories = [...categories]
    updatedCategories.splice(index, 1)
    setCategories(updatedCategories)
    toast.success("Category deleted successfully")
    saveCategoriesToLocalStorage(updatedCategories)
  }
  
  // Load categories from localStorage on component mount
  useEffect(() => {
    const savedCategories = localStorage.getItem('skillCategories')
    if (savedCategories) {
      try {
        const parsedCategories = JSON.parse(savedCategories)
        if (Array.isArray(parsedCategories) && parsedCategories.length > 0) {
          setCategories(parsedCategories)
        }
      } catch (e) {
        console.error('Error parsing saved categories:', e)
      }
    }
  }, [])
  
  // Save categories to localStorage
  const saveCategoriesToLocalStorage = (cats: string[]) => {
    localStorage.setItem('skillCategories', JSON.stringify(cats))
  }

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
              <h1 className="text-2xl font-bold">Expertise Management</h1>
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
              value="skills"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
            >
              Skills
              {Array.isArray(skills) && skills.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {skills.length}
                </Badge>
              )}
            </TabsTrigger>
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
            <TabsTrigger
              value="certificates"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
            >
              Certificates
              {Array.isArray(certificates) && certificates.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {certificates.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Skills Tab Content */}
          <TabsContent value="skills" className="space-y-4">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setShowCategoryManager(!showCategoryManager)}
                className="hover:bg-accent"
              >
                <Settings className="w-4 h-4 mr-2" />
                {showCategoryManager ? 'Hide' : 'Manage'} Categories
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleAddNew("skills")}
                className="hover:bg-accent"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Skill
              </Button>
            </div>
            
            {/* Category Manager Section */}
            {showCategoryManager && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Manage Skill Categories</CardTitle>
                  <CardDescription>
                    Add, edit, or remove skill categories. Changes will affect how skills are categorized.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Add new category */}
                    <div className="flex gap-2">
                      <Input
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="New category name"
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCategory();
                          }
                        }}
                      />
                      <Button 
                        onClick={addCategory}
                        disabled={!newCategory.trim()}
                      >
                        <PlusCircle className="w-4 h-4 mr-1" />
                        Add Category
                      </Button>
                    </div>
                    
                    {/* List of categories */}
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Current Categories</h3>
                      {categories.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No categories defined</p>
                      ) : (
                        <div className="space-y-2">
                          {categories.map((category, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-accent/30 rounded-md">
                              {editingCategory && editingCategory.index === index ? (
                                <div className="flex-1 flex gap-2">
                                  <Input
                                    value={editingCategory.value}
                                    onChange={(e) => setEditingCategory({...editingCategory, value: e.target.value})}
                                    className="flex-1"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        updateCategory();
                                      }
                                    }}
                                  />
                                  <Button size="sm" onClick={updateCategory}>Save</Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => setEditingCategory(null)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <span>{category}</span>
                                  <div className="flex gap-1">
                                    <Button 
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setEditingCategory({index, value: category})}
                                    >
                                      <Edit className="w-3 h-3 mr-1" />
                                      Edit
                                    </Button>
                                    <Button 
                                      size="sm"
                                      variant="ghost" 
                                      className="text-destructive"
                                      onClick={() => deleteCategory(index)}
                                    >
                                      <Trash2 className="w-3 h-3 mr-1" />
                                      Delete
                                    </Button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.isArray(skills) && skills.map((skill) => (
                <Card key={skill.id} className="relative">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {skill.icon && <span className="text-xl">{skill.icon}</span>}
                          {skill.name || "Unnamed Skill"}
                        </CardTitle>
                        <CardDescription>{skill.category || "Uncategorized"}</CardDescription>
                      </div>
                      <Badge variant="secondary">
                        {skill.proficiency || 0}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      Experience: {skill.experience || "Not specified"}
                    </p>
                    {Array.isArray(skill.subSkills) && skill.subSkills.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Sub-skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {skill.subSkills.map((subSkill, index) => (
                            <Badge key={index} variant="outline">
                              {subSkill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit("skills", skill.id)}
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
                        onClick={() => handleDelete("skills", skill.id)}
                        className="hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!Array.isArray(skills) || skills.length === 0) && (
                <Card className="col-span-full">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-lg text-muted-foreground mb-4">No skills added yet</p>
                    <Button
                      variant="outline"
                      onClick={() => handleAddNew("skills")}
                      className="hover:bg-accent"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Skill
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Education Tab Content */}
          <TabsContent value="education" className="space-y-4">
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => handleAddNew("education")}
                className="hover:bg-accent"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Education
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.isArray(education) && education.map((edu) => (
                <Card key={edu.id} className="relative">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>
                          {edu.degree || "Unnamed Degree"}
                        </CardTitle>
                        <CardDescription>{edu.institution || "Institution not specified"}</CardDescription>
                      </div>
                      <Badge variant="secondary">
                        {edu.year || "Year not specified"}
                      </Badge>
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
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => handleAddNew("experience")}
                className="hover:bg-accent"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Experience
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.isArray(experience) && experience.map((exp) => (
                <Card key={exp.id} className="relative">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>
                          {exp.title || "Unnamed Position"}
                        </CardTitle>
                        <CardDescription>{exp.company || "Company not specified"}</CardDescription>
                      </div>
                      <Badge variant="secondary">
                        {exp.duration || "Duration not specified"}
                      </Badge>
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

          {/* Certificates Tab Content */}
          <TabsContent value="certificates" className="space-y-4">
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => handleAddNew("certificates")}
                className="hover:bg-accent"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Certificate
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.isArray(certificates) && certificates.map((cert) => (
                <Card key={cert.id} className="relative">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {cert.name || "Unnamed Certificate"}
                        </CardTitle>
                        <CardDescription>{cert.issuer || "Issuer not specified"}</CardDescription>
                      </div>
                      <Badge variant="secondary">
                        {cert.date || "Date not specified"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {cert.category && (
                        <Badge variant="outline" className="mb-2">
                          {cert.category}
                        </Badge>
                      )}
                      {cert.imageUrl && (
                        <div className="mb-2 overflow-hidden rounded-md border">
                          <img 
                            src={cert.imageUrl} 
                            alt={cert.name} 
                            className="w-full h-32 object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://placehold.co/400x200?text=Certificate+Image';
                            }}
                          />
                        </div>
                      )}
                      {cert.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {cert.description}
                        </p>
                      )}
                      {cert.credentialUrl && (
                        <div className="flex items-center mt-2">
                          <ExternalLink className="w-3 h-3 mr-1 text-muted-foreground" />
                          <a 
                            href={cert.credentialUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            View Credential
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit("certificates", cert.id)}
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
                        onClick={() => handleDelete("certificates", cert.id)}
                        className="hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!Array.isArray(certificates) || certificates.length === 0) && (
                <Card className="col-span-full">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-lg text-muted-foreground mb-4">No certificates added yet</p>
                    <Button
                      variant="outline"
                      onClick={() => handleAddNew("certificates")}
                      className="hover:bg-accent"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Certificate
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
                        {selectedId === null ? `Add New ${formTab.slice(0, -1)}` : `Edit ${formTab.slice(0, -1)}`}
                      </CardTitle>
                      <CardDescription>
                        Fill in the details below to {selectedId === null ? "add a new" : "update the"} {formTab.slice(0, -1)}.
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSelectedId(null)
                        setFormTab(null)
                        setActiveTab(formTab) // Return to the previous tab
                      }}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to {formTab}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {formTab === "skills" && (
                    <form onSubmit={handleSkillSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Skill Name</Label>
                          <Input
                            id="name"
                            value={skillForm.name}
                            onChange={(e) => setSkillForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., React, Python, AWS"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select
                            value={skillForm.category}
                            onValueChange={(value) => setSkillForm(prev => ({ ...prev, category: value }))}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                              <SelectItem value="Uncategorized">Uncategorized</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="proficiency">Proficiency (0-100)</Label>
                          <Input
                            id="proficiency"
                            type="number"
                            min="0"
                            max="100"
                            value={skillForm.proficiency}
                            onChange={(e) => setSkillForm(prev => ({ ...prev, proficiency: parseInt(e.target.value) }))}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="experience">Years of Experience</Label>
                          <Input
                            id="experience"
                            value={skillForm.experience}
                            onChange={(e) => setSkillForm(prev => ({ ...prev, experience: e.target.value }))}
                            placeholder="e.g., 5+ years"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="icon">Icon (emoji)</Label>
                          <Input
                            id="icon"
                            value={skillForm.icon}
                            onChange={(e) => setSkillForm(prev => ({ ...prev, icon: e.target.value }))}
                            placeholder="e.g., ⚛️, 🐍, ☁️"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subSkills">Sub-skills</Label>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              value={subSkillInput}
                              onChange={(e) => setSubSkillInput(e.target.value)}
                              placeholder="Type a sub-skill"
                              className="flex-1"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addSubSkill();
                                }
                              }}
                            />
                            <Button 
                              type="button" 
                              onClick={addSubSkill}
                              variant="outline"
                            >
                              <PlusCircle className="w-4 h-4 mr-1" />
                              Add
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {Array.isArray(skillForm.subSkills) && skillForm.subSkills.map((item, index) => (
                              <Badge key={index} variant="secondary" className="px-2 py-1">
                                {item}
                                <button 
                                  type="button"
                                  className="ml-1 text-gray-500 hover:text-red-500"
                                  onClick={() => {
                                    setSkillForm(prev => ({
                                      ...prev,
                                      subSkills: prev.subSkills.filter((_, i) => i !== index)
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
                          Type each sub-skill and click "Add" or press Enter
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="books">Related Books</Label>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              value={bookInput}
                              onChange={(e) => setBookInput(e.target.value)}
                              placeholder="Type a book title"
                              className="flex-1"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addBook();
                                }
                              }}
                            />
                            <Button 
                              type="button" 
                              onClick={addBook}
                              variant="outline"
                            >
                              <PlusCircle className="w-4 h-4 mr-1" />
                              Add
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {Array.isArray(skillForm.books) && skillForm.books.map((item, index) => (
                              <Badge key={index} variant="secondary" className="px-2 py-1">
                                {item}
                                <button 
                                  type="button"
                                  className="ml-1 text-gray-500 hover:text-red-500"
                                  onClick={() => {
                                    setSkillForm(prev => ({
                                      ...prev,
                                      books: prev.books.filter((_, i) => i !== index)
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
                          Type each book title and click "Add" or press Enter
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="achievements">Achievements</Label>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              value={achievementInput}
                              onChange={(e) => setAchievementInput(e.target.value)}
                              placeholder="Type an achievement"
                              className="flex-1"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addAchievement();
                                }
                              }}
                            />
                            <Button 
                              type="button" 
                              onClick={addAchievement}
                              variant="outline"
                            >
                              <PlusCircle className="w-4 h-4 mr-1" />
                              Add
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {Array.isArray(skillForm.achievements) && skillForm.achievements.map((item, index) => (
                              <Badge key={index} variant="secondary" className="px-2 py-1">
                                {item}
                                <button 
                                  type="button"
                                  className="ml-1 text-gray-500 hover:text-red-500"
                                  onClick={() => {
                                    setSkillForm(prev => ({
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
                          Type each achievement and click "Add" or press Enter
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tools">Related Tools</Label>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              value={toolInput}
                              onChange={(e) => setToolInput(e.target.value)}
                              placeholder="Type a tool name"
                              className="flex-1"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addTool();
                                }
                              }}
                            />
                            <Button 
                              type="button" 
                              onClick={addTool}
                              variant="outline"
                            >
                              <PlusCircle className="w-4 h-4 mr-1" />
                              Add
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {Array.isArray(skillForm.tools) && skillForm.tools.map((item, index) => (
                              <Badge key={index} variant="secondary" className="px-2 py-1">
                                {item}
                                <button 
                                  type="button"
                                  className="ml-1 text-gray-500 hover:text-red-500"
                                  onClick={() => {
                                    setSkillForm(prev => ({
                                      ...prev,
                                      tools: prev.tools.filter((_, i) => i !== index)
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
                          Type each tool name and click "Add" or press Enter
                        </p>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setSelectedId(null)
                            setFormTab(null)
                            setActiveTab("skills")
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
                              {selectedId === null ? "Add Skill" : "Update Skill"}
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  )}

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
                        <Label htmlFor="achievements">
                          Achievements
                          <span className="text-sm text-muted-foreground ml-2">
                            (Enter each achievement on a new line or separate with commas)
                          </span>
                        </Label>
                        <Textarea
                          id="achievements"
                          value={Array.isArray(educationForm.achievements) ? educationForm.achievements.join("\n") : ""}
                          onChange={(e) => {
                            console.log("Raw education input:", e.target.value);
                            // Direct assignment with simple splitting
                            const inputValue = e.target.value;
                            // Try to split by newlines first, then commas if no newlines
                            const items = inputValue.includes('\n')
                              ? inputValue.split('\n').map(item => item.trim()).filter(Boolean)
                              : inputValue.includes(',')
                                ? inputValue.split(',').map(item => item.trim()).filter(Boolean)
                                : [inputValue].filter(Boolean);
                            setEducationForm(prev => ({ ...prev, achievements: items }))
                          }}
                          placeholder="Enter achievements (e.g., 🏆 Dean's List, Academic Excellence Award, Research Grant)"
                          className="min-h-[100px] resize-y text-input-unrestricted"
                        />
                        <p className="text-sm text-muted-foreground">
                          Tip: You can use emojis, symbols, and any special characters in your achievements.
                          If you can't type commas or newlines, just type one achievement and save it first.
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
                            required
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

                  {formTab === "certificates" && (
                    <form onSubmit={handleCertificateSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Certificate Name</Label>
                          <Input
                            id="name"
                            value={certificateForm.name}
                            onChange={(e) => setCertificateForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., AWS Certified Solutions Architect"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="issuer">Issuing Organization</Label>
                          <Input
                            id="issuer"
                            value={certificateForm.issuer}
                            onChange={(e) => setCertificateForm(prev => ({ ...prev, issuer: e.target.value }))}
                            placeholder="e.g., Amazon Web Services"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="date">Issue Date</Label>
                          <Input
                            id="date"
                            type="date"
                            value={certificateForm.date}
                            onChange={(e) => setCertificateForm(prev => ({ ...prev, date: e.target.value }))}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="expiry">Expiry Date (Optional)</Label>
                          <Input
                            id="expiry"
                            type="date"
                            value={certificateForm.expiry}
                            onChange={(e) => setCertificateForm(prev => ({ ...prev, expiry: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select
                            value={certificateForm.category}
                            onValueChange={(value) => setCertificateForm(prev => ({ ...prev, category: value }))}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                              <SelectItem value="Uncategorized">Uncategorized</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="credentialId">Credential ID (Optional)</Label>
                          <Input
                            id="credentialId"
                            value={certificateForm.credentialId}
                            onChange={(e) => setCertificateForm(prev => ({ ...prev, credentialId: e.target.value }))}
                            placeholder="e.g., ABC123XYZ"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="credentialUrl">Credential URL (Optional)</Label>
                          <Input
                            id="credentialUrl"
                            type="url"
                            value={certificateForm.credentialUrl}
                            onChange={(e) => setCertificateForm(prev => ({ ...prev, credentialUrl: e.target.value }))}
                            placeholder="e.g., https://www.credly.com/badges/..."
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="imageUrl">Certificate Image</Label>
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm text-muted-foreground mb-2 block">Option 1: Upload Image</Label>
                              <div className="flex items-center gap-3">
                                <Input
                                  ref={fileInputRef}
                                  type="file"
                                  accept="image/*"
                                  onChange={handleCertificateImageUpload}
                                  className="hidden"
                                  id="certificateFileInput"
                                />
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  className="w-full flex items-center justify-center gap-2"
                                  onClick={() => fileInputRef.current?.click()}
                                  disabled={isUploading}
                                >
                                  {isUploading ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      <span>Uploading...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="h-4 w-4" />
                                      <span>Choose Image</span>
                                    </>
                                  )}
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Upload an image from your device. It will be stored securely on ImageKit.
                              </p>
                            </div>

                            <div>
                              <Label className="text-sm text-muted-foreground mb-2 block">Option 2: Image URL</Label>
                              <Input
                                id="imageUrl"
                                type="url"
                                value={certificateForm.imageUrl}
                                onChange={(e) => setCertificateForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                                placeholder="e.g., https://example.com/certificate.jpg"
                                required
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Enter a direct URL to your certificate image.
                              </p>
                            </div>

                            {certificateForm.imageUrl && (
                              <div className="mt-2 border rounded-md p-2">
                                <p className="text-xs font-medium mb-2">Preview:</p>
                                <div className="relative aspect-[4/3] w-full max-w-[200px] mx-auto overflow-hidden rounded border bg-slate-50">
                                  <img 
                                    src={certificateForm.imageUrl} 
                                    alt="Certificate preview" 
                                    className="object-contain w-full h-full"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=Image+Error';
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="description">Description (Optional)</Label>
                          <Textarea
                            id="description"
                            value={certificateForm.description}
                            onChange={(e) => setCertificateForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Briefly describe what this certificate represents"
                            className="min-h-[100px]"
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
                            setActiveTab("certificates")
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
                              {selectedId === null ? "Add Certificate" : "Update Certificate"}
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

      {/* Success Alert - Only show when syncStatus is "success" and fade out */}
      {syncStatus === "success" && (
        <Alert className="fixed bottom-4 right-4 w-auto animate-fade-out">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Changes saved successfully</AlertDescription>
        </Alert>
      )}

      {/* Loading State - Only show during initial load */}
      {isLoading && !isSubmitting ? (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-lg">Loading expertise data...</p>
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

// Update the CSS animation for the success message
const styles = `
@keyframes fadeOut {
  0% { 
    opacity: 1;
    transform: translateY(0);
  }
  100% { 
    opacity: 0;
    transform: translateY(10px);
  }
}

.animate-fade-out {
  animation: fadeOut 0.5s ease-out 2.5s forwards;
  pointer-events: none;
}
` 