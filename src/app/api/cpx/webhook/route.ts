import { NextRequest, NextResponse } from 'next/server';

// This would be your webhook secret from CPX - set in environment variables
const CPX_WEBHOOK_SECRET = process.env.CPX_WEBHOOK_SECRET || 'your_webhook_secret';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-cpx-signature');

    // Verify webhook signature (recommended for production)
    // const expectedSignature = crypto.createHmac('sha256', CPX_WEBHOOK_SECRET)
    //   .update(body)
    //   .digest('hex');

    // if (signature !== expectedSignature) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    const payload = JSON.parse(body);
    console.log('CPX Webhook received:', payload);

    const {
      event_type,
      user_id,
      survey_id,
      payout_cents,
      transaction_id,
      status
    } = payload;

    if (event_type === 'survey_complete' && status === 'approved') {
      // Extract our user ID from CPX user_id (format: earnflow_{userId})
      const userId = user_id.replace('earnflow_', '');

      // Convert cents to dollars for our points system (1 cent = 1 point)
      const pointsEarned = payout_cents;

      // Record survey completion and update balance
      console.log(`User ${userId} completed survey ${survey_id}, earned ${pointsEarned} points`);

      try {
        const recordResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/surveys/complete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: parseInt(userId),
            surveyId: survey_id,
            surveyTitle: `CPX Survey ${survey_id}`,
            payoutCents: payout_cents,
            transactionId: transaction_id
          })
        });

        if (!recordResponse.ok) {
          console.error('Failed to record survey completion in database');
        }
      } catch (recordError) {
        console.error('Error recording survey completion:', recordError);
      }

      return NextResponse.json({
        success: true,
        message: 'Survey completion recorded',
        userId,
        surveyId: survey_id,
        pointsEarned
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed'
    });

  } catch (error: any) {
    console.error('CPX Webhook Error:', error.message);
    return NextResponse.json({
      success: false,
      error: 'Webhook processing failed'
    }, { status: 500 });
  }
}