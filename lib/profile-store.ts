"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { FooterConfig } from "./redis"

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
  id: string
  title: string
  company: string
  duration: string
  location: string
  description: string
  type: string
  image: string
  order: number
}

export interface Education {
  id: string
  degree: string
  institution: string
  year: string
  grade: string
  specialization: string
  achievements: string[]
  order: number
}

export interface Certificate {
  id: string
  name: string
  issuer: string
  date: string
  expiry: string
  category: string
  credentialId: string
  credentialUrl: string
  imageUrl: string
  description: string
}

export interface Skill {
  id: string
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

export interface NavigationButton {
  id: string
  text: string
  href: string
  icon: string
  description: string
  color: string
  order: number
}

type SyncStatus = "idle" | "syncing" | "success" | "error"

interface ProfileStore {
  profileData: ProfileData
  experience: Experience[]
  education: Education[]
  skills: Skill[]
  certificates: Certificate[]
  posts: Post[]
  navigationPages: NavigationPage[]
  navigationButtons: NavigationButton[]
  footerConfig: FooterConfig | null
  isLoading: boolean
  syncStatus: SyncStatus
  hasUnsavedChanges: boolean
  lastSaved: string | null
  lastUpdated: string | null
  error: string | null
  adminPassword: string | null

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
  updateExperience: (id: string, exp: Partial<Experience>) => void
  deleteExperience: (id: string) => void
  reorderExperience: (fromIndex: number, toIndex: number) => void
  moveExperienceUp: (id: string) => void
  moveExperienceDown: (id: string) => void

  // Education actions
  addEducation: (edu: Omit<Education, "id">) => void
  updateEducation: (id: string, edu: Partial<Education>) => void
  deleteEducation: (id: string) => void
  reorderEducation: (fromIndex: number, toIndex: number) => void
  moveEducationUp: (id: string) => void
  moveEducationDown: (id: string) => void

  // Skills actions
  addSkill: (skill: Omit<Skill, "id">) => void
  updateSkill: (id: string, skill: Partial<Skill>) => void
  deleteSkill: (id: string) => void

  // Certificates actions
  addCertificate: (cert: Omit<Certificate, "id">) => void
  updateCertificate: (id: string, cert: Partial<Certificate>) => void
  deleteCertificate: (id: string) => void

  // Posts actions
  addPost: (post: Omit<Post, "id">) => void
  updatePost: (id: number, post: Partial<Post>) => void
  deletePost: (id: number) => void
  getPostsBySection: (section: string) => Post[]

  // Navigation actions
  addNavigationPage: (page: Omit<NavigationPage, "id">) => void
  updateNavigationPage: (id: number, page: Partial<NavigationPage>) => void
  deleteNavigationPage: (id: number) => void

  // Navigation button actions
  addNavigationButton: (button: Omit<NavigationButton, "id">) => void
  updateNavigationButton: (id: string, button: Partial<NavigationButton>) => void
  deleteNavigationButton: (id: string) => void

  // Footer config actions
  updateFooterConfig: (config: Partial<FooterConfig>) => void
  loadFooterConfig: () => Promise<void>
  saveFooterConfig: () => Promise<void>

  // Utility actions
  resetToDefaults: () => void
  exportData: () => string
  importData: (data: string) => void

  // Database actions
  loadFromDatabase: () => Promise<void>
  saveToDatabase: () => Promise<void>
  createBackup: (backupName: string) => Promise<void>
  markAsChanged: () => void

  // Password management
  updateAdminPassword: (newPassword: string) => Promise<void>
  verifyAdminPassword: (password: string) => Promise<boolean>
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
const defaultCertificates: Certificate[] = []
const defaultPosts: Post[] = []
const defaultNavigationPages: NavigationPage[] = []

const defaultFooterConfig: FooterConfig = {
  useProfileName: true,
  useProfileImage: true,
  useProfileBio: true,
  customName: '',
  customImage: '',
  customBio: '',
  useProfileSocialLinks: true,
  sections: [
    {
      id: 'quick-links',
      title: 'Quick Links',
      links: [
        { label: 'Home', href: '/' },
        { label: 'Posts', href: '/posts' },
        { label: 'Research', href: '/research' },
        { label: 'Case Vault', href: '/casevault' },
      ]
    },
    {
      id: 'legal',
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Legal Disclaimer', href: '/disclaimer' },
        { label: 'Contact', href: '/contact' },
      ]
    }
  ],
  copyrightMessage: 'Building a just society through law and advocacy.',
  lastUpdated: new Date().toISOString(),
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      profileData: defaultProfileData,
      experience: defaultExperience,
      education: defaultEducation,
      skills: defaultSkills,
      certificates: defaultCertificates,
      posts: defaultPosts,
      navigationPages: defaultNavigationPages,
      navigationButtons: [],
      footerConfig: defaultFooterConfig,
      adminPassword: null,

