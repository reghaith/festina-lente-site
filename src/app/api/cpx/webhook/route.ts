import { NextRequest, NextResponse } from 'next/server';

// CPX Research webhook configuration
const CPX_WEBHOOK_SECRET = process.env.CPX_WEBHOOK_SECRET || 'your_webhook_secret';
const CPX_API_KEY = process.env.CPX_API_KEY || 'e12b878968768145c304ff4580e643bc';

export async function POST(request: NextRequest) {
  try {
    // CPX sends postbacks as URL-encoded form data or JSON
    const contentType = request.headers.get('content-type');

    let payload: any = {};

    if (contentType?.includes('application/json')) {
      payload = await request.json();
    } else {
      // Handle URL-encoded form data
      const formData = await request.formData();
      for (const [key, value] of formData.entries()) {
        payload[key] = value;
      }
    }

    console.log('CPX Postback received:', payload);

    // CPX postback parameters (adjust based on their documentation)
    const {
      ext_user_id,    // Our user ID (earnflow_{userId})
      amount,         // Payout amount in cents
      transaction_id,
      status,         // 'completed', 'approved', etc.
      offer_id,       // Survey/offer ID
      signature       // For validation
    } = payload;

    // Verify signature if provided
    if (signature && CPX_WEBHOOK_SECRET) {
      // Implement signature verification based on CPX documentation
      // const expectedSignature = crypto.createHmac('sha256', CPX_WEBHOOK_SECRET)
      //   .update(/* sorted parameters */)
      //   .digest('hex');
    }

    if (status === 'completed' || status === 'approved') {
      // Extract our user ID from ext_user_id (format: earnflow_{userId})
      const userId = ext_user_id?.replace('earnflow_', '');

      if (!userId) {
        console.error('Invalid ext_user_id format:', ext_user_id);
        return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
      }

      // Convert amount to points (CPX sends in cents or dollars - check their docs)
      const payoutCents = parseInt(amount) || 0;
      const pointsEarned = payoutCents; // Adjust conversion as needed

      console.log(`User ${userId} earned ${pointsEarned} points from CPX (transaction: ${transaction_id})`);

      // Record completion and update balance
      try {
        const recordResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/surveys/complete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: parseInt(userId),
            surveyId: offer_id || transaction_id,
            surveyTitle: `CPX Offer ${offer_id || transaction_id}`,
            payoutCents,
            transactionId: transaction_id
          })
        });

        if (!recordResponse.ok) {
          console.error('Failed to record completion in database');
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }

        console.log('Successfully credited user balance');
      } catch (recordError) {
        console.error('Error recording completion:', recordError);
        return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
      }
    }

    // Always return success to CPX to avoid retries
    return new Response('OK', { status: 200 });

  } catch (error: any) {
    console.error('CPX Postback Error:', error.message);
    // Still return success to avoid CPX retries
    return new Response('OK', { status: 200 });
  }
}