import { NextResponse } from 'next/server'
import { redis, REDIS_KEYS, isRedisConnected } from '@/lib/redis'
import { kv } from '@vercel/kv'
import axios from 'axios'

// Type definition for a subscriber
type Subscriber = {
  id: string
  fullName: string
  phoneNumber: string
  dateJoined: string
}

// Helper function to use either Redis or Vercel KV
const getStorage = async () => {
  try {
    // Due to Redis permission issues, default to Vercel KV
    return { client: kv, type: 'kv' }
  } catch (error) {
    console.error('Storage connection error:', error)
    // Default to Vercel KV
    return { client: kv, type: 'kv' }
  }
}

// Send SMS via Message Central API
const sendSMS = async (phoneNumber: string, message: string) => {
  try {
    // Make sure phone is just the 10 digits (strip any country code if present)
    let normalizedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '')
    
    // Remove +91 or 91 prefix if present
    if (normalizedPhone.startsWith('+91')) {
      normalizedPhone = normalizedPhone.substring(3)
    } else if (normalizedPhone.startsWith('91') && normalizedPhone.length > 10) {
      normalizedPhone = normalizedPhone.substring(2)
    }
    
    // Create the URL with parameters embedded directly in the string
    const url = `https://cpaas.messagecentral.com/verification/v3/send?countryCode=91&customerId=C-50EB7D467D6542A&senderId=UTOMOB&type=SMS&flowType=SMS&mobileNumber=${normalizedPhone}&message=${encodeURIComponent(message)}`;
    
    // Set up headers
    const headers = {
      authToken: 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJDLTUwRUI3RDQ2N0Q2NTQyQSIsImlhdCI6MTc0ODcwNDk0NywiZXhwIjoxOTA2Mzg0OTQ3fQ.RIOjgnK8DDBIr6gdfoacjs0nHkZJXQmmoIjqnODJnMcRm3d3IHCqyTVz3mLFOuP1X-h-KguCtSTQSF1sWUTNIA'
    }
    
    // Make the API call
    const response = await axios.post(url, null, { headers });
    
    // Check if the message was sent successfully
    // Message Central API returns responseCode: 200 when successful
    if (response.data && (response.data.responseCode === 200 || response.data.responseCode === '200')) {
      console.log('SMS sent successfully:', response.data)
      return { success: true, data: response.data }
    } else {
      console.error('SMS sending failed:', response.data)
      return { success: false, error: response.data?.message || 'SMS sending failed' }
    }
  } catch (error: any) {
    console.error('Error sending SMS:', error.message)
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Unknown error occurred'
    }
  }
}

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json()
    const { message, apiKey } = body
    
    // API key validation
    if (apiKey !== process.env.ADMIN_API_KEY && apiKey !== process.env.NEXT_PUBLIC_ADMIN_API_KEY) {
      return NextResponse.json(
        { message: 'Unauthorized' }, 
        { status: 401 }
      )
    }
    
    // Validate message
    if (!message || !message.trim()) {
      return NextResponse.json(
        { message: 'Message content is required' }, 
        { status: 400 }
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
    
    // No subscribers found
    if (Object.keys(subscribers).length === 0) {
      return NextResponse.json(
        { message: 'No subscribers found' }, 
        { status: 404 }
      )
    }
    
    // Send message to all subscribers
    const results = []
    const failures = []
    
    for (const subscriber of Object.values(subscribers)) {
      const result = await sendSMS(subscriber.phoneNumber, message)
      
      if (result.success) {
        results.push({
          phoneNumber: subscriber.phoneNumber,
          name: subscriber.fullName,
          success: true
        })
      } else {
        failures.push({
          phoneNumber: subscriber.phoneNumber,
          name: subscriber.fullName,
          error: result.error
        })
      }
    }
    
    // Return results
    return NextResponse.json({
      sentCount: results.length,
      failedCount: failures.length,
      totalSubscribers: Object.keys(subscribers).length,
      failures: failures.length > 0 ? failures : undefined
    }, { status: 200 })
    
  } catch (error: any) {
    console.error('Error sending bulk messages:', error)
    return NextResponse.json(
      { message: error.message || 'Internal server error' }, 
      { status: 500 }
    )
  }
} 