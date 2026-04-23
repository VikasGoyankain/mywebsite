import { NextRequest, NextResponse } from 'next/server'
import {
  saveFooterConfig,
  loadFooterConfig,
  getDefaultFooterConfig,
  FooterConfig,
} from '@/lib/redis'

export async function GET() {
  try {
    let data = await loadFooterConfig()
    
    // If no footer config exists, create one with defaults and save it
    if (!data) {
      data = await getDefaultFooterConfig()
      await saveFooterConfig(data)
    }
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error loading footer config:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: FooterConfig = await request.json()
    const result = await saveFooterConfig(data)

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Footer config saved successfully' })
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error('Error saving footer config:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
