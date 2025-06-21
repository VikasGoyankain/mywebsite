import { NextResponse } from 'next/server'
import { loadProfileFromDatabase, saveProfileToDatabase } from '@/lib/redis'
import { kv } from '@vercel/kv'

// Type definitions
export interface Skill {
  id: string
  name: string
  level: string
  category: string
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

// GET handler to fetch profile data
export async function GET(request: Request) {
  try {
    // Load the entire profile data
    const data = await loadProfileFromDatabase()
    
    if (!data) {
      // Initialize with default data if none exists
      const defaultData = {
        profileData: {
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
        },
        experience: [],
        education: [],
        skills: [],
        posts: [],
        navigationPages: [],
        lastUpdated: new Date().toISOString(),
      }

      // Save the default data
      const saveResult = await saveProfileToDatabase(defaultData)
      if (!saveResult.success) {
        throw new Error('Failed to save default data')
      }

      return NextResponse.json({
        success: true,
        data: {
          ...defaultData,
          adminPassword: null,
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        adminPassword: data.adminPassword ?? null,
      }
    })
  } catch (error) {
    console.error('Error fetching profile data:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch profile data',
        data: null 
      },
      { status: 500 }
    )
  }
}

// POST handler to update profile data
export async function POST(request: Request) {
  try {
    const data = await request.json()
    if (!data) {
      return NextResponse.json(
        { error: 'Data is required' },
        { status: 400 }
      )
    }

    const saveResult = await saveProfileToDatabase({
      ...data,
      adminPassword: data.adminPassword ?? null,
    })
    if (!saveResult.success) {
      throw new Error('Failed to save profile data')
    }

    return NextResponse.json({
      success: true,
      message: 'Profile data updated successfully'
    })
  } catch (error) {
    console.error('Error updating profile data:', error)
    return NextResponse.json(
      { error: 'Failed to update profile data' },
      { status: 500 }
    )
  }
}

// DELETE handler to remove profile data
export async function DELETE(request: Request) {
  try {
    await kv.del('profile:main')
    return NextResponse.json({
      success: true,
      message: 'Profile data deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting profile data:', error)
    return NextResponse.json(
      { error: 'Failed to delete profile data' },
      { status: 500 }
    )
  }
}