      // Database sync state
      isLoading: false,
      syncStatus: "idle",
      hasUnsavedChanges: false,
      lastSaved: null,
      lastUpdated: null,
      error: null,

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
        const newExperience = {
          ...exp,
          id: crypto.randomUUID(),
          order: get().experience.length
        }
        set((state) => ({
          experience: [...state.experience, newExperience].sort((a, b) => a.order - b.order),
          hasUnsavedChanges: true
        }))
      },

      updateExperience: (id, exp) => {
        set((state) => ({
          experience: state.experience.map((item) =>
            item.id === id ? { ...item, ...exp } : item
          ),
          hasUnsavedChanges: true
        }))
      },

      deleteExperience: (id) => {
        set((state) => {
          const filteredExperience = state.experience.filter((item) => item.id !== id)
          const reorderedExperience = filteredExperience.map((item, index) => ({
            ...item,
            order: index
          }))
          return {
            experience: reorderedExperience,
            hasUnsavedChanges: true
          }
        })
      },

      reorderExperience: (fromIndex, toIndex) => {
        set((state) => {
          const experience = [...state.experience]
          const [movedItem] = experience.splice(fromIndex, 1)
          experience.splice(toIndex, 0, movedItem)
          
          const reorderedExperience = experience.map((item, index) => ({
            ...item,
            order: index
          }))
          
          return {
            experience: reorderedExperience,
            hasUnsavedChanges: true
          }
        })
        
        setTimeout(() => {
          get().saveToDatabase().catch(console.error)
        }, 100)
      },

      moveExperienceUp: (id) => {
        set((state) => {
          const experience = [...state.experience]
          const currentIndex = experience.findIndex(item => item.id === id)
          if (currentIndex > 0) {
            const reorderedExperience = experience.map((item, index) => {
              if (index === currentIndex - 1) {
                return { ...experience[currentIndex], order: index }
              } else if (index === currentIndex) {
                return { ...experience[currentIndex - 1], order: index }
              } else {
                return { ...item, order: index }
              }
            })
            return {
              experience: reorderedExperience,
              hasUnsavedChanges: true
            }
          }
          return state
        })
        
        setTimeout(() => {
          get().saveToDatabase().catch(console.error)
        }, 100)
      },

      moveExperienceDown: (id) => {
        set((state) => {
          const experience = [...state.experience]
          const currentIndex = experience.findIndex(item => item.id === id)
          if (currentIndex < experience.length - 1) {
            const reorderedExperience = experience.map((item, index) => {
              if (index === currentIndex) {
                return { ...experience[currentIndex + 1], order: index }
              } else if (index === currentIndex + 1) {
                return { ...experience[currentIndex], order: index }
              } else {
                return { ...item, order: index }
              }
            })
            return {
              experience: reorderedExperience,
              hasUnsavedChanges: true
            }
          }
          return state
        })
        
        setTimeout(() => {
          get().saveToDatabase().catch(console.error)
        }, 100)
      },

      // Education actions
      addEducation: (edu) => {
        const newEducation = {
          ...edu,
          id: crypto.randomUUID(),
          order: get().education.length
        }
        set((state) => ({
          education: [...state.education, newEducation].sort((a, b) => a.order - b.order),
          hasUnsavedChanges: true
        }))
      },

      updateEducation: (id, edu) => {
        set((state) => ({
          education: state.education.map((item) =>
            item.id === id ? { ...item, ...edu } : item
          ),
          hasUnsavedChanges: true
        }))
      },

      deleteEducation: (id) => {
        set((state) => {
          const filteredEducation = state.education.filter((item) => item.id !== id)
          const reorderedEducation = filteredEducation.map((item, index) => ({
            ...item,
            order: index
          }))
          return {
            education: reorderedEducation,
            hasUnsavedChanges: true
          }
        })
      },

      reorderEducation: (fromIndex, toIndex) => {
        set((state) => {
          const education = [...state.education]
          const [movedItem] = education.splice(fromIndex, 1)
          education.splice(toIndex, 0, movedItem)
          
          const reorderedEducation = education.map((item, index) => ({
            ...item,
            order: index
          }))
          
          return {
            education: reorderedEducation,
            hasUnsavedChanges: true
          }
        })
        
        setTimeout(() => {
          get().saveToDatabase().catch(console.error)
        }, 100)
      },

