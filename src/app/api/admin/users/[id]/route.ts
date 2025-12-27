import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/server-auth';
import { getPrisma } from '@/lib/prisma';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }


  const resolvedParams = await context.params; // Await the promise
  const targetUserId = resolvedParams.id;
  const { action } = await request.json();

  try {
    const targetUser = await getPrisma().user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    let newFraudStatus: string | null = null;

    switch (action) {
      case 'ban':
        newFraudStatus = 'banned';
        // Deactivate all flags when banning
        await getPrisma().userFlag.updateMany({
          where: { userId: targetUserId },
          data: { isActive: false },
        });
        break;
      case 'unban':
        newFraudStatus = 'clean';
        // Deactivate all flags when unbanning
        await getPrisma().userFlag.updateMany({
          where: { userId: targetUserId },
          data: { isActive: false },
        });
        break;
      case 'whitelist':
        newFraudStatus = 'whitelisted';
        // Deactivate all flags when whitelisting
        await getPrisma().userFlag.updateMany({
          where: { userId: targetUserId },
          data: { isActive: false },
        });
        break;
      default:
        return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

    if (newFraudStatus) {
        await getPrisma().user.update({
            where: { id: targetUserId },
            data: { fraudStatus: newFraudStatus },
        });
    }

    return NextResponse.json({ message: `User ${action} successful.` });
  } catch (error) {
    console.error(`Error performing ${action} action for user ${targetUserId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
