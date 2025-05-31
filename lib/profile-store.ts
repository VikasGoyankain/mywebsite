"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { toast } from "@/hooks/use-toast"

export interface ProfileData {
  name: string
  title: string
  bio: string
  profileImage: string
  specializations: string[]
  contact: {
    email: string
    phone: string
    location: string
    availability: string
  }
  socialLinks: Array<{
    id: number
    name: string
    icon: string
    href: string
    color: string
  }>
  badges: Array<{
    id: number
    text: string
    icon: string
    color: string
  }>
}

export interface Experience {
  id: number
  title: string
  company: string
  duration: string
  location: string
  description: string
  type: string
  image: string
}

export interface Education {
  id: number
  degree: string
  institution: string
  year: string
  grade: string
  specialization: string
  achievements: string[]
}

export interface Skill {
  id: number
  name: string
  level: number
  category: string
}

export interface Post {
  id: number
  title: string
  date: string
  category: string
  section: "recent-work" | "articles" | "achievements"
  image: string
  description: string
}

export interface NavigationPage {
  id: number
  title: string
  description: string
  icon: string
  href: string
  color: string
}

interface ProfileStore {
  profileData: ProfileData
  experience: Experience[]
  education: Education[]
  skills: Skill[]
  posts: Post[]
  navigationPages: NavigationPage[]

  // Database sync properties
  isLoading: boolean
  isSaving: boolean
  lastSaved: string | null
  syncStatus: "idle" | "syncing" | "success" | "error"

  // Profile actions
  updateProfileData: (data: Partial<ProfileData>) => void
  updateContact: (contact: Partial<ProfileData["contact"]>) => void
  addSocialLink: (link: Omit<ProfileData["socialLinks"][0], "id">) => void
  updateSocialLink: (id: number, link: Partial<ProfileData["socialLinks"][0]>) => void
  deleteSocialLink: (id: number) => void
  addBadge: (badge: Omit<ProfileData["badges"][0], "id">) => void
  updateBadge: (id: number, badge: Partial<ProfileData["badges"][0]>) => void
  deleteBadge: (id: number) => void

  // Experience actions
  addExperience: (exp: Omit<Experience, "id">) => void
  updateExperience: (id: number, exp: Partial<Experience>) => void
  deleteExperience: (id: number) => void

  // Education actions
  addEducation: (edu: Omit<Education, "id">) => void
  updateEducation: (id: number, edu: Partial<Education>) => void
  deleteEducation: (id: number) => void

  // Skills actions
  addSkill: (skill: Omit<Skill, "id">) => void
  updateSkill: (id: number, skill: Partial<Skill>) => void
  deleteSkill: (id: number) => void

  // Posts actions
  addPost: (post: Omit<Post, "id">) => void
  updatePost: (id: number, post: Partial<Post>) => void
  deletePost: (id: number) => void
  getPostsBySection: (section: string) => Post[]

  // Navigation actions
  addNavigationPage: (page: Omit<NavigationPage, "id">) => void
  updateNavigationPage: (id: number, page: Partial<NavigationPage>) => void
  deleteNavigationPage: (id: number) => void

  // Utility actions
  resetToDefaults: () => void
  exportData: () => string
  importData: (data: string) => void

  // Database actions
  loadFromDatabase: () => Promise<void>
  saveToDatabase: () => Promise<void>
  createBackup: (backupName: string) => Promise<void>
  autoSave: () => void
}