      moveEducationUp: (id) => {
        set((state) => {
          const education = [...state.education]
          const currentIndex = education.findIndex(item => item.id === id)
          if (currentIndex > 0) {
            const reorderedEducation = education.map((item, index) => {
              if (index === currentIndex - 1) {
                return { ...education[currentIndex], order: index }
              } else if (index === currentIndex) {
                return { ...education[currentIndex - 1], order: index }
              } else {
                return { ...item, order: index }
              }
            })
            return {
              education: reorderedEducation,
              hasUnsavedChanges: true
            }
          }
          return state
        })
        
        setTimeout(() => {
          get().saveToDatabase().catch(console.error)
        }, 100)
      },

      moveEducationDown: (id) => {
        set((state) => {
          const education = [...state.education]
          const currentIndex = education.findIndex(item => item.id === id)
          if (currentIndex < education.length - 1) {
            const reorderedEducation = education.map((item, index) => {
              if (index === currentIndex) {
                return { ...education[currentIndex + 1], order: index }
              } else if (index === currentIndex + 1) {
                return { ...education[currentIndex], order: index }
              } else {
                return { ...item, order: index }
              }
            })
            return {
              education: reorderedEducation,
              hasUnsavedChanges: true
            }
          }
          return state
        })
        
        setTimeout(() => {
          get().saveToDatabase().catch(console.error)
        }, 100)
      },

