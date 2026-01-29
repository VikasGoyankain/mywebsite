import { NextResponse } from 'next/server'
import { initializeDefaultResearchStudies } from '@/lib/services/research-service'

// This is a utility endpoint to initialize the research studies data
// It should only be called once or when you want to reset the data
export async function GET() {
  try {
    const result = await initializeDefaultResearchStudies()
    
    if (result) {
      return NextResponse.json({ 
        success: true, 
        message: 'Default research studies initialized successfully' 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Research studies data already exists' 
      })
    }
  } catch (error) {
    console.error('Failed to initialize research studies:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to initialize research studies' }, 
      { status: 500 }
    )
  }
} 