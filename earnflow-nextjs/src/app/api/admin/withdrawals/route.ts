import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getPrisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !(session.user as any)?.role || (session.user as any).role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }



  try {
    const withdrawals = await getPrisma().withdrawal.findMany({
      include: {
        user: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: {
        requestedAt: 'desc',
      },
    });

    const withdrawalsWithUserName = withdrawals.map(withdrawal => ({
      ...withdrawal,
      userName: withdrawal.user?.user?.name || 'N/A',
    }));

    return NextResponse.json({ withdrawals: withdrawalsWithUserName });
  } catch (error) {
    console.error('Error fetching withdrawals for admin:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
