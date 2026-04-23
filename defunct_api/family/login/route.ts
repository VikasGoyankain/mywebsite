import { NextRequest, NextResponse } from "next/server";
import { getFamilyMember, verifyPassword } from "@/lib/redis";
import { randomBytes } from "crypto";

// Generate a secure token for the session
const generateToken = (): string => {
  return randomBytes(32).toString('hex');
};

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    // Check if credentials are provided
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username and password are required" },
        { status: 400 }
      );
    }
    
    // Get family member from database
    const member = await getFamilyMember(username);
    if (!member) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }
    
    // Verify password
    const isValid = await verifyPassword(password, member.hashedPassword);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }
    
    // Generate auth token
    const token = generateToken();
    
    // Set cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    };
    
    // Create response
    const response = NextResponse.json(
      { 
        success: true, 
        message: "Login successful",
        user: {
          username: member.username,
          role: member.role
        }
      },
      { status: 200 }
    );
    
    // Set auth cookie
    response.cookies.set("family-auth-token", token, cookieOptions);
    
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during login" },
      { status: 500 }
    );
  }
} 