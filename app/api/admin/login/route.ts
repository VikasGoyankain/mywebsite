import { NextRequest, NextResponse } from "next/server"
import { loadProfileFromDatabase } from '@/lib/redis'

// Password verification utility (same as in profile-store)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const hashedInput = await hashPassword(password)
  return hashedInput === hashedPassword
}

// Generate a secure token for this session
const generateToken = (): string => {
  return process.env.ADMIN_AUTH_TOKEN || ''
}

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    
    // Check if password is provided
    if (!password) {
      return NextResponse.json(
        { success: false, message: "Password is required" },
        { status: 400 }
      )
    }
    
    // Load hashed password from database
    const profile = await loadProfileFromDatabase()
    let hashedPassword = profile?.adminPassword || null
    let isValid = false

    if (hashedPassword) {
      isValid = await verifyPassword(password, hashedPassword)
    } else {
      // Fallback to env variable for legacy support
      const envPassword = process.env.ADMIN_PASSWORD
      isValid = password === envPassword
    }
    
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid password" },
        { status: 401 }
      )
    }
    
    // Generate auth token
    const token = generateToken()
    
    // Set cookie with the token
    // Set secure to true in production and sameSite to 'lax' for better security
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    }
    
    // Create the response
    const response = NextResponse.json(
      { success: true, message: "Login successful" },
      { status: 200 }
    )
    
    // Set the cookie
    response.cookies.set("admin-auth-token", token, cookieOptions)
    
    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred during login" },
      { status: 500 }
    )
  }
}

// Handle logout request
export async function DELETE() {
  const response = NextResponse.json(
    { success: true, message: "Logged out successfully" },
    { status: 200 }
  )
  
  // Clear the auth cookie
  response.cookies.set("admin-auth-token", "", { 
    maxAge: 0,
    path: "/"
  })
  
  return response
} 