import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getPrisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session || !(session.user as any)?.role || (session.user as any).role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }



  const resolvedParams = await context.params; // Await the promise
  const withdrawalId = parseInt(resolvedParams.id);
  const { action } = await request.json();

  if (isNaN(withdrawalId)) {
    return NextResponse.json({ message: 'Invalid Withdrawal ID' }, { status: 400 });
  }

  try {
    const withdrawal = await getPrisma().withdrawal.findUnique({
      where: { id: withdrawalId },
    });

    if (!withdrawal) {
      return NextResponse.json({ message: 'Withdrawal request not found' }, { status: 404 });
    }

    if (withdrawal.status !== 'pending') {
      return NextResponse.json({ message: 'Withdrawal request already processed' }, { status: 400 });
    }

    await getPrisma().$transaction(async (tx) => {
      if (action === 'approve') {
        await tx.withdrawal.update({
          where: { id: withdrawalId },
          data: { status: 'approved', processedAt: new Date() },
        });
      } else if (action === 'reject') {
        // Refund points to the user
        await tx.userPoints.update({
          where: { userId: withdrawal.userId },
          data: {
            pointsBalance: { increment: withdrawal.pointsRequested },
            updatedAt: new Date(),
          },
        });

        // Log the refund
        await tx.pointLog.create({
          data: {
            userId: withdrawal.userId,
            action: 'Withdrawal Refund',
            points: withdrawal.pointsRequested,
            source: 'system',
            createdAt: new Date(),
          },
        });

        await tx.withdrawal.update({
          where: { id: withdrawalId },
          data: { status: 'rejected', processedAt: new Date() },
        });
      } else {
        return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
      }
    });

    return NextResponse.json({ message: `Withdrawal ${action} successful.` });
  } catch (error) {
    console.error(`Error performing ${action} action for withdrawal ${withdrawalId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
