import { NextResponse } from 'next/server'
import { redis, REDIS_KEYS, isRedisConnected } from '@/lib/redis'
import { kv } from '@vercel/kv'

// Type definition for a subscriber
type Subscriber = {
  id: string
  fullName: string
  phoneNumber: string
  dateJoined: string
}

// Generate a simple UUID (simplified version)
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Helper function to use either Redis or Vercel KV
const getStorage = async () => {
  try {
    // Due to Redis permission issues, default to Vercel KV
    return { client: kv, type: 'kv' }
    
    // Uncomment this if Redis permissions are fixed later
    /*
    // Try Redis first
    const connected = await isRedisConnected()
    if (connected) {
      return { client: redis, type: 'redis' }
    }
    // Fallback to Vercel KV
    return { client: kv, type: 'kv' }
    */
  } catch (error) {
    console.error('Storage connection error:', error)
    // Default to Vercel KV
    return { client: kv, type: 'kv' }
  }
}

// Validate phone number with stronger security for Indian mobile numbers
const validatePhoneNumber = (phoneNumber: string): { valid: boolean; message?: string; normalizedPhone?: string } => {
  // Remove spaces, dashes, parentheses
  let normalizedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '')
  
  // Handle Indian phone number format
  // Check for +91 or 91 prefix and remove it
  if (normalizedPhone.startsWith('+91')) {
    normalizedPhone = normalizedPhone.substring(3)
  } else if (normalizedPhone.startsWith('91') && normalizedPhone.length > 10) {
    normalizedPhone = normalizedPhone.substring(2)
  }
  
  // Reject if it starts with 0
  if (normalizedPhone.startsWith('0')) {
    return { valid: false, message: 'Mobile number should not start with 0' }
  }
  
  // Validate Indian mobile number format (must be 10 digits, starting with 6-9)
  if (normalizedPhone.length !== 10) {
    return { valid: false, message: 'Mobile number must be exactly 10 digits' }
  }
  
  if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
    return { valid: false, message: 'Must be a valid Indian mobile number starting with 6, 7, 8, or 9' }
  }
  
  // Check for repeated digits (more than 8 times) to prevent spam
  const digitCounts: Record<string, number> = {}
  for (const digit of normalizedPhone) {
    digitCounts[digit] = (digitCounts[digit] || 0) + 1
  }
  
  if (Object.values(digitCounts).some(count => count >= 8)) {
    return { valid: false, message: 'Invalid phone number pattern' }
  }

  // Check for sequential patterns like 1234567890 or 9876543210
  if (/^0123456789$|^9876543210$/.test(normalizedPhone)) {
    return { valid: false, message: 'Invalid phone number pattern' }
  }
  
  return { valid: true, normalizedPhone }
}

