import { account, ID } from '@/lib/appwrite';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Testing Appwrite configuration...');
    console.log('Project ID from env:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

    const sessionId = ID.unique();
    console.log('Generated session ID:', sessionId);

    // Just test if we can access account
    try {
      const session = await account.get();
      return NextResponse.json({
        success: true,
        message: 'Appwrite configured and working',
        hasActiveSession: true,
        sessionId: session.$id
      });
    } catch (sessionError: any) {
      return NextResponse.json({
        success: true,
        message: 'Appwrite configured (no active session)',
        hasActiveSession: false,
        sessionError: sessionError.message
      });
    }
  } catch (error: any) {
    console.error('Appwrite config test failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Appwrite configuration failed',
      error: error.message,
      projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'NOT_SET'
    }, { status: 500 });
  }
}
