import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test basic database connectivity
    const prisma = getPrisma();
    await prisma.user.count();
    
    return NextResponse.json({ 
      message: 'Database connection successful',
      timestamp: new Date().toISOString(),
      database_url: process.env.DATABASE_URL ? 'SET' : 'NOT_SET'
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    return NextResponse.json(
      { 
        error: 'Database connection failed',
        message: (error as Error).message,
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}