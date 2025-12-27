import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    project_id: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
    project_id_set: !!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
    project_id_value: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'NOT_SET',
    environment: process.env.NODE_ENV,
    vercel_url: process.env.VERCEL_URL,
    all_env_keys: Object.keys(process.env).filter(key => key.includes('APPWRITE') || key.includes('VERCEL'))
  });
}