export async function POST(request: Request) {
  try {
    // Get storage client
    const { client, type } = await getStorage()
    
    // Parse request body
    const body = await request.json()
    const { fullName, phoneNumber } = body
    
    // Validate input
    if (!fullName || !fullName.trim()) {
      return NextResponse.json(
        { message: 'Full name is required' }, 
        { status: 400 }
      )
    }
    
    if (!phoneNumber || !phoneNumber.trim()) {
      return NextResponse.json(
        { message: 'Phone number is required' }, 
        { status: 400 }
      )
    }
    
    // Enhanced phone number validation
    const validation = validatePhoneNumber(phoneNumber)
    if (!validation.valid) {
      return NextResponse.json(
        { message: validation.message || 'Invalid phone number format' }, 
        { status: 400 }
      )
    }
    
    const normalizedPhone = validation.normalizedPhone as string
    
    // Check if phone number already exists
    let exists = false
    if (type === 'redis') {
      const existingSubscribers = await client.hgetall(REDIS_KEYS.SUBSCRIBERS) as Record<string, Subscriber> || {}
      exists = Object.values(existingSubscribers).some(
        sub => sub.phoneNumber === normalizedPhone
      )
    } else {
      // For Vercel KV
      const existingSubscriber = await client.get(`subscribers:${normalizedPhone}`)
      exists = !!existingSubscriber
    }
    
    if (exists) {
      return NextResponse.json(
        { message: 'You are already subscribed with this phone number' }, 
        { status: 409 }
      )
    }
    
    // Create new subscriber
    const newSubscriber: Subscriber = {
      id: generateId(),
      fullName: fullName.trim(),
      phoneNumber: normalizedPhone,
      dateJoined: new Date().toISOString()
    }
    
    // Store in database
    if (type === 'redis') {
      // Fix: Use correct Redis hset format - should be key, field, value
      await client.hset(REDIS_KEYS.SUBSCRIBERS, {
        [normalizedPhone]: JSON.stringify(newSubscriber)
      })
    } else {
      // For Vercel KV
      await client.set(`subscribers:${normalizedPhone}`, newSubscriber)
      
      // Also maintain a list of all subscribers
      const subscribersList = await client.get('subscribers:list') as string[] || []
      subscribersList.push(normalizedPhone)
      await client.set('subscribers:list', subscribersList)
    }
    
    console.log(`New subscriber: ${fullName} (${normalizedPhone}) stored in ${type}`)
    
    // Return success response
    return NextResponse.json(
      { message: 'Subscription successful', success: true }, 
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Error handling subscription:', error)
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// Get all subscribers (for admin purposes, would need auth)
export async function GET(request: Request) {
  try {
    // This should be protected with authentication in production
    const url = new URL(request.url)
    const apiKey = url.searchParams.get('apiKey')
    
    // Simple API key check (should use proper auth in production)
    if (apiKey !== process.env.ADMIN_API_KEY && apiKey !== process.env.NEXT_PUBLIC_ADMIN_API_KEY) {
      return NextResponse.json(
        { message: 'Unauthorized' }, 
        { status: 401 }
      )
    }
    
    // Get storage client
    const { client, type } = await getStorage()
    
    // Get all subscribers
    let subscribers: Record<string, Subscriber> = {}
    
    if (type === 'redis') {
      // From Redis
      const redisSubscribers = await client.hgetall(REDIS_KEYS.SUBSCRIBERS) as Record<string, string> || {}
      
      // Parse stringified JSON objects from Redis
      for (const [phone, value] of Object.entries(redisSubscribers)) {
        try {
          subscribers[phone] = typeof value === 'string' ? JSON.parse(value) : value
        } catch (e) {
          console.error(`Error parsing subscriber data for ${phone}:`, e)
          // Keep the original value as fallback
          subscribers[phone] = value as any
        }
      }
    } else {
      // From Vercel KV
      const subscribersList = await client.get('subscribers:list') as string[] || []
      
      // Build subscribers object from individual keys
      for (const phone of subscribersList) {
        const subscriber = await client.get(`subscribers:${phone}`) as Subscriber
        if (subscriber) {
          subscribers[phone] = subscriber
        }
      }
    }
    
    // Return all subscribers
    return NextResponse.json({ subscribers, storageType: type }, { status: 200 })
    
  } catch (error) {
    console.error('Error fetching subscribers:', error)
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// Delete a subscriber
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const apiKey = url.searchParams.get('apiKey')
    const phoneNumber = url.searchParams.get('phoneNumber')
    
    // API key validation
    if (apiKey !== process.env.ADMIN_API_KEY && apiKey !== process.env.NEXT_PUBLIC_ADMIN_API_KEY) {
      return NextResponse.json(
        { message: 'Unauthorized' }, 
        { status: 401 }
      )
    }
    
    // Validate phone number
    if (!phoneNumber) {
      return NextResponse.json(
        { message: 'Phone number is required' }, 
        { status: 400 }
      )
    }
    
    // Get storage client
    const { client, type } = await getStorage()
    
    // Delete the subscriber
    if (type === 'redis') {
      // From Redis
      await client.hdel(REDIS_KEYS.SUBSCRIBERS, phoneNumber)
    } else {
      // From Vercel KV
      await client.del(`subscribers:${phoneNumber}`)
      
      // Also update the list
      const subscribersList = await client.get('subscribers:list') as string[] || []
      const updatedList = subscribersList.filter(phone => phone !== phoneNumber)
      await client.set('subscribers:list', updatedList)
    }
    
    return NextResponse.json(
      { message: 'Subscriber deleted successfully' }, 
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Error deleting subscriber:', error)
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    )
  }
} 