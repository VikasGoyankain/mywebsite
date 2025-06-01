"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

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
  category: string
  proficiency: number
  experience: string
  icon: string
  subSkills: string[]
  books: string[]
  achievements: string[]
  tools: string[]
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
  hasUnsavedChanges: boolean

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
  markAsChanged: () => void
}

const defaultProfileData: ProfileData = {
  name: "",
  title: "",
  bio: "",
  profileImage: "",
  specializations: [],
  contact: {
    email: "",
    phone: "",
    location: "",
    availability: "",
  },
  socialLinks: [],
  badges: [],
}

const defaultExperience: Experience[] = []
const defaultEducation: Education[] = []
const defaultSkills: Skill[] = []
const defaultPosts: Post[] = []
const defaultNavigationPages: NavigationPage[] = []

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
      hasUnsavedChanges: false,

      // Profile actions
      updateProfileData: (data) => {
        set((state) => ({
          profileData: { ...state.profileData, ...data },
          hasUnsavedChanges: true,
        }))
      },

      updateContact: (contact) => {
        set((state) => ({
          profileData: {
            ...state.profileData,
            contact: { ...state.profileData.contact, ...contact },
          },
          hasUnsavedChanges: true,
        }))
      },

      addSocialLink: (link) => {
        set((state) => {
          const newId = Math.max(...state.profileData.socialLinks.map((s) => s.id), 0) + 1
          return {
            profileData: {
              ...state.profileData,
              socialLinks: [...state.profileData.socialLinks, { ...link, id: newId }],
            },
            hasUnsavedChanges: true,
          }
        })
      },

      updateSocialLink: (id, link) => {
        set((state) => ({
          profileData: {
            ...state.profileData,
            socialLinks: state.profileData.socialLinks.map((s) => (s.id === id ? { ...s, ...link } : s)),
          },
          hasUnsavedChanges: true,
        }))
      },

      deleteSocialLink: (id) => {
        set((state) => ({
          profileData: {
            ...state.profileData,
            socialLinks: state.profileData.socialLinks.filter((s) => s.id !== id),
          },
          hasUnsavedChanges: true,
        }))
      },

      addBadge: (badge) => {
        set((state) => {
          const newId = Math.max(...state.profileData.badges.map((b) => b.id), 0) + 1
          return {
            profileData: {
              ...state.profileData,
              badges: [...state.profileData.badges, { ...badge, id: newId }],
            },
            hasUnsavedChanges: true,
          }
        })
      },

      updateBadge: (id, badge) => {
        set((state) => ({
          profileData: {
            ...state.profileData,
            badges: state.profileData.badges.map((b) => (b.id === id ? { ...b, ...badge } : b)),
          },
          hasUnsavedChanges: true,
        }))
      },

      deleteBadge: (id) => {
        set((state) => ({
          profileData: {
            ...state.profileData,
            badges: state.profileData.badges.filter((b) => b.id !== id),
          },
          hasUnsavedChanges: true,
        }))
      },

      // Experience actions
      addExperience: (exp) => {
        set((state) => {
          const newId = Math.max(...state.experience.map((e) => e.id), 0) + 1
          return {
            experience: [...state.experience, { ...exp, id: newId }],
            hasUnsavedChanges: true,
          }
        })
      },

      updateExperience: (id, exp) => {
        set((state) => ({
          experience: state.experience.map((e) => (e.id === id ? { ...e, ...exp } : e)),
          hasUnsavedChanges: true,
        }))
      },

      deleteExperience: (id) => {
        set((state) => ({
          experience: state.experience.filter((e) => e.id !== id),
          hasUnsavedChanges: true,
        }))
      },

      // Education actions
      addEducation: (edu) => {
        set((state) => {
          const newId = Math.max(...state.education.map((e) => e.id), 0) + 1
          return {
            education: [...state.education, { ...edu, id: newId }],
            hasUnsavedChanges: true,
          }
        })
      },

      updateEducation: (id, edu) => {
        set((state) => ({
          education: state.education.map((e) => (e.id === id ? { ...e, ...edu } : e)),
          hasUnsavedChanges: true,
        }))
      },

      deleteEducation: (id) => {
        set((state) => ({
          education: state.education.filter((e) => e.id !== id),
          hasUnsavedChanges: true,
        }))
      },

      // Skills actions
      addSkill: (skill) => {
        set((state) => {
          const newId = Math.max(...state.skills.map((s) => s.id), 0) + 1
          return {
            skills: [...state.skills, { ...skill, id: newId }],
            hasUnsavedChanges: true,
          }
        })
      },

      updateSkill: (id, skill) => {
        set((state) => ({
          skills: state.skills.map((s) => (s.id === id ? { ...s, ...skill } : s)),
          hasUnsavedChanges: true,
        }))
      },

      deleteSkill: (id) => {
        set((state) => ({
          skills: state.skills.filter((s) => s.id !== id),
          hasUnsavedChanges: true,
        }))
      },

      // Posts actions
      addPost: (post) => {
        set((state) => {
          const newId = Math.max(...state.posts.map((p) => p.id), 0) + 1
          return {
            posts: [...state.posts, { ...post, id: newId }],
            hasUnsavedChanges: true,
          }
        })
      },

      updatePost: (id, post) => {
        set((state) => ({
          posts: state.posts.map((p) => (p.id === id ? { ...p, ...post } : p)),
          hasUnsavedChanges: true,
        }))
      },

      deletePost: (id) => {
        set((state) => ({
          posts: state.posts.filter((p) => p.id !== id),
          hasUnsavedChanges: true,
        }))
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
            hasUnsavedChanges: true,
          }
        })
      },

      updateNavigationPage: (id, page) => {
        set((state) => ({
          navigationPages: state.navigationPages.map((p) => (p.id === id ? { ...p, ...page } : p)),
          hasUnsavedChanges: true,
        }))
      },

      deleteNavigationPage: (id) => {
        set((state) => ({
          navigationPages: state.navigationPages.filter((p) => p.id !== id),
          hasUnsavedChanges: true,
        }))
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
          hasUnsavedChanges: true,
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
            hasUnsavedChanges: true,
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
              profileData: profileData,
              experience: experience || [],
              education: education || [],
              skills: skills || [],
              posts: posts || [],
              navigationPages: navigationPages || [],
              isLoading: false,
              syncStatus: "success",
              lastSaved: result.data.lastUpdated,
              hasUnsavedChanges: false,
            })
          } else {
            // No data found, use empty defaults
            set({
              isLoading: false,
              syncStatus: "idle",
              hasUnsavedChanges: false,
            })
          }
        } catch (error: unknown) {
          console.error("Failed to load from database:", error)
          set({
            isLoading: false,
            syncStatus: "error",
          })
        }
      },

      saveToDatabase: async () => {
        set({ isSaving: true, syncStatus: "syncing" })

        try {
          const state = get()
          const payload = {
            profileData: state.profileData,
            experience: state.experience,
            education: state.education,
            skills: state.skills,
            posts: state.posts,
            navigationPages: state.navigationPages,
          }

          const response = await fetch("/api/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
          const result = await response.json()

          if (result.success) {
            set({
              isSaving: false,
              syncStatus: "success",
              lastSaved: new Date().toISOString(),
              hasUnsavedChanges: false,
            })
          } else {
            set({
              isSaving: false,
              syncStatus: "error",
            })
          }
          
          return
        } catch (error: unknown) {
          console.error("Failed to save to database:", error)
          set({
            isSaving: false,
            syncStatus: "error",
          })
          return
        }
      },

      createBackup: async (backupName: string) => {
        try {
          const state = get()
          const payload = {
            backupName,
            data: {
              profileData: state.profileData,
              experience: state.experience,
              education: state.education,
              skills: state.skills,
              posts: state.posts,
              navigationPages: state.navigationPages,
              timestamp: new Date().toISOString(),
            },
          }

          const response = await fetch("/api/backup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
          const result = await response.json()

          return
        } catch (error: unknown) {
          console.error("Failed to create backup:", error)
          return
        }
      },

      markAsChanged: () => {
        set({ hasUnsavedChanges: true })
      },
    }),
    {
      name: "profile-storage",
      version: 3, // Increment version for migration
    },
  ),
)