      // Skills actions
      addSkill: (skill) => {
        set((state) => {
          const newId = `skill_${Date.now()}`
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

      // Certificates actions
      addCertificate: (cert) => {
        set((state) => ({
          certificates: [
            ...state.certificates,
            { ...cert, id: crypto.randomUUID() }
          ],
          hasUnsavedChanges: true,
        }))
      },

      updateCertificate: (id, cert) => {
        set((state) => ({
          certificates: state.certificates.map((c) =>
            c.id === id ? { ...c, ...cert } : c
          ),
          hasUnsavedChanges: true,
        }))
      },

      deleteCertificate: (id) => {
        set((state) => ({
          certificates: state.certificates.filter((c) => c.id !== id),
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

      // Navigation button actions
      addNavigationButton: (button) => {
        set((state) => {
          const newId = Date.now().toString()
          return {
            navigationButtons: [...state.navigationButtons, { ...button, id: newId }],
            hasUnsavedChanges: true,
          }
        })
      },

      updateNavigationButton: (id, button) => {
        set((state) => ({
          navigationButtons: state.navigationButtons.map((b) => 
            b.id === id ? { ...b, ...button } : b
          ),
          hasUnsavedChanges: true,
        }))
      },

      deleteNavigationButton: (id) => {
        set((state) => ({
          navigationButtons: state.navigationButtons.filter((b) => b.id !== id),
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
          certificates: defaultCertificates,
          posts: defaultPosts,
          navigationPages: defaultNavigationPages,
          navigationButtons: [],
          adminPassword: null,
          hasUnsavedChanges: true,
        }),

      exportData: () => {
        const state = get()
        return JSON.stringify({
          profileData: state.profileData,
          experience: state.experience,
          education: state.education,
          skills: state.skills,
          certificates: state.certificates,
          posts: state.posts,
          navigationPages: state.navigationPages,
          navigationButtons: state.navigationButtons,
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
            certificates: parsed.certificates || defaultCertificates,
            posts: parsed.posts || defaultPosts,
            navigationPages: parsed.navigationPages || defaultNavigationPages,
            navigationButtons: parsed.navigationButtons || [],
            footerConfig: parsed.footerConfig || defaultFooterConfig,
            adminPassword: null,
            hasUnsavedChanges: true,
          })
        } catch (error) {
          console.error("Failed to import data:", error)
        }
      },

      // Footer config actions
      updateFooterConfig: (config) => {
        set((state) => ({
          footerConfig: state.footerConfig ? { ...state.footerConfig, ...config } : { ...defaultFooterConfig, ...config },
          hasUnsavedChanges: true,
        }))
      },

      loadFooterConfig: async () => {
        try {
          const response = await fetch('/api/footer')
          if (!response.ok) {
            console.error('Failed to load footer config')
            return
          }
          const result = await response.json()
          if (result.success && result.data) {
            set({
              footerConfig: result.data,
            })
          }
        } catch (error) {
          console.error('Error loading footer config:', error)
        }
      },

      saveFooterConfig: async () => {
        try {
          const state = get()
          if (!state.footerConfig) return

          const configToSave = {
            ...state.footerConfig,
            lastUpdated: new Date().toISOString(),
          }

          const response = await fetch('/api/footer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(configToSave),
          })

          const result = await response.json()
          if (!result.success) {
            throw new Error(result.error || 'Failed to save footer config')
          }

          set({
            footerConfig: configToSave,
            hasUnsavedChanges: false,
          })
        } catch (error) {
          console.error('Error saving footer config:', error)
          throw error
        }
      },

      // Database actions
      loadFromDatabase: async () => {
        try {
          const currentState = get()
          if (currentState.syncStatus === 'syncing') {
            return
          }

          set({ 
            syncStatus: 'syncing',
            isLoading: true,
            error: null 
          })

          // Load profile data and footer config in parallel
          const [profileResponse, footerResponse] = await Promise.all([
            fetch('/api/profile'),
            fetch('/api/footer')
          ])

          if (!profileResponse.ok) {
            const errorMessage = `HTTP error! status: ${profileResponse.status}`
            console.error(errorMessage)
            set({ 
              syncStatus: 'error',
              isLoading: false,
              error: errorMessage
            })
            return
          }

          const profileResult = await profileResponse.json()
          const footerResult = footerResponse.ok ? await footerResponse.json() : { success: false }

          if (!profileResult.success) {
            const errorMessage = profileResult.error || 'Failed to load profile data'
            console.error(errorMessage)
            set({ 
              syncStatus: 'error',
              isLoading: false,
              error: errorMessage
            })
            return
          }

          // Migrate footer config from old structure to new if needed
          let footerConfig = defaultFooterConfig
          if (footerResult.success && footerResult.data) {
            const data = footerResult.data
            // Check if it's old structure with quickLinks and legalLinks
            if ((data.quickLinks || data.legalLinks) && !data.sections) {
              footerConfig = {
                ...data,
                sections: [
                  ...(data.quickLinks ? [{
                    id: 'quick-links',
                    title: 'Quick Links',
                    links: data.quickLinks
                  }] : []),
                  ...(data.legalLinks ? [{
                    id: 'legal',
                    title: 'Legal',
                    links: data.legalLinks
                  }] : [])
                ]
              }
            } else {
              footerConfig = data
            }
          }

          set({
          profileData: profileResult.data?.profileData || defaultProfileData,
          experience: profileResult.data?.experience || defaultExperience,
          education: profileResult.data?.education || defaultEducation,
          skills: profileResult.data?.skills || defaultSkills,
          certificates: profileResult.data?.certificates || defaultCertificates,
          posts: profileResult.data?.posts || defaultPosts,
          navigationPages: profileResult.data?.navigationPages || defaultNavigationPages,
          navigationButtons: profileResult.data?.navigationButtons || [],
          footerConfig: footerConfig,
          adminPassword: profileResult.data?.adminPassword ?? null,
          lastUpdated: profileResult.data?.lastUpdated || new Date().toISOString(),
            syncStatus: 'success',
            isLoading: false,
            error: null
          })
        } catch (error) {
          console.error('Error loading from database:', error)
          set({ 
            syncStatus: 'error',
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to load profile data'
          })
        }
      },

      saveToDatabase: async () => {
        try {
          set({ syncStatus: 'syncing' })
          const state = get()
          const response = await fetch('/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              profileData: state.profileData,
              experience: state.experience,
              education: state.education,
              skills: state.skills,
              certificates: state.certificates,
              posts: state.posts,
              navigationPages: state.navigationPages,
              navigationButtons: state.navigationButtons,
              footerConfig: state.footerConfig,
              adminPassword: state.adminPassword,
              lastUpdated: new Date().toISOString(),
            }),
          })

          const result = await response.json()
          if (!result.success) {
            throw new Error(result.error || 'Failed to save profile data')
          }

          set({
            syncStatus: 'success',
            lastSaved: new Date().toISOString(),
            hasUnsavedChanges: false,
          })

          setTimeout(() => {
            set({ syncStatus: 'idle' })
          }, 3000)
        } catch (error) {
          console.error('Error saving to database:', error)
          set({
            syncStatus: 'error',
            error: error instanceof Error ? error.message : 'Failed to save profile data'
          })
          throw error
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
              certificates: state.certificates,
              posts: state.posts,
              navigationPages: state.navigationPages,
              navigationButtons: state.navigationButtons,
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

      updateAdminPassword: async (newPassword) => {
        try {
          const hashedPassword = await hashPassword(newPassword)
          set((state) => ({
            adminPassword: hashedPassword,
            hasUnsavedChanges: true,
          }))
        } catch (error) {
          console.error("Failed to update password:", error)
          throw error
        }
      },

      verifyAdminPassword: async (password) => {
        const state = get()
        if (!state.adminPassword) return false
        return await verifyPassword(password, state.adminPassword)
      },
    }),
    {
      name: "profile-storage",
      version: 4,
    },
  ),
)

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const hashedInput = await hashPassword(password)
  return hashedInput === hashedPassword
}
