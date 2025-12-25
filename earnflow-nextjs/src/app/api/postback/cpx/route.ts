import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import crypto from 'crypto';

// Helper function to check for duplicate transactions
async function isDuplicateTransaction(transactionId: string): Promise<boolean> {
  const count = await getPrisma().pointLog.count({
    where: { transactionId: transactionId },
  });
  return count > 0;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const userId = searchParams.get('user_id');
  const reward = searchParams.get('reward_local');
  const transactionId = searchParams.get('trans_id');
  const hash = searchParams.get('hash');
  const status = searchParams.get('status'); // CPX sends status, only process if '1' (approved)

  // 1. Validate secure hash
  const secureHashSecret = process.env.CPX_RESEARCH_SECURE_HASH;
  if (!secureHashSecret) {
    console.error('CPX Postback: CPX_RESEARCH_SECURE_HASH is not set in environment variables.');
    return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
  }

  const expectedHash = crypto.createHash('md5').update(`${userId}-${secureHashSecret}`).digest('hex');

  if (!hash || hash !== expectedHash) {
    console.error('CPX Postback: Invalid hash', { received: hash, expected: expectedHash });
    return NextResponse.json({ message: 'Invalid hash' }, { status: 401 });
  }

  // Only process if status is '1' (approved)
  if (status !== '1') {
    console.log('CPX Postback: Status is not approved, ignoring.', { transactionId, status });
    return NextResponse.json({ message: 'Status not approved, ignored' }, { status: 200 });
  }

  if (!userId || !reward || !transactionId) {
    console.error('CPX Postback: Missing required parameters', { userId, reward, transactionId });
    return NextResponse.json({ message: 'Missing required parameters' }, { status: 400 });
  }

  const parsedUserId = parseInt(userId);
  const parsedReward = parseInt(reward);

  if (isNaN(parsedUserId) || isNaN(parsedReward) || parsedReward <= 0) {
    console.error('CPX Postback: Invalid user ID or reward amount', { userId, reward });
    return NextResponse.json({ message: 'Invalid user ID or reward amount' }, { status: 400 });
  }

  try {
    // 2. Check for duplicate transaction IDs
    if (await isDuplicateTransaction(transactionId)) {
      console.warn('CPX Postback: Duplicate transaction ID', transactionId);
      return NextResponse.json({ message: 'Duplicate transaction ID' }, { status: 409 });
    }

    // 3. Update user's points balance and log transaction
    
    await getPrisma().$transaction(async (tx) => {
      // Find or create UserPoints entry
      let userPoints = await tx.userPoints.findUnique({
        where: { userId: parsedUserId },
      });

      if (!userPoints) {
        // If userPoints doesn't exist, create it (should ideally be created on user registration)
        userPoints = await tx.userPoints.create({
          data: { userId: parsedUserId, pointsBalance: parsedReward },
        });
      } else {
        await tx.userPoints.update({
          where: { userId: parsedUserId },
          data: {
            pointsBalance: { increment: parsedReward },
            updatedAt: new Date(),
          },
        });
      }

      await tx.pointLog.create({
        data: {
          userId: parsedUserId,
          action: 'CPX Research Survey',
          points: parsedReward,
          source: 'cpx',
          transactionId: transactionId,
          createdAt: new Date(),
        },
      });
    });

    return NextResponse.json({ message: 'OK' }, { status: 200 });
  } catch (error) {
    console.error('CPX Postback: Error processing transaction', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
