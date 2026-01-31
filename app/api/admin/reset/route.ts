import { NextRequest, NextResponse } from 'next/server'
import redis from '@/lib/redis'

// POST - Reset admin dashboard data (clear corrupted data)
export async function POST(request: NextRequest) {
  try {
    // Clear both categories and sections
    await redis.del('admin:categories')
    await redis.del('admin:sections')
    
    return NextResponse.json({ 
      success: true,
      message: 'Admin dashboard data has been reset. Refresh the page to reinitialize default data.'
    })
  } catch (error) {
    console.error('Error resetting admin data:', error)
    return NextResponse.json(
      { error: 'Failed to reset admin data' },
      { status: 500 }
    )
  }
}
