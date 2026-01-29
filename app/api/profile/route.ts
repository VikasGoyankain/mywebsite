import { NextRequest, NextResponse } from 'next/server'
import {
  saveProfileToDatabase,
  loadProfileFromDatabase,
  DatabaseProfile,
} from '@/lib/redis'

export async function GET() {
  try {
    const data = await loadProfileFromDatabase()
    // If no data is found, it's likely the first run. 
    // We return success with null data, and the frontend will use defaults.
    return NextResponse.json({ success: true, data: data || null })
  } catch (error) {
    console.error('Error loading profile:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: DatabaseProfile = await request.json()
    const result = await saveProfileToDatabase(data)

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Profile saved successfully' })
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error('Error saving profile:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}