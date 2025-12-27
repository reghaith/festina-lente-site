import { account } from '@/lib/appwrite';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await account.get();
    return NextResponse.json({
      user: {
        id: session.$id,
        email: session.email,
        name: session.name,
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
