import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getPrisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }



  const userId = parseInt(session.user.id as string);

  try {
    const userPoints = await getPrisma().userPoints.findUnique({
      where: { userId: userId },
      select: { pointsBalance: true },
    });

    const withdrawals = await getPrisma().withdrawal.findMany({
      where: { userId: userId },
      orderBy: { requestedAt: 'desc' },
    });

    return NextResponse.json({
      pointsBalance: userPoints?.pointsBalance || 0,
      withdrawals: withdrawals,
    });
  } catch (error) {
    console.error('Error fetching withdrawal data:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
