import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

// Record survey completion and update user balance
export async function POST(request: NextRequest) {
  try {
    const { userId, surveyId, surveyTitle, payoutCents, transactionId } = await request.json();

    if (!userId || !surveyId || !payoutCents) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: userId, surveyId, payoutCents'
      }, { status: 400 });
    }

    // Convert cents to points (1 cent = 1 point)
    const pointsEarned = payoutCents / 100;

    // For now, we'll use simple queries since the db helper doesn't support transactions
    // In production, you'd want proper transaction handling

    try {
      // Insert survey completion record
      await db.query(`
        INSERT INTO cpx_survey_completions
        (user_id, cpx_user_id, survey_id, survey_title, payout_cents, points_credited, transaction_id, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'completed')
        ON CONFLICT (user_id, survey_id) DO NOTHING
      `, [userId, `earnflow_${userId}`, surveyId, surveyTitle, payoutCents, pointsEarned, transactionId]);

      // Update or insert user balance
      await db.query(`
        INSERT INTO user_balances (user_id, available_balance, total_earned, updated_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id) DO UPDATE SET
          available_balance = user_balances.available_balance + $2,
          total_earned = user_balances.total_earned + $3,
          updated_at = CURRENT_TIMESTAMP
      `, [userId, pointsEarned, pointsEarned]);

      // Record transaction
      await db.query(`
        INSERT INTO transactions (user_id, type, amount, status)
        VALUES ($1, 'survey_completion', $2, 'completed')
      `, [userId, pointsEarned]);

      return NextResponse.json({
        success: true,
        message: 'Survey completion recorded and balance updated',
        pointsEarned
      });

    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }

  } catch (error: any) {
    console.error('Record Survey Completion Error:', error.message);
    return NextResponse.json({
      success: false,
      error: 'Failed to record survey completion'
    }, { status: 500 });
  }
}