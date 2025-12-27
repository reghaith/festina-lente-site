import { account } from '@/lib/appwrite';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('=== Appwrite Configuration Test ===');
    console.log('Project ID:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

    // Test basic connectivity
    try {
      const healthResponse = await fetch('https://cloud.appwrite.io/v1/health', {
        method: 'GET',
      });
      console.log('Appwrite health check:', healthResponse.status);
    } catch (error) {
      console.log('Health check failed:', error);
    }

    // Test if we can get current session
    let currentSession = null;
    try {
      currentSession = await account.get();
      console.log('Current session exists for user:', currentSession.$id);
    } catch (error) {
      console.log('No current session');
    }

    // Test account methods availability
    const accountMethods = {
      create: typeof account.create,
      createEmailPasswordSession: typeof account.createEmailPasswordSession,
      get: typeof account.get,
      deleteSession: typeof account.deleteSession,
    };

    console.log('Account methods available:', accountMethods);

    return NextResponse.json({
      project_id: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
      project_id_set: !!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
      current_session: currentSession ? { id: currentSession.$id, email: currentSession.email } : null,
      account_methods: accountMethods,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Test error:', error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
      project_id: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
    }, { status: 500 });
  }
}
