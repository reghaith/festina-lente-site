import { account } from '@/lib/appwrite';
import { NextResponse } from 'next/server';

import { db, auth } from '@/lib/database';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Get JWT token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token
    const decoded = await auth.verifyToken(token);
    const user = await db.getUserById(decoded.userId);

    if (!user) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    });
  } catch (error: any) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { error: 'No active session' },
      { status: 401 }
    );
  }
}