const defaultProfileData: ProfileData = {
  name: "Vikas Goyanka",
  title: "Law Student & Political Activist",
  bio: "Passionate advocate for constitutional rights and social justice. Currently pursuing LLB while actively engaging in policy research and grassroots political work. Dedicated to bridging the gap between legal theory and practical governance to create meaningful change in Indian society.",
  profileImage: "/placeholder.svg?height=192&width=192",
  specializations: [
    "🏛️ Specializing in Constitutional Law & Human Rights",
    "📊 Policy Research & Analysis",
    "🗳️ Youth Political Engagement",
    "⚖️ Legal Aid & Community Service",
  ],
  contact: {
    email: "contact@vikasgoyanka.in",
    phone: "+917597441305",
    location: "New Delhi, India",
    availability: "Available for consultations",
  },
  socialLinks: [
    {
      id: 1,
      name: "Instagram",
      icon: "Instagram",
      href: "https://www.instagram.com/vikasgoyanka.in/",
      color: "text-pink-600",
    },
    {
      id: 2,
      name: "LinkedIn",
      icon: "Linkedin",
      href: "https://in.linkedin.com/in/vikas-goyanka-1a483a342",
      color: "text-blue-700",
    },
    {
      id: 3,
      name: "Telegram",
      icon: "Send",
      href: "https://t.me/Vikasgoyanka_in",
      color: "text-blue-500",
    },
    {
      id: 4,
      name: "X (Twitter)",
      icon: "Twitter",
      href: "https://x.com/vikasgoyanka_in",
      color: "text-gray-900",
    },
  ],
  badges: [
    { id: 1, text: "Law Student", icon: "GraduationCap", color: "bg-blue-100 text-blue-800" },
    { id: 2, text: "Legal Researcher", icon: "Gavel", color: "bg-purple-100 text-purple-800" },
    { id: 3, text: "Political Activist", icon: "Users", color: "bg-green-100 text-green-800" },
    { id: 4, text: "Social Worker", icon: "Heart", color: "bg-orange-100 text-orange-800" },
  ],
}

const defaultExperience: Experience[] = [
  {
    id: 1,
    title: "Legal Research Intern",
    company: "Supreme Court of India",
    duration: "Jan 2024 - Present",
    location: "New Delhi",
    description:
      "Conducting research on constitutional law cases, drafting legal briefs, and assisting senior advocates in landmark cases.",
    type: "Internship",
    image: "/placeholder.svg?height=48&width=48",
  },
  {
    id: 2,
    title: "Youth Wing Secretary",
    company: "Indian National Congress",
    duration: "Mar 2023 - Present",
    location: "Delhi Pradesh",
    description:
      "Leading youth engagement initiatives, organizing policy discussions, and coordinating grassroots campaigns.",
    type: "Leadership",
    image: "/placeholder.svg?height=48&width=48",
  },
  {
    id: 3,
    title: "Legal Aid Coordinator",
    company: "Delhi Legal Services Authority",
    duration: "Jun 2022 - Dec 2023",
    location: "New Delhi",
    description: "Coordinated free legal aid camps, provided legal literacy programs, and assisted in pro bono cases.",
    type: "Volunteer",
    image: "/placeholder.svg?height=48&width=48",
  },
]

const defaultEducation: Education[] = [
  {
    id: 1,
    degree: "Bachelor of Laws (LLB)",
    institution: "National Law University Delhi",
    year: "2021 - 2024",
    grade: "CGPA: 8.7/10",
    specialization: "Constitutional Law & Human Rights",
    achievements: ["Dean's List 2023", "Best Moot Court Performance", "Research Excellence Award"],
  },
  {
    id: 2,
    degree: "Bachelor of Arts (Political Science)",
    institution: "University of Delhi",
    year: "2018 - 2021",
    grade: "First Class (78%)",
    specialization: "Public Policy & Governance",
    achievements: ["Gold Medalist", "Student Union President", "Debate Society Captain"],
  },
]

const defaultSkills: Skill[] = [
  { id: 1, name: "Constitutional Law", level: 95, category: "Legal" },
  { id: 2, name: "Criminal Law", level: 88, category: "Legal" },
  { id: 3, name: "Public Policy Analysis", level: 92, category: "Policy" },
  { id: 4, name: "Legal Research", level: 96, category: "Research" },
  { id: 5, name: "Public Speaking", level: 94, category: "Communication" },
  { id: 6, name: "Campaign Management", level: 85, category: "Political" },
  { id: 7, name: "Community Organizing", level: 90, category: "Social" },
  { id: 8, name: "Legal Writing", level: 93, category: "Communication" },
]

