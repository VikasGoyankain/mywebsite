import { type NextRequest, NextResponse } from "next/server"
import { createBackup, listBackups, loadProfileFromDatabase } from "@/lib/redis"

export async function POST(request: NextRequest) {
  try {
    const { backupName } = await request.json()

    if (!backupName) {
      return NextResponse.json(
        {
          success: false,
          error: "Backup name is required",
        },
        { status: 400 },
      )
    }

    // Load current profile data
    const currentData = await loadProfileFromDatabase()

    if (!currentData) {
      return NextResponse.json(
        {
          success: false,
          error: "No profile data to backup",
        },
        { status: 404 },
      )
    }

    const result = await createBackup(backupName, currentData)

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
      message: "Backup created successfully",
      backupKey: result.backupKey,
    })
  } catch (error) {
    console.error("Backup API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create backup",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const result = await listBackups()

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
      backups: result.backups,
    })
  } catch (error) {
    console.error("List backups API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to list backups",
      },
      { status: 500 },
    )
  }
}
