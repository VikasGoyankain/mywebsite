import { NextRequest, NextResponse } from "next/server";
import { getFamilyMember, saveFamilyMember, hashPassword } from "@/lib/redis";
import type { FamilyMember } from "@/lib/redis";
import redis from '@/lib/redis';
import { createHash } from 'crypto';
import { cookies } from 'next/headers';

const USERS_KEY = 'family_members';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const cookieStore = await cookies();
    const adminAuthToken = cookieStore.get('admin-auth-token')?.value;
    if (!adminAuthToken || adminAuthToken !== process.env.ADMIN_AUTH_TOKEN) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { username, password, role = 'visitor' } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    if (!['admin', 'user', 'visitor'].includes(role)) {
      return NextResponse.json(
        { success: false, message: 'Invalid role' },
        { status: 400 }
      );
    }

    // Get existing users
    const users = await redis.hgetall<Record<string, string>>(USERS_KEY) || {};
    const existingUser = users[username] ? JSON.parse(users[username]) : null;

    // Check if username already exists
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Username already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = createHash('sha256')
      .update(password)
      .digest('hex');

    // Create new user
    const newUser: FamilyMember = {
      username,
      password: hashedPassword,
      role,
      createdAt: new Date().toISOString()
    };

    // Save to Redis - stringify the user object
    await redis.hset(USERS_KEY, {
      [username]: JSON.stringify(newUser)
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during registration' },
      { status: 500 }
    );
  }
} 