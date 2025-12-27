import { account } from '@/lib/appwrite';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
    }

    console.log('=== Checking User Status ===');
    console.log('Email to check:', email);

    // Try to get current session to see if we're logged in
    try {
      const currentUser = await account.get();
      console.log('Current session user:', currentUser.email);
      return NextResponse.json({
        status: 'logged_in',
        user: {
          id: currentUser.$id,
          email: currentUser.email,
          name: currentUser.name,
        }
      });
    } catch (sessionError) {
      console.log('No active session');
    }

    // If not logged in, try to check if user exists by attempting login
    // Note: This is not a secure way to check user existence, but for debugging
    return NextResponse.json({
      status: 'not_logged_in',
      message: 'Cannot check user existence without authentication',
      email: email
    });

  } catch (error: any) {
    console.error('User check error:', error);
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        type: error.type
      },
      { status: 500 }
    );
  }
}
