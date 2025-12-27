import { account } from '@/lib/appwrite';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('Logging out user');

    await account.deleteSession('current');

    console.log('User logged out successfully');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Logout error:', error);

    return NextResponse.json(
      { error: error.message || 'Logout failed' },
      { status: 500 }
    );
  }
}
