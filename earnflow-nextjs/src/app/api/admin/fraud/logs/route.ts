import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getPrisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { UserFlag, User } from '@prisma/client'; // Import Prisma generated types

// Define an interface for the UserFlag with its included User relation
interface UserFlagWithUser extends UserFlag {
  user: { name: string | null } | null;
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !(session.user as any)?.role || (session.user as any).role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }



  try {
    const fraudLogs = await getPrisma().userFlag.findMany({
      include: {
        user: {
          select: { name: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100, // Limit to recent logs
    });

    const logsWithUserName = fraudLogs.map((log: UserFlagWithUser) => ({
      ...log,
      userName: log.user?.name || 'N/A',
    }));

    return NextResponse.json({ fraudLogs: logsWithUserName });
  } catch (error) {
    console.error('Error fetching fraud logs for admin:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
