import { NextResponse } from "next/server";
import { saveProfileToDatabase, loadProfileFromDatabase } from "@/lib/redis";

export async function POST(request: Request) {
  try {
    // Get the current profile data
    const existingData = await loadProfileFromDatabase();
    
    if (!existingData) {
      return NextResponse.json({
        success: false,
        error: "No existing profile found",
      }, { status: 404 });
    }
    
    // Get the new data from the request
    const data = await request.json();
    
    // Update only the fields provided
    const updatedData = {
      ...existingData,
      profileData: {
        ...existingData.profileData,
        ...data.profileData || {},
      },
      lastUpdated: new Date().toISOString(),
    };
    
    // Save the updated data
    const result = await saveProfileToDatabase(updatedData);
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || "Failed to update profile",
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });
    
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to update profile",
    }, { status: 500 });
  }
} 