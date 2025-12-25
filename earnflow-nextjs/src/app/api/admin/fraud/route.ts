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
    const flaggedUsers = await getPrisma().user.findMany({
      where: {
        fraudStatus: {
          not: {
            in: ['clean', 'whitelisted'],
          },
        },
      },
      include: {
        userFlags: {
          where: { isActive: true },
          select: { flagType: true, createdAt: true },
        },
      },
    });

    const usersWithDetails = flaggedUsers.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      fraudStatus: user.fraudStatus,
      flags: user.userFlags,
    }));

    return NextResponse.json({ flaggedUsers: usersWithDetails });
  } catch (error) {
    console.error('Error fetching flagged users for admin fraud center:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
