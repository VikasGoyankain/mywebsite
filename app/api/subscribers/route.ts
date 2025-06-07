import { NextResponse } from 'next/server'
import { redis, REDIS_KEYS, isRedisConnected } from '@/lib/redis'
import { kv } from '@vercel/kv'

// Type definition for a subscriber
type Subscriber = {
  id: string
  fullName: string
  phoneNumber?: string
  email?: string
  dateJoined: string
  lastUpdated?: string
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
  if (!phoneNumber) return { valid: true, normalizedPhone: undefined };

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

// Validate email with security checks
const validateEmail = (email: string): { valid: boolean; message?: string; normalizedEmail?: string } => {
  if (!email) return { valid: true, normalizedEmail: undefined };

  // Trim and normalize
  const normalizedEmail = email.trim().toLowerCase();
  
  // Basic format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(normalizedEmail)) {
    return { valid: false, message: 'Invalid email format' }
  }
  
  // Check for common disposable email domains
  const disposableDomains = [
    'yopmail.com', 'tempmail.com', 'mailinator.com', 'temp-mail.org', 
    'guerrillamail.com', 'sharklasers.com', '10minutemail.com', 'throwawaymail.com'
  ]
  const domain = normalizedEmail.split('@')[1]
  if (disposableDomains.includes(domain)) {
    return { valid: false, message: 'Please use a non-disposable email address' }
  }
  
  // Check for suspicious TLDs
  const suspiciousTLDs = ['.xyz', '.top', '.work', '.loan']
  if (suspiciousTLDs.some(tld => domain.endsWith(tld))) {
    return { valid: false, message: 'Email domain not accepted' }
  }
  
  return { valid: true, normalizedEmail }
}

