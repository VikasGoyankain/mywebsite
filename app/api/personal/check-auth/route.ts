import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('personal-auth-token');

    if (!token?.value) {
      return new NextResponse(null, { status: 401 });
    }

    try {
      const tokenData = JSON.parse(token.value);
      const expirationTime = tokenData.exp * 1000; // Convert to milliseconds

      if (expirationTime < Date.now()) {
        return new NextResponse(null, { status: 401 });
      }

      return new NextResponse(JSON.stringify({ 
        authenticated: true,
        user: {
          username: tokenData.username,
          role: tokenData.role
        }
      }), { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (e) {
      return new NextResponse(null, { status: 401 });
    }
  } catch (error) {
    console.error('Auth check error:', error);
    return new NextResponse(null, { status: 500 });
  }
} 