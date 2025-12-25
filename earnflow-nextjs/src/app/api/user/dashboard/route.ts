import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getPrisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth'; // Corrected import path

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }



  const userId = parseInt(session.user.id as string); // Ensure userId is a number

  try {
    const userPoints = await getPrisma().userPoints.findUnique({
      where: { userId: userId },
      select: { pointsBalance: true },
    });

    const recentLogs = await getPrisma().pointLog.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { action: true, points: true, createdAt: true },
    });

    return NextResponse.json({
      pointsBalance: userPoints?.pointsBalance || 0,
      recentLogs: recentLogs,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