export async function POST(request: Request) {
  try {
    // Get storage client
    const { client, type } = await getStorage()
    
    // Parse request body
    const body = await request.json()
    const { fullName, phoneNumber, email } = body
    
    // Validate input
    if (!fullName || !fullName.trim()) {
      return NextResponse.json(
        { message: 'Full name is required' }, 
        { status: 400 }
      )
    }
    
    // Ensure at least one contact method is provided
    if (!phoneNumber && !email) {
      return NextResponse.json(
        { message: 'Either phone number or email is required' }, 
        { status: 400 }
      )
    }
    
    // Enhanced phone number validation (if provided)
    let normalizedPhone: string | undefined = undefined;
    if (phoneNumber) {
      const phoneValidation = validatePhoneNumber(phoneNumber)
      if (!phoneValidation.valid) {
        return NextResponse.json(
          { message: phoneValidation.message || 'Invalid phone number format' }, 
          { status: 400 }
        )
      }
      normalizedPhone = phoneValidation.normalizedPhone;
    }
    
    // Email validation (if provided)
    let normalizedEmail: string | undefined = undefined;
    if (email) {
      const emailValidation = validateEmail(email)
      if (!emailValidation.valid) {
      return NextResponse.json(
          { message: emailValidation.message || 'Invalid email format' }, 
        { status: 400 }
      )
    }
      normalizedEmail = emailValidation.normalizedEmail;
    }
    
    // Generate a unique ID for potential new subscriber
    const subscriberId = generateId();
    
    // Check for existing subscribers by phone or email
    let existingSubscriberByPhone: Subscriber | null = null;
    let existingSubscriberByEmail: Subscriber | null = null;
    let phoneId: string | null = null;
    let emailId: string | null = null;
    
    // Check for existing phone number
    if (normalizedPhone) {
    if (type === 'redis') {
        const existingSubscribers = await client.hgetall(REDIS_KEYS.SUBSCRIBERS) as Record<string, string> || {}
        for (const [key, value] of Object.entries(existingSubscribers)) {
          try {
            const subscriber = typeof value === 'string' ? JSON.parse(value) : value;
            if (subscriber.phoneNumber === normalizedPhone) {
              existingSubscriberByPhone = subscriber;
              break;
            }
          } catch (e) {
            console.error(`Error parsing subscriber data:`, e);
          }
        }
    } else {
      // For Vercel KV
        phoneId = await client.get(`subscribers:phone:${normalizedPhone}`) as string;
        if (phoneId) {
          existingSubscriberByPhone = await client.get(`subscribers:id:${phoneId}`) as Subscriber;
        }
      }
    }
    
    // Check for existing email
    if (normalizedEmail) {
      if (type === 'redis') {
        const existingSubscribers = await client.hgetall(REDIS_KEYS.SUBSCRIBERS) as Record<string, string> || {}
        for (const [key, value] of Object.entries(existingSubscribers)) {
          try {
            const subscriber = typeof value === 'string' ? JSON.parse(value) : value;
            if (subscriber.email === normalizedEmail) {
              existingSubscriberByEmail = subscriber;
              break;
            }
          } catch (e) {
            console.error(`Error parsing subscriber data:`, e);
          }
        }
      } else {
        // For Vercel KV
        emailId = await client.get(`subscribers:email:${normalizedEmail}`) as string;
        if (emailId) {
          existingSubscriberByEmail = await client.get(`subscribers:id:${emailId}`) as Subscriber;
        }
      }
    }
    
    // Handle different update scenarios
    let updatedSubscriber: Subscriber | null = null;
    let isNewSubscription = false;
    let updateMessage = 'Subscription successful';
    
    // Case 1: Both phone and email match to the same subscriber
    if (existingSubscriberByPhone && existingSubscriberByEmail && existingSubscriberByPhone.id === existingSubscriberByEmail.id) {
      // Just update the name if it's different
      updatedSubscriber = {
        ...existingSubscriberByPhone,
        fullName: fullName.trim(),
        lastUpdated: new Date().toISOString()
      };
      updateMessage = 'Your subscription information has been updated';
    }
    // Case 2: Phone matches but email is new or different
    else if (existingSubscriberByPhone) {
      updatedSubscriber = {
        ...existingSubscriberByPhone,
        fullName: fullName.trim(), // Update name
        email: normalizedEmail, // Add or update email
        lastUpdated: new Date().toISOString()
      };
      updateMessage = 'Your subscription has been updated with your email';
    }
    // Case 3: Email matches but phone is new or different
    else if (existingSubscriberByEmail) {
      updatedSubscriber = {
        ...existingSubscriberByEmail,
        fullName: fullName.trim(), // Update name
        phoneNumber: normalizedPhone, // Add or update phone
        lastUpdated: new Date().toISOString()
      };
      updateMessage = 'Your subscription has been updated with your phone number';
    }
    // Case 4: Both phone and email exist but for different subscribers
    else if (phoneId && emailId && phoneId !== emailId) {
      // This is a complex case - we'll merge the records by keeping the phone record
      // and updating it with the email, then delete the email-only record
      updatedSubscriber = {
        ...existingSubscriberByPhone!,
        fullName: fullName.trim(),
        email: normalizedEmail,
        lastUpdated: new Date().toISOString()
      };
      updateMessage = 'Your subscription information has been consolidated';
      
      // We'll need to delete the email-only record later
    }
    // Case 5: New subscription
    else {
      updatedSubscriber = {
        id: subscriberId,
      fullName: fullName.trim(),
      phoneNumber: normalizedPhone,
        email: normalizedEmail,
      dateJoined: new Date().toISOString()
      };
      isNewSubscription = true;
      updateMessage = 'Subscription successful';
    }
    
    // Store updated subscriber in database
    if (type === 'redis') {
      // Store in Redis hash
      const key = normalizedPhone || normalizedEmail || subscriberId;
      await client.hset(REDIS_KEYS.SUBSCRIBERS, {
        [key]: JSON.stringify(updatedSubscriber)
      });
    } else {
      // For Vercel KV
      const targetId = updatedSubscriber.id;
      
      // Store the subscriber object
      await client.set(`subscribers:id:${targetId}`, updatedSubscriber);
      
      // Update or create phone index
      if (normalizedPhone) {
        // If this is an update and the phone number has changed, remove old index
        if (!isNewSubscription && existingSubscriberByEmail && !existingSubscriberByEmail.phoneNumber) {
          // This means we're adding a phone to an email-only subscription
          // No need to delete any old phone index
        }
        
        // Set the new phone index
        await client.set(`subscribers:phone:${normalizedPhone}`, targetId);
      }
      
      // Update or create email index
      if (normalizedEmail) {
        // If this is an update and the email has changed, remove old index
        if (!isNewSubscription && existingSubscriberByPhone && !existingSubscriberByPhone.email) {
          // This means we're adding an email to a phone-only subscription
          // No need to delete any old email index
        }
        
        // Set the new email index
        await client.set(`subscribers:email:${normalizedEmail}`, targetId);
      }
      
      // Handle the special case of merging two records (Case 4)
      if (phoneId && emailId && phoneId !== emailId) {
        // Delete the email-only record
        await client.del(`subscribers:id:${emailId}`);
        
        // Update the subscribers list to remove the deleted ID
        const subscribersList = await client.get('subscribers:list') as string[] || [];
        const updatedList = subscribersList.filter(id => id !== emailId);
        await client.set('subscribers:list', updatedList);
      }
      
      // If this is a new subscription, add to the list
      if (isNewSubscription) {
        const subscribersList = await client.get('subscribers:list') as string[] || [];
        subscribersList.push(subscriberId);
        await client.set('subscribers:list', subscribersList);
      }
    }
    
    console.log(`Subscriber ${isNewSubscription ? 'added' : 'updated'}: ${fullName} (${normalizedPhone || normalizedEmail}) stored in ${type}`);
    
    // Return success response
    return NextResponse.json(
      { message: updateMessage, success: true, isNewSubscription }, 
      { status: isNewSubscription ? 201 : 200 }
    );
    
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
    const validApiKeys = [
      process.env.ADMIN_API_KEY || '',
      process.env.NEXT_PUBLIC_ADMIN_API_KEY || '',
      'admin-secret-key-12345' // Hardcoded fallback for testing and development
    ];
    
    if (!validApiKeys.includes(apiKey || '')) {
      console.log('API Key authentication failed');
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
      for (const [key, value] of Object.entries(redisSubscribers)) {
        try {
          subscribers[key] = typeof value === 'string' ? JSON.parse(value) : value
        } catch (e) {
          console.error(`Error parsing subscriber data for ${key}:`, e)
          // Keep the original value as fallback
          subscribers[key] = value as any
        }
      }
    } else {
      // From Vercel KV
      const subscribersList = await client.get('subscribers:list') as string[] || []
      
      // Build subscribers object from individual keys
      for (const id of subscribersList) {
        const subscriber = await client.get(`subscribers:id:${id}`) as Subscriber
        if (subscriber) {
          subscribers[id] = subscriber
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
    const subscriberId = url.searchParams.get('id')
    const phoneNumber = url.searchParams.get('phone')
    const email = url.searchParams.get('email')
    
    // API key validation
    const validApiKeys = [
      process.env.ADMIN_API_KEY || '',
      process.env.NEXT_PUBLIC_ADMIN_API_KEY || '',
      'admin-secret-key-12345' // Hardcoded fallback for testing and development
    ];
    
    if (!validApiKeys.includes(apiKey || '')) {
      console.log('API Key authentication failed in DELETE handler');
      return NextResponse.json(
        { message: 'Unauthorized' }, 
        { status: 401 }
      )
    }
    
    // Need at least one identifier
    if (!subscriberId && !phoneNumber && !email) {
      return NextResponse.json(
        { message: 'Subscriber ID, phone number, or email is required' }, 
        { status: 400 }
      )
    }
    
    // Get storage client
    const { client, type } = await getStorage()
    
    let targetId: string | null = subscriberId;
    let targetPhone: string | null = phoneNumber;
    let targetEmail: string | null = email;
    
    // If we have a phone/email but not an ID, look up the ID
    if (!targetId && (targetPhone || targetEmail)) {
      if (targetPhone) {
        if (type === 'kv') {
          targetId = await client.get(`subscribers:phone:${targetPhone}`) as string;
        }
      } else if (targetEmail) {
        if (type === 'kv') {
          targetId = await client.get(`subscribers:email:${targetEmail}`) as string;
        }
      }
    }
    
    // If we have an ID but not phone/email, look up the subscriber to get those
    if (targetId && (!targetPhone || !targetEmail)) {
      if (type === 'kv') {
        const subscriber = await client.get(`subscribers:id:${targetId}`) as Subscriber;
        if (subscriber) {
          targetPhone = subscriber.phoneNumber || null;
          targetEmail = subscriber.email || null;
        }
      }
    }
    
    // Delete the subscriber
    if (type === 'redis') {
      // From Redis hash
      if (targetPhone) {
        await client.hdel(REDIS_KEYS.SUBSCRIBERS, targetPhone)
      }
      if (targetEmail) {
        await client.hdel(REDIS_KEYS.SUBSCRIBERS, targetEmail)
      }
    } else {
      // From Vercel KV
      // Delete the main subscriber record
      if (targetId) {
        await client.del(`subscribers:id:${targetId}`)
      }
      
      // Delete phone index
      if (targetPhone) {
        await client.del(`subscribers:phone:${targetPhone}`)
      }
      
      // Delete email index
      if (targetEmail) {
        await client.del(`subscribers:email:${targetEmail}`)
      }
      
      // Update the list of subscribers
      if (targetId) {
      const subscribersList = await client.get('subscribers:list') as string[] || []
        const updatedList = subscribersList.filter(id => id !== targetId)
      await client.set('subscribers:list', updatedList)
      }
    }
    
    // Return success
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