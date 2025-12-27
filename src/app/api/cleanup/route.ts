import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID not configured' }, { status: 500 });
    }

    console.log('=== Database Cleanup Info ===');

    // This is just informational - we can't actually delete users via API
    // Appwrite requires admin privileges for user management

    return NextResponse.json({
      message: 'Database cleanup requires manual action in Appwrite Console',
      instructions: [
        '1. Go to https://cloud.appwrite.io/console',
        '2. Select your project (earnflow)',
        '3. Go to Auth section',
        '4. Manually delete test users',
        '5. Or create a fresh project for clean testing'
      ],
      alternative: 'Create a new Appwrite project with clean database',
      current_project: projectId,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Cleanup info error:', error);
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}
