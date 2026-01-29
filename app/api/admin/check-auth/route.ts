import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Get the auth token from the cookies
    const authToken = request.cookies.get('admin-auth-token')?.value
    
    // Check if the token matches the expected value
    if (!authToken || authToken !== process.env.ADMIN_AUTH_TOKEN) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }
    
    // If we got here, the user is authenticated
    return NextResponse.json(
      { success: true, message: "Authenticated" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred during authentication check" },
      { status: 500 }
    )
  }
} 