import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID required'
      }, { status: 400 });
    }

    // Check if user claimed today
    const todaysClaim = await db.getTodaysClaim(userId);
    const claimStreak = await db.getClaimStreak(userId);

    return NextResponse.json({
      success: true,
      claimedToday: !!todaysClaim,
      streak: claimStreak,
      todaysReward: 10, // Base daily EXP reward
      lastClaim: todaysClaim?.created_at || null
    });

  } catch (error: any) {
    console.error('Get Daily Status Error:', error.message);
    return NextResponse.json({
      success: false,
      error: 'Failed to get daily status'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID required'
      }, { status: 400 });
    }

    // Check if user already claimed today
    const todaysClaim = await db.getTodaysClaim(userId);
    if (todaysClaim) {
      return NextResponse.json({
        success: false,
        error: 'Already claimed today',
        nextClaimTime: new Date(new Date().setHours(24, 0, 0, 0)).toISOString() // Next midnight
      }, { status: 429 });
    }

    // Calculate EXP reward (can be made more complex later)
    const expGranted = 10;

    // Record the claim
    const claimRecord = await db.recordDailyClaim(userId, expGranted);

    if (!claimRecord) {
      return NextResponse.json({
        success: false,
        error: 'Failed to record claim'
      }, { status: 500 });
    }

    // Grant EXP
    await db.updateUserExp(userId, expGranted, 'Daily login reward');

    // Get updated streak
    const newStreak = await db.getClaimStreak(userId);

    return NextResponse.json({
      success: true,
      expGranted,
      newStreak,
      message: `Claimed ${expGranted} EXP for daily login!`
    });

  } catch (error: any) {
    console.error('Claim Daily EXP Error:', error.message);
    return NextResponse.json({
      success: false,
      error: 'Failed to claim daily EXP'
    }, { status: 500 });
  }
}