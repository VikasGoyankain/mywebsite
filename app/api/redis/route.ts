import { NextResponse } from 'next/server'
import { setValue, getValue, deleteValue, listKeys } from '@/lib/redis'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (!key) {
    // List all keys if no specific key is provided
    const keys = await listKeys()
    return NextResponse.json({ keys })
  }

  const value = await getValue(key)
  return NextResponse.json({ key, value })
}

export async function POST(request: Request) {
  try {
    const { key, value } = await request.json()
    
    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Key and value are required' },
        { status: 400 }
      )
    }

    const success = await setValue(key, value)
    
    if (success) {
      return NextResponse.json({ message: 'Value set successfully', key, value })
    } else {
      return NextResponse.json(
        { error: 'Failed to set value' },
        { status: 500 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (!key) {
    return NextResponse.json(
      { error: 'Key is required' },
      { status: 400 }
    )
  }

  const success = await deleteValue(key)
  
  if (success) {
    return NextResponse.json({ message: 'Value deleted successfully', key })
  } else {
    return NextResponse.json(
      { error: 'Failed to delete value' },
      { status: 500 }
    )
  }
} 