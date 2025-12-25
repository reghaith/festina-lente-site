import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getPrisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const MIN_WITHDRAWAL_POINTS = 5000; // $5

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }



  const userId = parseInt(session.user.id as string);
  const { pointsAmount, paymentMethod, paymentAddress } = await request.json();

  const parsedPointsAmount = parseInt(pointsAmount);

  if (isNaN(parsedPointsAmount) || parsedPointsAmount < MIN_WITHDRAWAL_POINTS) {
    return NextResponse.json({ message: `Minimum withdrawal is ${MIN_WITHDRAWAL_POINTS} points.` }, { status: 400 });
  }
  if (!paymentMethod || !paymentAddress) {
    return NextResponse.json({ message: 'Payment method and address are required.' }, { status: 400 });
  }

  try {
    // Check user's current balance
    const userPoints = await getPrisma().userPoints.findUnique({
      where: { userId: userId },
      select: { pointsBalance: true },
    });

    if (!userPoints || userPoints.pointsBalance < parsedPointsAmount) {
      return NextResponse.json({ message: 'Insufficient points balance.' }, { status: 400 });
    }

    // Check for pending withdrawals
    const pendingWithdrawal = await getPrisma().withdrawal.findFirst({
      where: { userId: userId, status: 'pending' },
    });
    if (pendingWithdrawal) {
      return NextResponse.json({ message: 'You already have a pending withdrawal request.' }, { status: 400 });
    }

    // Check for rate limiting (1 withdrawal per 24h)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentWithdrawal = await getPrisma().withdrawal.findFirst({
      where: { userId: userId, requestedAt: { gte: twentyFourHoursAgo } },
    });
    if (recentWithdrawal) {
      return NextResponse.json({ message: 'You can only make one withdrawal request per 24 hours.' }, { status: 400 });
    }

    // Deduct points and create withdrawal record in a transaction
    await getPrisma().$transaction(async (tx) => {
      await tx.userPoints.update({
        where: { userId: userId },
        data: {
          pointsBalance: { decrement: parsedPointsAmount },
          updatedAt: new Date(),
        },
      });

      await tx.pointLog.create({
        data: {
          userId: userId,
          action: 'Withdrawal Request',
          points: -parsedPointsAmount, // Log as negative
          source: 'withdrawal',
          createdAt: new Date(),
        },
      });

      await tx.withdrawal.create({
        data: {
          userId: userId,
          pointsRequested: parsedPointsAmount,
          amountUsd: parsedPointsAmount / 1000, // Assuming 1000 points = $1
          paymentMethod: paymentMethod,
          paymentAddress: paymentAddress,
          status: 'pending',
          requestedAt: new Date(),
        },
      });
    });

    return NextResponse.json({ message: 'Withdrawal request submitted successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Error submitting withdrawal request:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
