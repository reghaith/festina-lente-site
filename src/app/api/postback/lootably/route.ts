import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

// Helper function to check for duplicate transactions
async function isDuplicateTransaction(transactionId: string): Promise<boolean> {
  const count = await getPrisma().pointLog.count({
    where: { transactionId: transactionId },
  });
  return count > 0;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const secret = searchParams.get('secret');
  const userId = searchParams.get('user_id');
  const amount = searchParams.get('amount');
  const transactionId = searchParams.get('trans_id');

  // 1. Validate secret
  if (!process.env.LOOTABLY_POSTBACK_SECRET || secret !== process.env.LOOTABLY_POSTBACK_SECRET) {
    console.error('Lootably Postback: Invalid secret');
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  if (!userId || !amount || !transactionId) {
    console.error('Lootably Postback: Missing required parameters', { userId, amount, transactionId });
    return NextResponse.json({ message: 'Missing required parameters' }, { status: 400 });
  }

  const parsedAmount = parseInt(amount);

  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    console.error('Lootably Postback: Invalid amount', { amount });
    return NextResponse.json({ message: 'Invalid amount' }, { status: 400 });
  }

  try {
    // 2. Check for duplicate transaction IDs
    if (await isDuplicateTransaction(transactionId)) {
      console.warn('Lootably Postback: Duplicate transaction ID', transactionId);
      return NextResponse.json({ message: 'Duplicate transaction ID' }, { status: 409 });
    }

    // 3. Update user's points balance and log transaction

    await getPrisma().$transaction(async (tx) => {
      // Find or create UserPoints entry
      let userPoints = await tx.userPoints.findUnique({
        where: { userId: userId },
      });

       if (!userPoints) {
        // If userPoints doesn't exist, create it (should ideally be created on user registration)
        userPoints = await tx.userPoints.create({
          data: { userId: userId, pointsBalance: parsedAmount },
        });
      } else {
        await tx.userPoints.update({
          where: { userId: userId },
          data: {
            pointsBalance: { increment: parsedAmount },
            updatedAt: new Date(),
          },
        });
      }

      await tx.pointLog.create({
        data: {
          userId: userId,
          action: 'Lootably Offer',
          points: parsedAmount,
          source: 'lootably',
          transactionId: transactionId,
          createdAt: new Date(),
        },
      });
    });

    return NextResponse.json({ message: 'OK' }, { status: 200 });
  } catch (error) {
    console.error('Lootably Postback: Error processing transaction', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
