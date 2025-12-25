import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// In a real application, these settings would be stored in a database
// For this example, we'll simulate fetching/updating from environment variables
// Note: Directly updating process.env at runtime is not persistent across deployments
// and is generally not recommended for production. A database is preferred.

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !(session.user as any)?.role || (session.user as any).role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const settings = {
    ipApiKey: process.env.IP_API_KEY || '',
    maxEarningsPerDay: parseInt(process.env.MAX_EARNINGS_PER_DAY || '50000'),
    maxOffersPerHour: parseInt(process.env.MAX_OFFERS_PER_HOUR || '10'),
    minAccountAgeWithdraw: parseInt(process.env.MIN_ACCOUNT_AGE_WITHDRAW || '7'),
  };

  return NextResponse.json({ settings });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !(session.user as any)?.role || (session.user as any).role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { ipApiKey, maxEarningsPerDay, maxOffersPerHour, minAccountAgeWithdraw } = await request.json();

  // In a real application, you would update these in a database table
  // For this example, we'll just log them and return success
  console.log('Admin updated security settings:', {
    ipApiKey,
    maxEarningsPerDay,
    maxOffersPerHour,
    minAccountAgeWithdraw,
  });

  // Simulate updating environment variables (not persistent in production)
  process.env.IP_API_KEY = ipApiKey;
  process.env.MAX_EARNINGS_PER_DAY = maxEarningsPerDay.toString();
  process.env.MAX_OFFERS_PER_HOUR = maxOffersPerHour.toString();
  process.env.MIN_ACCOUNT_AGE_WITHDRAW = minAccountAgeWithdraw.toString();

  return NextResponse.json({ message: 'Settings updated successfully (simulated).' });
}
