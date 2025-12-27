import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID not configured' }, { status: 500 });
    }

    console.log('=== Attempting to list users ===');

    // Try to get users list (this might not work without admin privileges)
    try {
      const usersResponse = await fetch(`https://cloud.appwrite.io/v1/users`, {
        method: 'GET',
        headers: {
          'X-Appwrite-Project': projectId,
          'X-Appwrite-Key': process.env.APPWRITE_API_KEY || '',
        },
      });

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        return NextResponse.json({
          success: true,
          users: usersData.users?.map((u: any) => ({
            id: u.$id,
            email: u.email,
            name: u.name,
            created: u.$createdAt
          })) || [],
          total: usersData.total || 0
        });
      } else {
        console.log('Users API failed:', usersResponse.status);
      }
    } catch (usersError) {
      console.log('Users API error:', usersError);
    }

    // Fallback: provide cleanup instructions
    return NextResponse.json({
      success: false,
      message: 'Cannot list users programmatically - requires admin privileges',
      manual_cleanup_instructions: {
        step1: 'Go to https://cloud.appwrite.io/console',
        step2: 'Select your project (694f838c0019ec9c5295)',
        step3: 'Go to Auth > Users section',
        step4: 'Click on each test user and delete them',
        step5: 'Or create a new Appwrite project for clean testing',
        alternative: 'Use different email addresses for testing'
      },
      current_emails_to_avoid: [
        'test@example.com',
        'harebvvvhg@gmail.com',
        'debug-test@example.com',
        'sdk-test@example.com',
        'static-test@example.com',
        'sameformat-test@example.com',
        'working-test@example.com',
        'final-working-test@example.com',
        'ratelimit-test@example.com',
        'timeout-test@example.com',
        'detailed-test@example.com',
        'fallback-test@example.com',
        'explicit-test@example.com',
        'userid-test@example.com',
        'short-test@example.com',
        'rest-test@example.com',
        'valid-test@example.com'
      ]
    });

  } catch (error: any) {
    console.error('Cleanup error:', error);
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}
