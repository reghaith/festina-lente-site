import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { withdrawalRequestId, adminUserId } = await request.json();

    if (!withdrawalRequestId) {
      return NextResponse.json({
        success: false,
        error: 'Withdrawal request ID required'
      }, { status: 400 });
    }

    // Get withdrawal request
    const withdrawalResult = await db.query(`
      SELECT wr.*, ub.available_balance
      FROM withdrawal_requests wr
      JOIN user_balances ub ON wr.user_id = ub.user_id
      WHERE wr.id = $1 AND wr.status = 'pending'
    `, [withdrawalRequestId]);

    if (withdrawalResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Withdrawal request not found or already processed'
      }, { status: 404 });
    }

    const withdrawal = withdrawalResult.rows[0];

    // Check if user has sufficient balance
    if (withdrawal.available_balance < withdrawal.amount) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient balance'
      }, { status: 400 });
    }

    // Process withdrawal (in a real app, this would integrate with payment processors)
    // For demo purposes, we'll mark as completed

    // Update withdrawal status
    await db.query(`
      UPDATE withdrawal_requests
      SET status = 'completed', processed_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [withdrawalRequestId]);

    // Deduct from user balance
    await db.query(`
      UPDATE user_balances
      SET available_balance = available_balance - $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
    `, [withdrawal.user_id, withdrawal.amount]);

    // Record transaction
    await db.query(`
      INSERT INTO transactions (user_id, type, amount, status, reference_id)
      VALUES ($1, 'withdrawal', $2, 'completed', $3)
    `, [withdrawal.user_id, -withdrawal.amount, withdrawalRequestId]);

    // Grant EXP for withdrawal
    const expEarned = 25; // EXP for processing a withdrawal
    await db.updateUserExp(withdrawal.user_id, expEarned, 'Withdrawal processed');

    return NextResponse.json({
      success: true,
      message: 'Withdrawal processed successfully',
      withdrawal: {
        id: withdrawal.id,
        amount: withdrawal.amount,
        method: withdrawal.method,
        user_id: withdrawal.user_id
      },
      expEarned
    });

  } catch (error: any) {
    console.error('Process Withdrawal Error:', error.message);
    return NextResponse.json({
      success: false,
      error: 'Failed to process withdrawal'
    }, { status: 500 });
  }
}