const defaultPosts: Post[] = [
  {
    id: 1,
    title: "Legal Aid Camp Success",
    date: "2 days ago",
    category: "Social Work",
    section: "recent-work",
    image: "/placeholder.svg?height=400&width=400",
    description: "Successfully organized a legal aid camp helping 200+ families",
  },
  {
    id: 2,
    title: "Constitutional Rights in Digital Age",
    date: "1 week ago",
    category: "Legal Research",
    section: "articles",
    image: "/placeholder.svg?height=400&width=400",
    description: "Published research paper on digital privacy rights",
  },
  {
    id: 3,
    title: "Best Moot Court Performance Award",
    date: "2 weeks ago",
    category: "Academic",
    section: "achievements",
    image: "/placeholder.svg?height=400&width=400",
    description: "Won first place in National Moot Court Competition",
  },
  {
    id: 4,
    title: "Youth Leadership Summit",
    date: "3 weeks ago",
    category: "Politics",
    section: "recent-work",
    image: "/placeholder.svg?height=400&width=400",
    description: "Led youth engagement session at national summit",
  },
  {
    id: 5,
    title: "Policy Analysis: Education Reform",
    date: "1 month ago",
    category: "Policy Research",
    section: "articles",
    image: "/placeholder.svg?height=400&width=400",
    description: "Comprehensive analysis of proposed education reforms",
  },
  {
    id: 6,
    title: "Dean's List Recognition",
    date: "2 months ago",
    category: "Academic",
    section: "achievements",
    image: "/placeholder.svg?height=400&width=400",
    description: "Achieved Dean's List for academic excellence",
  },
]

