import { NextResponse } from 'next/server'
import { redis, REDIS_KEYS, isRedisConnected } from '@/lib/redis'
import { kv } from '@vercel/kv'
import axios from 'axios'
import nodemailer from 'nodemailer'

// Type definition for a subscriber
type Subscriber = {
  id: string
  fullName: string
  phoneNumber?: string
  email?: string
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
  if (!phoneNumber) return { success: false, error: 'No phone number provided' };
  
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

// Create Zoho Mail transporter
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_SMTP_HOST || "smtp.zeptomail.in",
    port: parseInt(process.env.EMAIL_SMTP_PORT || "587"),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_SMTP_USER || "emailapikey",
      pass: process.env.EMAIL_SMTP_PASS || "PHtE6r0FF7rogmUvoRFW4KS6F5P3N4snrOI2LlFE4o9CDKVVSk1Xot4qkzCz/RksXPATHfGdzN1q5b6bu+3TIT3oPTpLX2qyqK3sx/VYSPOZsbq6x00Ys14ccETZXY/octdp0yLQvdrdNA=="
    }
  });
};

// Send email via Zoho Mail
const sendEmail = async (email: string, fullName: string, subject: string, message: string) => {
  if (!email) return { success: false, error: 'No email provided' };
  
  try {
    const transporter = createEmailTransporter();
    
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Vikas Goyanka'}" <${process.env.EMAIL_FROM_ADDRESS || 'contact@vikasgoyanka.in'}>`,
      to: email,
      subject: subject || 'Update from Vikas Goyanka',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hello ${fullName},</h2>
          <div style="margin: 20px 0; line-height: 1.5;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <p style="margin-top: 30px; color: #555;">
            Best regards,<br>
            <strong>Vikas Goyanka</strong>
          </p>
        </div>
      `,
      text: `Hello ${fullName},\n\n${message}\n\nBest regards,\nVikas Goyanka`
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);
    return { 
      success: true, 
      messageId: info.messageId
    };
  } catch (error: any) {
    console.error('Error sending email:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send email' 
    };
  }
};

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json()
    const { message, subject, apiKey, messageType = 'all' } = body
    
    // API key validation
    const validApiKeys = [
      process.env.ADMIN_API_KEY || '',
      process.env.NEXT_PUBLIC_ADMIN_API_KEY || '',
      'admin-secret-key-12345' // Hardcoded fallback for testing and development
    ];
    
    if (!validApiKeys.includes(apiKey || '')) {
      console.log('API Key authentication failed in send-message handler');
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
      for (const [key, value] of Object.entries(redisSubscribers)) {
        try {
          subscribers[key] = typeof value === 'string' ? JSON.parse(value) : value
        } catch (e) {
          console.error(`Error parsing subscriber data for ${key}:`, e)
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
    
    // No subscribers found
    if (Object.keys(subscribers).length === 0) {
      return NextResponse.json(
        { message: 'No subscribers found' }, 
        { status: 404 }
      )
    }
    
    // Send message to all subscribers
    const smsResults = []
    const emailResults = []
    const failures = []
    
    for (const subscriber of Object.values(subscribers)) {
      // Send SMS if phone number is available and messageType is 'sms' or 'all'
      if (subscriber.phoneNumber && (messageType === 'sms' || messageType === 'all')) {
        const result = await sendSMS(subscriber.phoneNumber, message)
        
        if (result.success) {
          smsResults.push({
            phoneNumber: subscriber.phoneNumber,
            name: subscriber.fullName,
            success: true
          })
        } else {
          failures.push({
            phoneNumber: subscriber.phoneNumber,
            name: subscriber.fullName,
            error: result.error,
            type: 'sms'
          })
        }
      }
      
      // Send email if email is available and messageType is 'email' or 'all'
      if (subscriber.email && (messageType === 'email' || messageType === 'all')) {
        const emailSubject = subject || 'Update from Vikas Goyanka';
        const result = await sendEmail(subscriber.email, subscriber.fullName, emailSubject, message)
        
        if (result.success) {
          emailResults.push({
            email: subscriber.email,
            name: subscriber.fullName,
            success: true
          })
        } else {
          failures.push({
            email: subscriber.email,
            name: subscriber.fullName,
            error: result.error,
            type: 'email'
          })
        }
      }
    }
    
    // Return results
    return NextResponse.json({
      smsSentCount: smsResults.length,
      emailSentCount: emailResults.length,
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