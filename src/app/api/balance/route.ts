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

    // Get user balance
    const balanceResult = await db.query(`
      SELECT available_balance, pending_balance, total_earned
      FROM user_balances
      WHERE user_id = $1
    `, [userId]);

    const balance = balanceResult.rows[0] || {
      available_balance: 0,
      pending_balance: 0,
      total_earned: 0
    };

    // Get user EXP data
    const expData = await db.getUserExpWithFallback(userId);

    // Get recent transactions
    const transactionsResult = await db.query(`
      SELECT type, amount, status, created_at
      FROM transactions
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 10
    `, [userId]);

    return NextResponse.json({
      success: true,
      balance,
      exp: expData,
      transactions: transactionsResult.rows
    });

  } catch (error: any) {
    console.error('Get Balance Error:', error.message);
    return NextResponse.json({
      success: false,
      error: 'Failed to get balance'
    }, { status: 500 });
  }
}