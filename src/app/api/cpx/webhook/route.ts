import { NextRequest, NextResponse } from 'next/server';

// CPX Research webhook configuration
const CPX_WEBHOOK_SECRET = process.env.CPX_WEBHOOK_SECRET;
const CPX_API_KEY = process.env.CPX_API_KEY;

// CPX IP whitelist for security
const CPX_WHITELIST_IPS = [
  '188.40.3.73',
  '2a01:4f8:d0a:30ff::2',
  '157.90.97.92'
];

export async function POST(request: NextRequest) {
  try {
    // Get client IP for whitelist validation
    const clientIP = request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    'unknown';

    console.log('CPX Postback from IP:', clientIP);

    // Optional: Validate IP whitelist (uncomment for production)
    // if (!CPX_WHITELIST_IPS.includes(clientIP)) {
    //   console.warn('CPX Postback from non-whitelisted IP:', clientIP);
    //   return new Response('IP not whitelisted', { status: 403 });
    // }

    // CPX can send parameters in both URL query params and POST body
    const urlParams = request.nextUrl.searchParams;
    const formData = await request.formData();

    // Combine URL params and form data (form data takes precedence)
    const payload: Record<string, string> = {};

    // First, add URL parameters
    for (const [key, value] of urlParams.entries()) {
      payload[key] = value;
    }

    // Then add/overwite with form data
    for (const [key, value] of formData.entries()) {
      payload[key] = value.toString();
    }

    console.log('CPX Postback received:', payload);

    // Extract CPX postback parameters
    const {
      status,           // 1 = completed, 2 = canceled/fraud
      trans_id,         // unique transaction ID
      user_id,          // our user ID (earnflow_{userId})
      subid_1,          // our subId1
      subid_2,          // our subId2
      amount_local,     // amount in our currency
      amount_usd,       // amount in USD
      offer_id,         // survey/offer ID
      secure_hash,      // MD5 hash for validation
      ip_click,         // user click IP
      type              // type: out, complete, or bonus
    } = payload;

    // Validate secure hash if webhook secret is provided
    if (CPX_WEBHOOK_SECRET && trans_id && secure_hash) {
      const crypto = await import('crypto');
      const expectedHash = crypto.createHash('md5')
        .update(`${trans_id}-${CPX_WEBHOOK_SECRET}`)
        .digest('hex');

      if (secure_hash !== expectedHash) {
        console.error('CPX Hash validation failed:', {
          received: secure_hash,
          expected: expectedHash,
          trans_id
        });
        return new Response('Hash validation failed', { status: 403 });
      }
      console.log('CPX Hash validation successful');
    }

    // Extract our user ID from user_id (format: earnflow_{userId})
    const userId = user_id?.replace('earnflow_', '');

    if (!userId) {
      console.error('Invalid user_id format:', user_id);
      return new Response('Invalid user ID', { status: 400 });
    }

    const numericStatus = parseInt(status);
    const transactionId = trans_id;
    const payoutUSD = parseFloat(amount_usd) || 0; // USD amount CPX paid
    const payoutLocal = parseFloat(amount_local) || 0; // Amount in your currency (ef)
    const payoutPoints = Math.round(payoutLocal); // Use local currency for user credits

    console.log(`CPX Postback: User ${userId}, Status ${numericStatus}, USD: $${payoutUSD}, Local: ${payoutLocal} ef, Points: ${payoutPoints}, Transaction ${transactionId}`);

    // Handle different status codes
    if (numericStatus === 1) {
      // Status 1 = completed - credit the user
      console.log(`Crediting user ${userId} with ${payoutPoints} ef points`);

      try {
        const recordResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/surveys/complete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: parseInt(userId),
            surveyId: offer_id || transactionId,
            surveyTitle: `CPX ${type || 'Survey'} ${offer_id || transactionId}`,
            payoutCents: payoutPoints, // Now using ef points instead of USD cents
            transactionId
          })
        });

        if (!recordResponse.ok) {
          console.error('Failed to record completion in database');
          return new Response('Database update failed', { status: 500 });
        }

        console.log('Successfully credited user balance');
      } catch (recordError) {
        console.error('Error recording completion:', recordError);
        return new Response('Processing failed', { status: 500 });
      }

    } else if (numericStatus === 2) {
      // Status 2 = canceled/fraud - potentially reverse the credit
      console.log(`Fraud detection for user ${userId}, transaction ${transactionId} - reversing credit`);

      // TODO: Implement reversal logic
      // This would deduct the amount from user balance if it was previously credited
    }

    // Always return success to CPX to avoid retries
    return new Response('OK', { status: 200 });

  } catch (error: any) {
    console.error('CPX Postback Error:', error.message);
    // Still return success to avoid CPX retries
    return new Response('OK', { status: 200 });
  }
}