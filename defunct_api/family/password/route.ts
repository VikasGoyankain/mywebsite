import { NextRequest, NextResponse } from "next/server";
import { getFamilyMember, verifyPassword, hashPassword, updateFamilyMemberPassword } from "@/lib/redis";

export async function POST(request: NextRequest) {
  try {
    // Get the auth token from cookies
    const authToken = request.cookies.get('family-auth-token')?.value;
    if (!authToken) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { currentPassword, newPassword } = await request.json();
    
    // Validate request
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Current password and new password are required" },
        { status: 400 }
      );
    }
    
    // Get username from session (you'll need to implement this based on your token strategy)
    // For now, we'll use a placeholder
    const username = "Vikas"; // TODO: Get from session
    
    // Get user from database
    const member = await getFamilyMember(username);
    if (!member) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }
    
    // Verify current password
    const isValid = await verifyPassword(currentPassword, member.hashedPassword);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Current password is incorrect" },
        { status: 401 }
      );
    }
    
    // Hash new password
    const newHashedPassword = await hashPassword(newPassword);
    
    // Update password in database
    await updateFamilyMemberPassword(username, newHashedPassword);
    
    return NextResponse.json(
      { success: true, message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred while updating password" },
      { status: 500 }
    );
  }
} 