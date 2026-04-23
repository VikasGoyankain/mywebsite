import { NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { createHash } from 'crypto';
import { cookies } from 'next/headers';

const USERS_KEY = 'family_members';
const ONE_HOUR = 60 * 60; // in seconds

interface FamilyMember {
  username: string;
  password: string;
  role?: string;
  createdAt?: string;
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    console.log('Login attempt for username:', username);

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Get users from Redis
    const users = await redis.hgetall<Record<string, any>>(USERS_KEY) || {};
    console.log('Found users in Redis:', users);
    const user = users[username];

    if (!user) {
      console.log('User not found in Redis');
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('User data from Redis:', { ...user, password: '[REDACTED]' });

    // Hash the provided password
    const hashedPassword = createHash('sha256')
      .update(password)
      .digest('hex');
    console.log('Comparing passwords:', { 
      providedHash: hashedPassword.slice(0, 10) + '...',
      storedHash: user.password.slice(0, 10) + '...'
    });

    // Compare passwords
    if (hashedPassword !== user.password) {
      console.log('Password mismatch');
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('Login successful');
    
    // Create JWT token with user data
    const token = JSON.stringify({
      username: user.username,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + ONE_HOUR
    });

    // Create response with success message
    const response = NextResponse.json({ 
      success: true,
      user: {
        username: user.username,
        role: user.role
      }
    });

    // Set authentication cookie with 1 hour expiration
    response.cookies.set({
      name: 'personal-auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ONE_HOUR
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during login' },
      { status: 500 }
    );
  }
} 