import { NextRequest, NextResponse } from "next/server"
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    // Verify the request is authenticated
    const authToken = request.cookies.get('admin-auth-token')?.value
    
    if (!authToken || authToken !== process.env.ADMIN_AUTH_TOKEN) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const { currentPassword, newPassword } = await request.json()
    
    // Validate request
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Current password and new password are required" },
        { status: 400 }
      )
    }
    
    // Verify current password
    if (currentPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, message: "Current password is incorrect" },
        { status: 401 }
      )
    }
    
    // Update .env.local file
    try {
      // Get the path to the .env.local file
      const envFilePath = path.join(process.cwd(), '.env.local')
      
      // Read the current content
      let envContent = fs.readFileSync(envFilePath, 'utf-8')
      
      // Replace the ADMIN_PASSWORD line
      envContent = envContent.replace(
        /ADMIN_PASSWORD=.*/,
        `ADMIN_PASSWORD=${newPassword}`
      )
      
      // Write the updated content back to the file
      fs.writeFileSync(envFilePath, envContent)
      
      // Update the current environment variable
      process.env.ADMIN_PASSWORD = newPassword
      
      return NextResponse.json(
        { success: true, message: "Password updated successfully" },
        { status: 200 }
      )
    } catch (error) {
      console.error("Error updating password file:", error)
      return NextResponse.json(
        { success: false, message: "Failed to update password" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Password change error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred" },
      { status: 500 }
    )
  }
} 