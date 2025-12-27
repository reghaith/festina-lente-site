import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'OK',
    message: 'EarnFlow API is working',
    timestamp: new Date().toISOString(),
    project: 'earnflow-nextjs',
    version: '1.0.0'
  });
}
