// Temporarily disable session route for testing
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'Session endpoint temporarily disabled for testing',
    status: 200 
  });
}

export async function POST() {
  return NextResponse.json({ 
    message: 'Session endpoint temporarily disabled for testing',
    status: 200 
  });
}