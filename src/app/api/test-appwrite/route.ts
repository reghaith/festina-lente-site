import { account } from '@/lib/appwrite';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Testing Appwrite configuration...');
    console.log('Project ID:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
    console.log('Request origin:', process.env.VERCEL_URL || 'localhost');

    // Test basic connection
    const testResponse = await fetch('https://cloud.appwrite.io/v1/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Health check status:', testResponse.status);

    return NextResponse.json({
      success: true,
      message: 'Appwrite configuration test',
      projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
      vercelUrl: process.env.VERCEL_URL,
      healthCheck: testResponse.status
    });
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
