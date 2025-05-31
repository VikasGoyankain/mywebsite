import { type NextRequest, NextResponse } from "next/server"
import { saveProfileToDatabase, loadProfileFromDatabase } from "@/lib/redis"

export async function GET() {
  try {
    const data = await loadProfileFromDatabase()

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          error: "No profile data found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load profile data",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.profileData) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid profile data",
        },
        { status: 400 },
      )
    }

    const result = await saveProfileToDatabase(body)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Profile saved successfully",
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save profile data",
      },
      { status: 500 },
    )
  }
}
