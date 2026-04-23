import { NextRequest, NextResponse } from 'next/server'
import {
  verifySessionJWT,
  verifyPasswordPbkdf2,
  hashPasswordPbkdf2,
  SESSION_COOKIE_NAME,
} from '@/lib/admin-auth'
import path from 'path'
import fs from 'fs'

export async function POST(request: NextRequest) {
  // ── 1. Verify session JWT ─────────────────────────────────────────────────
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  if (!token || !(await verifySessionJWT(token))) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    )
  }

  // ── 2. Parse request ──────────────────────────────────────────────────────
  let currentPassword: string, newPassword: string
  try {
    const body = await request.json()
    currentPassword = body?.currentPassword ?? ''
    newPassword = body?.newPassword ?? ''
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid request body' },
      { status: 400 }
    )
  }

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { success: false, message: 'Both current and new password are required' },
      { status: 400 }
    )
  }

  if (newPassword.length < 12) {
    return NextResponse.json(
      { success: false, message: 'New password must be at least 12 characters' },
      { status: 400 }
    )
  }

  // ── 3. Verify current password ────────────────────────────────────────────
  const storedHash = process.env.ADMIN_PASSWORD_HASH
  if (!storedHash) {
    return NextResponse.json(
      { success: false, message: 'Server misconfiguration' },
      { status: 500 }
    )
  }

  const isCurrentValid = await verifyPasswordPbkdf2(currentPassword, storedHash)
  if (!isCurrentValid) {
    return NextResponse.json(
      { success: false, message: 'Current password is incorrect' },
      { status: 401 }
    )
  }

  // ── 4. Hash and persist new password ─────────────────────────────────────
  const newHash = await hashPasswordPbkdf2(newPassword)

  try {
    const envFilePath = path.join(process.cwd(), '.env.local')
    let envContent = ''

    if (fs.existsSync(envFilePath)) {
      envContent = fs.readFileSync(envFilePath, 'utf-8')
    }

    if (envContent.includes('ADMIN_PASSWORD_HASH=')) {
      envContent = envContent.replace(
        /ADMIN_PASSWORD_HASH=.*/,
        `ADMIN_PASSWORD_HASH=${newHash}`
      )
    } else {
      envContent += `\nADMIN_PASSWORD_HASH=${newHash}\n`
    }

    fs.writeFileSync(envFilePath, envContent, 'utf-8')

    // Update the in-process env so it takes effect without restart
    process.env.ADMIN_PASSWORD_HASH = newHash

    return NextResponse.json(
      { success: true, message: 'Password updated successfully' },
      { status: 200 }
    )
  } catch (err) {
    console.error('[Admin password] Failed to write .env.local:', err)
    return NextResponse.json(
      { success: false, message: 'Failed to persist new password' },
      { status: 500 }
    )
  }
}