const defaultNavigationPages: NavigationPage[] = [
  {
    id: 1,
    title: "Research Studies",
    description: "Constitutional Law & Policy Research",
    icon: "FileText",
    href: "/research",
    color: "bg-blue-500",
  },
  {
    id: 2,
    title: "Contact Me",
    description: "Get in touch for consultations",
    icon: "MessageSquare",
    href: "/contact",
    color: "bg-green-500",
  },
  {
    id: 3,
    title: "Speaking Events",
    description: "Book me for conferences",
    icon: "Users",
    href: "/speaking",
    color: "bg-orange-500",
  },
  {
    id: 4,
    title: "Legal Aid",
    description: "Free consultation program",
    icon: "Gavel",
    href: "/legal-aid",
    color: "bg-red-500",
  },
]

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      profileData: defaultProfileData,
      experience: defaultExperience,
      education: defaultEducation,
      skills: defaultSkills,
      posts: defaultPosts,
      navigationPages: defaultNavigationPages,

      // Database sync state
      isLoading: false,
      isSaving: false,
      lastSaved: null,
      syncStatus: "idle",

      // Profile actions
      updateProfileData: (data) => {
        set((state) => ({
          profileData: { ...state.profileData, ...data },
        }))
        get().autoSave()
      },

      updateContact: (contact) => {
        set((state) => ({
          profileData: {
            ...state.profileData,
            contact: { ...state.profileData.contact, ...contact },
          },
        }))
        get().autoSave()
      },

      addSocialLink: (link) => {
        set((state) => {
          const newId = Math.max(...state.profileData.socialLinks.map((s) => s.id), 0) + 1
          return {
            profileData: {
              ...state.profileData,
              socialLinks: [...state.profileData.socialLinks, { ...link, id: newId }],
            },
          }
        })
        get().autoSave()
      },

      updateSocialLink: (id, link) => {
        set((state) => ({
          profileData: {
            ...state.profileData,
            socialLinks: state.profileData.socialLinks.map((s) => (s.id === id ? { ...s, ...link } : s)),
          },
        }))
        get().autoSave()
      },

      deleteSocialLink: (id) => {
        set((state) => ({
          profileData: {
            ...state.profileData,
            socialLinks: state.profileData.socialLinks.filter((s) => s.id !== id),
          },
        }))
        get().autoSave()
      },

      addBadge: (badge) => {
        set((state) => {
          const newId = Math.max(...state.profileData.badges.map((b) => b.id), 0) + 1
          return {
            profileData: {
              ...state.profileData,
              badges: [...state.profileData.badges, { ...badge, id: newId }],
            },
          }
        })
        get().autoSave()
      },

      updateBadge: (id, badge) => {
        set((state) => ({
          profileData: {
            ...state.profileData,
            badges: state.profileData.badges.map((b) => (b.id === id ? { ...b, ...badge } : b)),
          },
        }))
        get().autoSave()
      },

      deleteBadge: (id) => {
        set((state) => ({
          profileData: {
            ...state.profileData,
            badges: state.profileData.badges.filter((b) => b.id !== id),
          },
        }))
        get().autoSave()
      },

      // Experience actions
      addExperience: (exp) => {
        set((state) => {
          const newId = Math.max(...state.experience.map((e) => e.id), 0) + 1
          return {
            experience: [...state.experience, { ...exp, id: newId }],
          }
        })
        get().autoSave()
      },

      updateExperience: (id, exp) => {
        set((state) => ({
          experience: state.experience.map((e) => (e.id === id ? { ...e, ...exp } : e)),
        }))
        get().autoSave()
      },

      deleteExperience: (id) => {
        set((state) => ({
          experience: state.experience.filter((e) => e.id !== id),
        }))
        get().autoSave()
      },

      // Education actions
      addEducation: (edu) => {
        set((state) => {
          const newId = Math.max(...state.education.map((e) => e.id), 0) + 1
          return {
            education: [...state.education, { ...edu, id: newId }],
          }
        })
        get().autoSave()
      },

      updateEducation: (id, edu) => {
        set((state) => ({
          education: state.education.map((e) => (e.id === id ? { ...e, ...edu } : e)),
        }))
        get().autoSave()
      },

      deleteEducation: (id) => {
        set((state) => ({
          education: state.education.filter((e) => e.id !== id),
        }))
        get().autoSave()
      },

      // Skills actions
      addSkill: (skill) => {
        set((state) => {
          const newId = Math.max(...state.skills.map((s) => s.id), 0) + 1
          return {
            skills: [...state.skills, { ...skill, id: newId }],
          }
        })
        get().autoSave()
      },

      updateSkill: (id, skill) => {
        set((state) => ({
          skills: state.skills.map((s) => (s.id === id ? { ...s, ...skill } : s)),
        }))
        get().autoSave()
      },

      deleteSkill: (id) => {
        set((state) => ({
          skills: state.skills.filter((s) => s.id !== id),
        }))
        get().autoSave()
      },

      // Posts actions
      addPost: (post) => {
        set((state) => {
          const newId = Math.max(...state.posts.map((p) => p.id), 0) + 1
          return {
            posts: [...state.posts, { ...post, id: newId }],
          }
        })
        get().autoSave()
      },

      updatePost: (id, post) => {
        set((state) => ({
          posts: state.posts.map((p) => (p.id === id ? { ...p, ...post } : p)),
        }))
        get().autoSave()
      },

      deletePost: (id) => {
        set((state) => ({
          posts: state.posts.filter((p) => p.id !== id),
        }))
        get().autoSave()
      },

      getPostsBySection: (section) => {
        const state = get()
        if (section === "all") return state.posts
        return state.posts.filter((post) => post.section === section)
      },

      // Navigation actions
      addNavigationPage: (page) => {
        set((state) => {
          const newId = Math.max(...state.navigationPages.map((p) => p.id), 0) + 1
          return {
            navigationPages: [...state.navigationPages, { ...page, id: newId }],
          }
        })
        get().autoSave()
      },

      updateNavigationPage: (id, page) => {
        set((state) => ({
          navigationPages: state.navigationPages.map((p) => (p.id === id ? { ...p, ...page } : p)),
        }))
        get().autoSave()
      },

      deleteNavigationPage: (id) => {
        set((state) => ({
          navigationPages: state.navigationPages.filter((p) => p.id !== id),
        }))
        get().autoSave()
      },

      // Utility actions
      resetToDefaults: () =>
        set({
          profileData: defaultProfileData,
          experience: defaultExperience,
          education: defaultEducation,
          skills: defaultSkills,
          posts: defaultPosts,
          navigationPages: defaultNavigationPages,
        }),

      exportData: () => {
        const state = get()
        return JSON.stringify({
          profileData: state.profileData,
          experience: state.experience,
          education: state.education,
          skills: state.skills,
          posts: state.posts,
          navigationPages: state.navigationPages,
        })
      },

      importData: (data) => {
        try {
          const parsed = JSON.parse(data)
          set({
            profileData: parsed.profileData || defaultProfileData,
            experience: parsed.experience || defaultExperience,
            education: parsed.education || defaultEducation,
            skills: parsed.skills || defaultSkills,
            posts: parsed.posts || defaultPosts,
            navigationPages: parsed.navigationPages || defaultNavigationPages,
          })
        } catch (error) {
          console.error("Failed to import data:", error)
        }
      },

      // Database actions
      loadFromDatabase: async () => {
        set({ isLoading: true, syncStatus: "syncing" })

        try {
          const response = await fetch("/api/profile")
          const result = await response.json()

          if (result.success && result.data) {
            const { profileData, experience, education, skills, posts, navigationPages } = result.data

            set({
              profileData: profileData || defaultProfileData,
              experience: experience || defaultExperience,
              education: education || defaultEducation,
              skills: skills || defaultSkills,
              posts: posts || defaultPosts,
              navigationPages: navigationPages || defaultNavigationPages,
              isLoading: false,
              syncStatus: "success",
              lastSaved: result.data.lastUpdated,
            })

            toast({
              title: "Data Loaded",
              description: "Profile data loaded from database successfully!",
            })
          } else {
            // No data found, use defaults
            set({
              isLoading: false,
              syncStatus: "idle",
            })
          }
        } catch (error) {
          console.error("Failed to load from database:", error)
          set({
            isLoading: false,
            syncStatus: "error",
          })

          toast({
            title: "Load Failed",
            description: "Failed to load data from database. Using local data.",
            variant: "destructive",
          })
        }
      },

      saveToDatabase: async () => {
        const state = get()
        set({ isSaving: true, syncStatus: "syncing" })

        try {
          const dataToSave = {
            profileData: state.profileData,
            experience: state.experience,
            education: state.education,
            skills: state.skills,
            posts: state.posts,
            navigationPages: state.navigationPages,
          }

          const response = await fetch("/api/profile", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(dataToSave),
          })

          const result = await response.json()

          if (result.success) {
            set({
              isSaving: false,
              syncStatus: "success",
              lastSaved: new Date().toISOString(),
            })

            toast({
              title: "Data Saved",
              description: "Profile data saved to database successfully!",
            })
          } else {
            throw new Error(result.error)
          }
        } catch (error) {
          console.error("Failed to save to database:", error)
          set({
            isSaving: false,
            syncStatus: "error",
          })

          toast({
            title: "Save Failed",
            description: "Failed to save data to database.",
            variant: "destructive",
          })
        }
      },

      createBackup: async (backupName: string) => {
        try {
          const response = await fetch("/api/profile/backup", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ backupName }),
          })

          const result = await response.json()

          if (result.success) {
            toast({
              title: "Backup Created",
              description: `Backup "${backupName}" created successfully!`,
            })
          } else {
            throw new Error(result.error)
          }
        } catch (error) {
          console.error("Failed to create backup:", error)
          toast({
            title: "Backup Failed",
            description: "Failed to create backup.",
            variant: "destructive",
          })
        }
      },

      autoSave: () => {
        const state = get()
        // Auto-save after any data change
        setTimeout(() => {
          state.saveToDatabase()
        }, 1000) // Debounce auto-save by 1 second
      },
    }),
    {
      name: "profile-storage",
      version: 2, // Increment version for migration
    },
  ),
)
