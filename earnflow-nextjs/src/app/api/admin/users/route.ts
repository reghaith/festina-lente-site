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
    const users = await getPrisma().user.findMany({
      include: {
        userPoints: {
          select: { pointsBalance: true },
        },
        userFlags: {
          where: { isActive: true },
          select: { flagType: true, createdAt: true },
        },
      },
    });

    const usersWithDetails = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      pointsBalance: user.userPoints?.pointsBalance || 0,
      fraudStatus: user.fraudStatus, // Use the new fraudStatus field
      flags: user.userFlags,
    }));

    return NextResponse.json({ users: usersWithDetails });
  } catch (error) {
    console.error('Error fetching users for admin:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
