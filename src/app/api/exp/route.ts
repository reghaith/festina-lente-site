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

    const expData = await db.getUserExpWithFallback(userId);

    return NextResponse.json({
      success: true,
      exp: expData
    });

  } catch (error: any) {
    console.error('Get EXP Error:', error.message);
    return NextResponse.json({
      success: false,
      error: 'Failed to get EXP data'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, expChange, reason, actionId } = body;

    if (!userId || expChange === undefined || !reason) {
      return NextResponse.json({
        success: false,
        error: 'User ID, expChange, and reason are required'
      }, { status: 400 });
    }

    // Validate expChange is a number
    if (typeof expChange !== 'number') {
      return NextResponse.json({
        success: false,
        error: 'expChange must be a number'
      }, { status: 400 });
    }

    // For idempotent operations, check if this action was already processed
    if (actionId) {
      // You could implement action deduplication here if needed
      // For now, we'll just proceed with the EXP update
    }

    const updatedExp = await db.updateUserExp(userId, expChange, reason);

    return NextResponse.json({
      success: true,
      exp: updatedExp,
      message: `EXP ${expChange > 0 ? 'gained' : 'lost'}: ${Math.abs(expChange)} (${reason})`
    });

  } catch (error: any) {
    console.error('Update EXP Error:', error.message);
    return NextResponse.json({
      success: false,
      error: 'Failed to update EXP'
    }, { status: 500 });
  }
}